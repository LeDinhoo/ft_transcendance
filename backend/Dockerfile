FROM python:3.12-slim-bullseye

# Empêcher Python d'écrire des fichiers .pyc et forcer le stdout/stderr non bufferisé
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

WORKDIR /app

# Installer les dépendances système, les utiliser et les nettoyer
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        python3-dev \
        libpq-dev \
        zlib1g-dev \
        libjpeg-dev \
        git \
        netcat \
        openssl \
        ca-certificates \
        curl \
        wget \
        gnupg \
        libgconf-2-4 \
        libxss1 \
    && rm -rf /var/lib/apt/lists/*

# Copier le fichier requirements et installer les dépendances Python
COPY ./requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copier le script entrypoint et le rendre exécutable
COPY ./entrypoint.sh .
RUN chmod +x /app/entrypoint.sh

# Copier le code backend dans le conteneur
COPY ./backend /app/backend

# Copier les certificats SSL et définir les permissions
COPY ./certs/gunicorn.crt /app/gunicorn.crt
COPY ./certs/gunicorn.key /app/gunicorn.key
RUN chmod 644 /app/gunicorn.crt /app/gunicorn.key

EXPOSE 8443

# Définir le script d'entrée à exécuter
ENTRYPOINT ["/app/entrypoint.sh"]