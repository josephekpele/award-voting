# Ekklesia Impact Award 2025 API (FastAPI)


## Configuration Database

### 🔧 Système de configuration

DATABASE_URL charge depuis (ordre de priorité):
1. **Variable d'environnement** `DATABASE_URL` (Docker secrets/VPS) ✅ PRIORITÉ 1
2. **Fichier `.env`** (développement local)
3. Pas de valeur par défaut → erreur si rien n'est défini

```python
# server/db.py
class Settings(BaseSettings):
    DATABASE_URL: str  # Doit être défini depuis env ou .env
    model_config = SettingsConfigDict(
        env_file='.env'  # Fallback sur .env
    )
```

### 🎯 Alembic (Migrations)

**IMPORTANT**: `alembic/env.py` lit aussi `DATABASE_URL` depuis l'environnement (même priorité que FastAPI):
```python
# alembic/env.py
database_url = os.getenv("DATABASE_URL")
if database_url:
    config.set_main_option("sqlalchemy.url", database_url)
```

Cela signifie:
- ✅ En VPS: `-e DATABASE_URL="...172.17.0.1..."` → Alembic l'utilise
- ✅ En local: `.env` avec localhost → Alembic l'utilise

### Development Local
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your local PostgreSQL credentials:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/award_voting
   ```

### Production (VPS)
The database URL is injected via GitHub Secrets → Docker environment variable:
- GitHub: `Settings → Secrets → DATABASE_URL` = `postgresql://joseph:josephEK99@172.17.0.1:5432/award_voting`
- GitHub Actions: reads `secrets.DATABASE_URL` and passes via `-e DATABASE_URL="..."`
- Entrypoint: `alembic/env.py` reads from environment variable
- FastAPI: `pydantic_settings` also reads from environment variable


## Install & Run


```bash
cd server
python -m venv .venv
source .venv/bin/activate # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
python -m server.seed
uvicorn server.main:app --reload --port 8000
```


API base: http://localhost:8000


Endpoints:
- `GET /api/candidates` – list with votes
- `POST /api/candidates` – create `{ name, photo_url? }`
- `GET /api/candidates/{slug}` – single
- `POST /api/candidates/{slug}/vote` – vote
- `WS /ws` – scoreboard updates
```


---


## ⚛️ client/package.json
```json
{
"name": "award-voting-client",
"private": true,
"version": "0.0.1",
"type": "module",
"scripts": {
"dev": "vite",
"build": "vite build",
"preview": "vite preview"
},
"dependencies": {
"react": "18.3.1",
"react-dom": "18.3.1"
},
"devDependencies": {
"@vitejs/plugin-react": "4.3.2",
"vite": "5.4.8"
}
}