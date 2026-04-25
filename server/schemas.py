from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class CandidateOut(BaseModel):
    id: int
    number: Optional[int] = None
    name: str
    photo_url: Optional[str] = None
    slug: str
    votes: int

    class Config:
        from_attributes = True


class CandidateIn(BaseModel):
    name: str
    number: Optional[int] = None
    photo_url: Optional[HttpUrl] = None


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
        orm_mode = True


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
