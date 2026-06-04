# Ekklesia Impact Award 2025 API (FastAPI)


## Configuration Database

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
- GitHub: `Settings → Secrets → DATABASE_URL`
- GitHub Actions: reads `secrets.DATABASE_URL` and passes via `-e DATABASE_URL="..."`
- Docker: maps to FastAPI container as environment variable
- Application: `pydantic_settings` loads from environment (priority 1)


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