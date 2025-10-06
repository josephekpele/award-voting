from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # <- IMPORTANT: +psycopg et localhost
    # DATABASE_URL: str = "postgresql+psycopg://postgres:josephEK99@localhost:5432/award_voting"
    DATABASE_URL: str = "postgresql://postgres:postgres@172.17.0.1:5432/award_voting"

settings = Settings()

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
