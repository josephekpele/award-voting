FROM python:3.12-slim
WORKDIR /app

# Contexte = racine → on peut copier server/...
COPY server/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY server /app/server

# Copier le script d'entrypoint et le rendre exécutable
COPY server/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 8003
ENTRYPOINT ["/app/entrypoint.sh"]