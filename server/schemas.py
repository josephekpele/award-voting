from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class CandidateOut(BaseModel):
    id: int
    name: str
    photo_url: Optional[str] = None
    slug: str
    votes: int

    class Config:
        from_attributes = True


class CandidateIn(BaseModel):
    name: str
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
