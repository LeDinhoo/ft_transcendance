#!/bin/sh
# Exits if an error happens
set -e

# Attendre que PostgreSQL soit prêt à accepter des connexions
while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
  echo 'Waiting for PostgreSQL...'
  sleep 0.5
done

# Appliquer les migrations de la base de données
if python3 /app/manage.py showmigrations --plan | grep '\[ \]'; then
  echo "Applying migrations..."
  python3 /app/manage.py makemigrations accounts
  python3 /app/manage.py migrate
else
  echo "No migrations to apply."
fi

# Collecter les fichiers statiques
echo "Collecting static files..."
python3 /app/manage.py collectstatic --noinput

# Définir les chemins des certificats SSL, avec possibilité de les surcharger via des variables d'environnement
#CERT_FILE=${CERT_FILE:-/app/localhost.crt}
#KEY_FILE=${KEY_FILE:-/app/localhost.key}

# Démarrer le serveur avec Gunicorn en mode debug avec des logs détaillés
echo "Starting Gunicorn server with HTTPS..."

#exec gunicorn backend.wsgi:application --certfile /app/certs/gunicorn.crt --keyfile /app/certs/gunicorn.key --bind 0.0.0.0:8443 --log-level debug
exec gunicorn backend.asgi:application -k uvicorn.workers.UvicornWorker --certfile /app/certs/gunicorn.crt --keyfile /app/certs/gunicorn.key --bind 0.0.0.0:8443 --log-level debug

