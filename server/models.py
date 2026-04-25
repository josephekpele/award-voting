from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column

try:
    from .db import Base
except ImportError:
    from db import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    number: Mapped[int] = mapped_column(Integer, nullable=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    photo_url: Mapped[str] = mapped_column(String(500), nullable=True)
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True)
    votes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    logs: Mapped[list["VoteLog"]] = relationship("VoteLog", back_populates="candidate")


class VoteLog(Base):
    __tablename__ = "vote_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    candidate_id: Mapped[int] = mapped_column(ForeignKey("candidates.id", ondelete="CASCADE"), index=True)
    ip: Mapped[str] = mapped_column(String(64), index=True)
    user_agent: Mapped[str] = mapped_column(String(300))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    candidate: Mapped[Candidate] = relationship("Candidate", back_populates="logs")

    __table_args__ = (
        UniqueConstraint('candidate_id', 'ip', 'user_agent', name='uq_candidate_ip_ua'),
    )
    
class DuplicateVoteAttempt(Base):
    __tablename__ = "duplicate_vote_attempts"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    ip = Column(String(100))
    user_agent = Column(Text)
    attempted_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate")


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    candidate_id: Mapped[int] = mapped_column(ForeignKey("candidates.id", ondelete="CASCADE"), index=True)
    phone_number: Mapped[str] = mapped_column(String(20), nullable=False)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    vote_count: Mapped[int] = mapped_column(Integer, nullable=False)
    network: Mapped[str] = mapped_column(String(10), nullable=False)  # FLOOZ or TMONEY
    tx_reference: Mapped[str] = mapped_column(String(100), nullable=True)
    status: Mapped[int] = mapped_column(Integer, default=0)  # 0: pending, 1: success, 2: failed
    description: Mapped[str] = mapped_column(String(200), nullable=True)
    identifier: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    candidate: Mapped[Candidate] = relationship("Candidate")