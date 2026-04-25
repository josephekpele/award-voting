from fastapi import FastAPI, Depends, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from slugify import slugify
from typing import List, Dict
import requests
import uuid
import os

try:
    from .db import Base, engine, get_db
    from . import models, schemas
except ImportError:
    from db import Base, engine, get_db
    import models, schemas

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ekklesia Impact Award 2025 API", version="1.0.0")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ou ["http://localhost:8080"] pour être plus strict
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- WebSocket broadcast manager -----
class ConnectionManager:
    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active:
            self.active.remove(websocket)

    async def broadcast(self, message: dict):
        living = []
        for ws in self.active:
            try:
                await ws.send_json(message)
                living.append(ws)
            except Exception:
                pass
        self.active = living

manager = ConnectionManager()

# ----- Helpers -----

def serialize_all_candidates(db: Session) -> List[schemas.CandidateOut]:
    rows = db.query(models.Candidate).order_by(models.Candidate.votes.desc(), models.Candidate.name.asc()).all()
    return [schemas.CandidateOut.model_validate(r) for r in rows]

# ----- Routes -----

@app.get("/api/candidates", response_model=List[schemas.CandidateOut])
def list_candidates(db: Session = Depends(get_db)):
    return serialize_all_candidates(db)

@app.post("/api/candidates", response_model=schemas.CandidateOut)
def create_candidate(payload: schemas.CandidateIn, db: Session = Depends(get_db)):
    slug_base = slugify(payload.name)
    slug = slug_base
    i = 1
    while db.query(models.Candidate).filter(models.Candidate.slug == slug).first() is not None:
        i += 1
        slug = f"{slug_base}-{i}"

    c = models.Candidate(
        name=payload.name,
        number=payload.number,
        photo_url=str(payload.photo_url) if payload.photo_url else None,
        slug=slug
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return c

@app.get("/api/candidates/{slug}", response_model=schemas.CandidateOut)
def get_candidate(slug: str, db: Session = Depends(get_db)):
    c = db.query(models.Candidate).filter(models.Candidate.slug == slug).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return c

@app.post("/api/candidates/{slug}/vote", response_model=schemas.VoteResponse)
def vote(slug: str, request: Request, db: Session = Depends(get_db)):
    c = db.query(models.Candidate).filter(models.Candidate.slug == slug).with_for_update().first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")

    ip = request.headers.get("x-forwarded-for", request.client.host) or "unknown"
    ua = request.headers.get("user-agent", "unknown")[:300]

    # 🔒 Vérifier s'il y a déjà eu un vote avec cette IP et user-agent (peu importe le candidat)
    existing_vote = db.query(models.VoteLog).filter_by(ip=ip, user_agent=ua).first()
    if existing_vote:
        raise HTTPException(
            status_code=409,
            detail="Vous avez déjà voté depuis cet appareil."
        )

    log = models.VoteLog(candidate_id=c.id, ip=ip, user_agent=ua)
    db.add(log)

    try:
        c.votes += 1
        db.add(c)
        db.commit()
        db.refresh(c)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Erreur : Vous avez déjà voté depuis cet appareil."
        )

    return schemas.VoteResponse(
        ok=True,
        message="Votre vote a bien été pris en compte.",
        candidate=c
    )

@app.post("/api/candidates/{slug}/pay", response_model=schemas.PaymentResponse)
async def pay_and_vote(slug: str, payload: schemas.PaymentIn, db: Session = Depends(get_db)):
    c = db.query(models.Candidate).filter(models.Candidate.slug == slug).with_for_update().first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # Generate unique identifier
    identifier = str(uuid.uuid4())

    # PayGateGlobal API call
    auth_token = os.getenv("PAYGATE_AUTH_TOKEN")
    if not auth_token:
        raise HTTPException(status_code=500, detail="Payment service not configured")

    api_url = "https://paygateglobal.com/api/v1/pay"
    data = {
        "auth_token": auth_token,
        "phone_number": payload.phone_number,
        "amount": payload.amount,
        "description": payload.description or f"Vote for {c.name}",
        "identifier": identifier,
        "network": payload.network.upper()
    }

    try:
        response = requests.post(api_url, json=data, timeout=30)
        response.raise_for_status()
        result = response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Payment service error: {str(e)}")

    status = result.get("status")
    tx_reference = result.get("tx_reference")

    if status != 0:
        # Create payment record with failed status
        payment = models.Payment(
            candidate_id=c.id,
            phone_number=payload.phone_number,
            amount=payload.amount,
            vote_count=payload.vote_count,
            network=payload.network,
            tx_reference=tx_reference,
            status=status or 2,  # 2 for failed
            description=payload.description,
            identifier=identifier
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)

        error_messages = {
            2: "Jeton d'authentification invalide",
            4: "Paramètres invalides",
            6: "Doublons détectés"
        }
        message = error_messages.get(status, "Erreur de paiement inconnue")
        raise HTTPException(status_code=400, detail=message)

    # Payment successful, add votes and record payment
    payment = models.Payment(
        candidate_id=c.id,
        phone_number=payload.phone_number,
        amount=payload.amount,
        vote_count=payload.vote_count,
        network=payload.network,
        tx_reference=tx_reference,
        status=1,  # success
        description=payload.description,
        identifier=identifier
    )
    db.add(payment)

    c.votes += payload.vote_count
    db.add(c)
    db.commit()
    db.refresh(c)
    db.refresh(payment)

    # Broadcast update
    data = [schemas.CandidateOut.model_validate(row).model_dump() for row in serialize_all_candidates(db)]
    await manager.broadcast({"type": "scoreboard", "payload": data})

    return schemas.PaymentResponse(
        ok=True,
        message="Paiement et vote enregistrés avec succès.",
        payment=payment,
        candidate=c
    )
    
@app.get("/api/duplicates", response_model=list[schemas.DuplicateVoteSchema])
def get_duplicate_votes(db: Session = Depends(get_db)):
    return db.query(models.DuplicateVoteAttempt).order_by(models.DuplicateVoteAttempt.attempted_at.desc()).all()

@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    await manager.connect(websocket)
    try:
        # Push initial scoreboard
        data = [schemas.CandidateOut.model_validate(row).model_dump() for row in serialize_all_candidates(db)]
        await websocket.send_json({"type": "scoreboard", "payload": data})
        while True:
            # Keep the socket alive; clients don't need to send messages
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)