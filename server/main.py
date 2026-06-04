from fastapi import FastAPI, Depends, HTTPException, Request, WebSocket, WebSocketDisconnect, UploadFile, File, Query, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from slugify import slugify
from typing import List, Dict, Optional

import requests
import uuid
import os
from datetime import datetime

try:
    from .db import Base, engine, get_db
    from . import models, schemas
    from .award_config import AwardConfig
except ImportError:
    from db import Base, engine, get_db
    import models, schemas
    from award_config import AwardConfig




Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ekklesia Impact Award 2025 API", version="1.0.0")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://ekklesia-awards.netlify.app",
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


def serialize_award_stats(db: Session, year: int):
    # total votes for the year
    total_votes = db.query(models.Candidate).filter(models.Candidate.year == year).with_entities(models.Candidate.votes).all()
    total_votes_sum = sum(v[0] or 0 for v in total_votes)

    # get end date from config
    cfg = db.query(AwardConfig).filter(AwardConfig.year == year).first() or db.query(AwardConfig).order_by(AwardConfig.id.desc()).first()
    vote_end_at = cfg.vote_end_at if cfg else None

    return {
        "year": year,
        "total_votes": total_votes_sum,
        "vote_end_at": vote_end_at.isoformat() if vote_end_at else None,
    }


# ----- Routes -----

# Ensure uploads directory is consistent between server and project root.
PROJECT_ROOT = os.path.join(os.path.dirname(os.path.dirname(__file__)))
TARGET_UPLOADS = os.path.join(PROJECT_ROOT, "uploads")
SERVER_UPLOADS = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(TARGET_UPLOADS, exist_ok=True)

# Move any files left in server/uploads to project-root/uploads so StaticFiles can serve them
if os.path.exists(SERVER_UPLOADS):
    try:
        for fname in os.listdir(SERVER_UPLOADS):
            src = os.path.join(SERVER_UPLOADS, fname)
            dst = os.path.join(TARGET_UPLOADS, fname)
            if os.path.exists(src) and not os.path.exists(dst):
                os.rename(src, dst)
    except Exception:
        pass

