FROM python:3.12-slim
WORKDIR /app

# chemins relatifs au CONTEXTE RACINE
COPY server/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY server /app/server

EXPOSE 8002
CMD ["uvicorn","server.main:app","--host","0.0.0.0","--port","8002"]