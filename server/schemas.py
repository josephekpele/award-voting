from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime


class CandidateOut(BaseModel):
    id: int
    number: Optional[int] = None
    name: str
    prenom: Optional[str] = None
    sexe: Optional[str] = None
    whatsapp: Optional[str] = None
    eglise: Optional[str] = None
    biographie: Optional[str] = None
    photo_url: Optional[str] = None
    slug: str
    votes: int
    year: Optional[int] = None
    created_at: Optional[datetime] = None
    # rank est calculé dans GET /api/candidates (ordre: votes DESC, name ASC)
    rank: Optional[int] = None


    class Config:
        from_attributes = True


class CandidateIn(BaseModel):
    name: str
    number: Optional[int] = None
    photo_url: Optional[HttpUrl] = None
    year: Optional[int] = None


class InscriptionIn(BaseModel):
    """Schéma pour l'inscription des candidats via le formulaire"""
    prenom: str
    nom: str
    sexe: str  # male, female
    whatsapp: str
    eglise: str
    biographie: str


class InscriptionOut(BaseModel):
    """Réponse après inscription"""
    ok: bool
    message: str
    candidate: Optional['CandidateOut'] = None

    class Config:
        from_attributes = True


class VoteResponse(BaseModel):
    ok: bool
    message: str
    candidate: CandidateOut

    class Config:
        from_attributes = True


class DuplicateVoteSchema(BaseModel):
    id: int
    candidate_id: int
    ip: str
    user_agent: str
    attempted_at: datetime

    class Config:
        from_attributes = True


class PaymentIn(BaseModel):
    phone_number: str
    amount: int
    vote_count: int
    network: str  # FLOOZ or TMONEY
    description: Optional[str] = None


class PaymentOut(BaseModel):
    id: int
    candidate_id: int
    phone_number: str
    amount: int
    vote_count: int
    network: str
    tx_reference: Optional[str] = None
    status: int
    description: Optional[str] = None
    identifier: str
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentResponse(BaseModel):
    ok: bool
    message: str
    payment: PaymentOut
    candidate: CandidateOut

    class Config:
        from_attributes = True


class GalleryImageIn(BaseModel):
    image_url: HttpUrl
    description: Optional[str] = None
    is_winner: Optional[int] = 0  # 0: gallery, 1: winner/laureat
    year: Optional[int] = None
    category: Optional[str] = None
    candidate_name: Optional[str] = None


class GalleryImageOut(BaseModel):
    id: int
    image_url: str
    description: Optional[str] = None
    is_winner: int = 0
    year: Optional[int] = None
    category: Optional[str] = None
    candidate_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

