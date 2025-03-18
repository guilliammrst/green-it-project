FROM python:3.9-slim

WORKDIR /app

# Installer les outils nécessaires
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Copier le script d'attente
COPY wait-db.sh .
RUN chmod +x wait-db.sh

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier tout le contenu de l'API
COPY . .

EXPOSE 3000

# Utiliser le script pour attendre PostgreSQL
CMD ["./wait-db.sh", "python", "app.py"] 