from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from pydantic_settings import BaseSettings, SettingsConfigDict
import logging
import os

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    """
    Charge les variables d'environnement depuis:
    1. Variables d'environnement (secrets Docker/VPS) - PRIORITÉ 1
    2. Fichier .env dans le dossier server/ - PRIORITÉ 2
    3. Doit être défini, sinon lève une erreur
    """
    DATABASE_URL: str  # Obligatoire, doit venir de l'env ou .env
    
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), '.env'),
        env_file_encoding='utf-8'
    )

settings = Settings()

# Log the DATABASE_URL being used
logger.info(f"🔌 Connecting to database: {settings.DATABASE_URL}")

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
