#!/bin/bash
# Script pour attendre que PostgreSQL soit prêt

set -e

echo "Attente de PostgreSQL..."
until PGPASSWORD=password psql -h db -U greenit -d greenit_db -c "SELECT 1;" > /dev/null 2>&1; do
  echo "PostgreSQL pas encore disponible - nouvelle tentative dans 2 secondes"
  sleep 2
done

echo "PostgreSQL est prêt, démarrage de l'application..."
exec "$@" 