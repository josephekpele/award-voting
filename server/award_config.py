from datetime import datetime

from sqlalchemy import Integer, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

try:
    from .db import Base
except ImportError:
    from db import Base


class AwardConfig(Base):
    __tablename__ = "award_config"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Date/heure à laquelle le vote se termine
    vote_end_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    # année en cours (optionnel, utile si vous gérez plusieurs éditions)
    year: Mapped[int] = mapped_column(Integer, nullable=True, index=True)

    # libellé facultatif
    name: Mapped[str] = mapped_column(String(120), nullable=True)

