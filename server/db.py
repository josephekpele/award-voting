from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from pydantic_settings import BaseSettings, SettingsConfigDict, PydanticBaseSettingsSource
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
        env_file_encoding='utf-8',
        # En conteneur Docker, on doit toujours privilégier la variable d'environnement.
        # Si DATABASE_URL est fournie via docker run / secrets, Pydantic la prendra en priorité.
        case_sensitive=False,
    )

class SettingsWithSources(Settings):
    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls,
        init_settings,
        env_settings,
        dotenv_settings,
        file_secret_settings,
    ):
# Priorité stricte: variables d'environnement -> .env -> secrets
        # MAIS: si DATABASE_URL n'est pas dans l'environnement, on évite de retomber
        # sur une valeur stale dans alembic.ini / fichier local en contournant ce modèle.
        return (
            env_settings,
            dotenv_settings,
            file_secret_settings,
        )


settings = SettingsWithSources()

# Log the DATABASE_URL being used (sans leak complet)
# Log minimal to avoid leaking credentials
logger.info("🔌 Connecting to database via DATABASE_URL env/file.")

# Important: Alembic lit aussi DATABASE_URL via env.py.
# Ici on s'appuie uniquement sur la valeur fournie à l'exécution.
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
