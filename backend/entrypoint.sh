#!/bin/sh

# Exits if an error happens
set -e

# Attendre que PostgreSQL soit prêt à accepter des connexions
while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
    echo 'Waiting for PostgreSQL...'
    sleep 0.5
done

# Créer les dossiers nécessaires pour les médias et les fichiers statiques
echo "Creating necessary directories..."
mkdir -p /app/static
mkdir -p /app/media/avatars
mkdir -p /app/staticfiles

# Définir les permissions appropriées
echo "Setting correct permissions..."
chmod -R 755 /app/static
chmod -R 755 /app/media
chmod -R 755 /app/staticfiles

# Nettoyer et recréer les migrations si nécessaire
if python3 /app/manage.py showmigrations --plan | grep '\[ \]'; then
    echo "Cleaning up migrations..."
    # Supprimer les anciens fichiers de migration (sauf __init__.py)
    find /app/accounts/migrations -type f -name "*.py" ! -name "__init__.py" -delete

    echo "Creating new migrations..."
    python3 /app/manage.py makemigrations accounts

    echo "Applying migrations..."
    python3 /app/manage.py migrate
else
    echo "No migrations to apply."
fi

# Collecter les fichiers statiques
echo "Collecting static files..."
python3 /app/manage.py collectstatic --noinput

# Démarrer le serveur avec Gunicorn en mode debug avec des logs détaillés
echo "Starting Gunicorn server with HTTPS..."
exec gunicorn backend.asgi:application -k uvicorn.workers.UvicornWorker --certfile /app/certs/gunicorn.crt --keyfile /app/certs/gunicorn.key --bind 0.0.0.0:8443 --log-level debug