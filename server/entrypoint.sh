#!/bin/bash
set -e

echo "🔄 Running Alembic migrations..."
cd /app/server
alembic upgrade head

echo "✅ Migrations completed. Starting application..."
exec uvicorn server.main:app --host 0.0.0.0 --port 8003