@app.get("/api/candidates", response_model=List[schemas.CandidateOut])
def list_candidates(
    year: Optional[int] = Query(None, description="Filtrer par annee"),
    page: int = Query(1, ge=1, description="Page (commence à 1)"),
    page_size: int = Query(20, ge=1, le=100, description="Taille de page"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Candidate)
    if year is not None:
        query = query.filter(models.Candidate.year == year)

    query = query.order_by(models.Candidate.votes.desc(), models.Candidate.name.asc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    rows = query.all()

    # Ajout du rang (position) basé sur le tri utilisé par la requête.
    # Exemple : première ligne => rank=1.
    return [
        {**schemas.CandidateOut.model_validate(r).model_dump(), "rank": idx + 1}
        for idx, r in enumerate(rows)
    ]




@app.post("/api/candidates", response_model=schemas.CandidateOut)
def create_candidate(payload: schemas.CandidateIn, db: Session = Depends(get_db)):
    slug_base = slugify(payload.name)
    slug = slug_base
    i = 1
    while db.query(models.Candidate).filter(models.Candidate.slug == slug).first() is not None:
        i += 1
        slug = f"{slug_base}-{i}"

    # Déterminer le numéro du candidat (incrémental) si non fourni
    if payload.number is None:
        max_number = db.query(func.max(models.Candidate.number)).scalar()
        next_number = (max_number or 0) + 1
    else:
        next_number = payload.number

    # Définir l'année du candidat (année en cours si non fournie)
    candidate_year = payload.year if getattr(payload, 'year', None) is not None else datetime.utcnow().year

    c = models.Candidate(
        name=payload.name,
        number=next_number,
        photo_url=str(payload.photo_url) if payload.photo_url else None,
        slug=slug,
        year=candidate_year,
    )

    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@app.post("/api/inscription", response_model=schemas.InscriptionOut)
async def register_candidate(
    prenom: str = Form(...),
    nom: str = Form(...),
    sexe: str = Form(...),
    whatsapp: str = Form(...),
    eglise: str = Form(...),
    biographie: str = Form(...),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """
    Endpoint d'inscription des candidats
    Accepte: prenom, nom, sexe, whatsapp, eglise, biographie, photo (optionnel)
    """
    try:
        # Générer un slug unique basé sur le nom complet
        full_name = f"{prenom} {nom}"
        slug_base = slugify(full_name)
        slug = slug_base
        i = 1
        while db.query(models.Candidate).filter(models.Candidate.slug == slug).first() is not None:
            i += 1
            slug = f"{slug_base}-{i}"

        # Gérer l'upload de la photo si fournie
        photo_url = None
        if photo and photo.filename:
            # Créer le dossier uploads dans le dossier project-root (même dossier que la galerie)
            uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
            if not os.path.exists(uploads_dir):
                os.makedirs(uploads_dir, exist_ok=True)
            
            # Générer un nom de fichier unique
            file_ext = os.path.splitext(photo.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            file_path = os.path.join(uploads_dir, unique_filename)
            
            # Sauvegarder le fichier
            contents = await photo.read()
            with open(file_path, "wb") as f:
                f.write(contents)
            
            photo_url = f"/uploads/{unique_filename}"

        # Déterminer le numéro du candidat (incrémental)
        max_number = db.query(func.max(models.Candidate.number)).scalar()
        next_number = (max_number or 0) + 1

        # Définir l'année du candidat (année en cours)
        candidate_year = datetime.utcnow().year

        # Créer le candidat avec tous les champs
        candidate = models.Candidate(
            prenom=prenom,
            name=nom,  # Le champ 'name' stocke le nom de famille
            sexe=sexe,
            whatsapp=whatsapp,
            eglise=eglise,
            biographie=biographie,
            photo_url=photo_url,
            slug=slug,
            number=next_number,
            year=candidate_year,
        )

        db.add(candidate)
        db.commit()
        db.refresh(candidate)

        return schemas.InscriptionOut(
            ok=True,
            message=f"Inscription réussie ! Bienvenue {prenom} {nom}.",
            candidate=candidate
        )

    except Exception as e:
        db.rollback()
        return schemas.InscriptionOut(
            ok=False,
            message=f"Erreur lors de l'inscription: {str(e)}",
            candidate=None
        )


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

# ----- Gallery Routes -----

# Dossier pour stocker les images
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "gallery")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Monter le dossier static pour servir les images
app.mount("/uploads", StaticFiles(directory=os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")), name="uploads")

@app.get("/api/gallery", response_model=list[schemas.GalleryImageOut])
def list_gallery(
    is_winner: int = Query(None, description="Filtrer par type: 0=gallerie, 1=laureat"),
    year: int = Query(None, description="Filtrer par annee"),
    category: str = Query(None, description="Filtrer par categorie"),
    db: Session = Depends(get_db)
):
    query = db.query(models.GalleryImage)
    
    if is_winner is not None:
        query = query.filter(models.GalleryImage.is_winner == is_winner)
    if year is not None:
        query = query.filter(models.GalleryImage.year == year)
    if category is not None:
        query = query.filter(models.GalleryImage.category == category)
    
    return query.order_by(models.GalleryImage.created_at.desc()).all()

@app.post("/api/gallery", response_model=schemas.GalleryImageOut)
async def add_gallery_image(
    file: UploadFile = File(...),
    description: str = None,
    is_winner: int = Form(0),
    year: int = Form(None),
    category: str = Form(None),
    candidate_name: str = Form(None),
    db: Session = Depends(get_db)
):
    # Générer un nom de fichier unique
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    # Sauvegarder le fichier
    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Créer l'entrée en base
    image_url = f"/uploads/gallery/{filename}"
    image = models.GalleryImage(
        image_url=image_url,
        description=description,
        is_winner=is_winner,
        year=year,
        category=category,
        candidate_name=candidate_name
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    return image

@app.delete("/api/gallery/{image_id}", response_model=dict)
def delete_gallery_image(image_id: int, db: Session = Depends(get_db)):
    image = db.query(models.GalleryImage).filter(models.GalleryImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Supprimer le fichier physique
    filepath = os.path.join(UPLOAD_DIR, os.path.basename(image.image_url))
    if os.path.exists(filepath):
        os.remove(filepath)
    
    db.delete(image)
    db.commit()
    return {"ok": True, "message": "Image deleted"}

@app.get("/api/award-stats", response_model=dict)
def get_award_stats(year: int = Query(None, description="Année"), db: Session = Depends(get_db)):
    if year is None:
        from datetime import datetime
        year = datetime.utcnow().year
    return serialize_award_stats(db, year)


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