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

# Vérification des certificats
echo "\n🔍 Debug: Checking certificate locations..."
echo "Contents of /app/certs/:"
ls -la /app/certs/
echo "\nContents of /app/:"
ls -la /app/

# Vérifier explicitement les chemins des certificats
if [ -f "/app/certs/gunicorn.crt" ] && [ -f "/app/certs/gunicorn.key" ]; then
   echo "✅ Certificates found in /app/certs/"
   CERT_PATH="/app/certs"
else
   echo "⚠️ Warning: Certificates not found in /app/certs/, checking /app/"
   if [ -f "/app/gunicorn.crt" ] && [ -f "/app/gunicorn.key" ]; then
       echo "✅ Certificates found in /app/"
       CERT_PATH="/app"
   else
       echo "❌ Error: No certificates found!"
       exit 1
   fi
fi

# Vérifier les permissions des certificats
echo "\n📋 Certificate permissions:"
ls -l "$CERT_PATH/gunicorn.crt"
ls -l "$CERT_PATH/gunicorn.key"

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

# Vérifier que le port est disponible
echo "\n🔌 Checking if port 8443 is available..."
if nc -z localhost 8443; then
   echo "❌ Warning: Port 8443 is already in use"
   echo "Current processes using port 8443:"
   lsof -i :8443
else
   echo "✅ Port 8443 is available"
fi

echo "\n🚀 Starting Gunicorn with certificates from $CERT_PATH"
# Démarrer le serveur avec Gunicorn en mode debug avec des logs détaillés
exec gunicorn backend.asgi:application \
   -k uvicorn.workers.UvicornWorker \
   --certfile="$CERT_PATH/gunicorn.crt" \
   --keyfile="$CERT_PATH/gunicorn.key" \
   --bind=0.0.0.0:8443 \
   --log-level=debug \
   --error-logfile=- \
   --access-logfile=- \
   --capture-output \
   --worker-class=uvicorn.workers.UvicornWorker \
   --workers=1