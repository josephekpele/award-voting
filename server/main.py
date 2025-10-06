from fastapi import FastAPI, Depends, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from slugify import slugify
from typing import List, Dict

from .db import Base, engine, get_db
from . import models, schemas

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Award Voting API", version="1.0.0")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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

    c = models.Candidate(name=payload.name, photo_url=str(payload.photo_url) if payload.photo_url else None, slug=slug)
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

    log = models.VoteLog(candidate_id=c.id, ip=ip, user_agent=ua)
    db.add(log)
    try:
        c.votes += 1
        db.add(c)
        db.commit()
        db.refresh(c)
    except IntegrityError:
        db.rollback()
        # Duplicate vote from same IP for this candidate
        raise HTTPException(status_code=409, detail="Vous avez déjà voté pour ce candidat depuis cet appareil.")

    # Broadcast fresh scoreboard
    data = [schemas.CandidateOut.model_validate(row).model_dump() for row in serialize_all_candidates(db)]
    import anyio
    anyio.from_thread.run(manager.broadcast, {"type": "scoreboard", "payload": data})

    return schemas.VoteResponse(ok=True, message="Vote counted!", candidate=c)

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