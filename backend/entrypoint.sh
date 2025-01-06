#!/bin/sh


set -e


while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
    echo 'Waiting for PostgreSQL...'
    sleep 0.5
done


echo "Creating necessary directories..."
mkdir -p /app/static
mkdir -p /app/media/avatars
mkdir -p /app/staticfiles


echo "Setting correct permissions..."
chmod -R 755 /app/static
chmod -R 755 /app/media
chmod -R 755 /app/staticfiles


if python3 /app/manage.py showmigrations --plan | grep '\[ \]'; then
    echo "Cleaning up migrations..."
    
    find /app/accounts/migrations -type f -name "*.py" ! -name "__init__.py" -delete

    echo "Creating new migrations..."
    python3 /app/manage.py makemigrations accounts

    echo "Applying migrations..."
    python3 /app/manage.py migrate
else
    echo "No migrations to apply."
fi


echo "Collecting static files..."
python3 /app/manage.py collectstatic --noinput --verbosity 0


echo "Starting Gunicorn server with HTTPS..."
exec gunicorn backend.asgi:application -k uvicorn.workers.UvicornWorker --certfile /app/certs/gunicorn.crt --keyfile /app/certs/gunicorn.key --bind 0.0.0.0:8443 --log-level info