#FROM python:3.12-slim-bullseye
#
## Empêcher Python d'écrire des fichiers .pyc et forcer le stdout/stderr non bufferisé
#ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
#
#WORKDIR /app
#
## Installer les dépendances système et nettoyer les dépendances de build inutiles
#RUN apt-get update && \
#    apt-get install -y --no-install-recommends \
#        build-essential \
#        python3-dev \
#        libpq-dev \
#        zlib1g-dev \
#        libjpeg-dev \
#        git \
#        netcat \
#        openssl \
#        ca-certificates \
#        curl \
#    && rm -rf /var/lib/apt/lists/*
#
## Copier le fichier requirements et installer les dépendances Python
#COPY ./requirements.txt .
#RUN pip install --no-cache-dir --upgrade pip && \
#    pip install --no-cache-dir -r requirements.txt
#
## Copier le script entrypoint et le rendre exécutable
#COPY ./entrypoint.sh .
#RUN chmod +x /app/entrypoint.sh
#
#COPY ./frontend/templates /app/frontend/templates
#
#
## Copier le code backend dans le conteneur
#COPY ./backend /app/backend
#
## Copier les certificats SSL et définir les permissions
#COPY ./certs/gunicorn.crt /app/gunicorn.crt
#COPY ./certs/gunicorn.key /app/gunicorn.key
#RUN chmod 644 /app/gunicorn.crt /app/gunicorn.key
#
#EXPOSE 8443
#
## Définir le script d'entrée à exécuter
#ENTRYPOINT ["/app/entrypoint.sh"]


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



#FROM python:alpine3.19
#
## Prevent Python from writing .pyc files, output is sent directly to the terminal
#ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
#
#WORKDIR /app
#
## Install dependencies and clean up unnecessary build dependencies
#RUN apk update && \
#    apk add --no-cache --virtual .build-deps gcc musl-dev python3-dev postgresql-dev zlib-dev jpeg-dev git && \
#    apk add --no-cache postgresql-libs && \
#    pip install --no-cache-dir --upgrade pip
#
## Copy the requirements file and install Python dependencies
#COPY ./requirements.txt .
#RUN pip install --no-cache-dir -r requirements.txt && apk del .build-deps
#
## Copy the entrypoint script and make it executable
#COPY ./entrypoint.sh .
#RUN chmod +x /app/entrypoint.sh
#
## Copy the entire backend code into the container
#COPY ./backend /app/backend
#
## Copy the SSL certificates and set permissions
#COPY ./certs/gunicorn.crt /app/gunicorn.crt
#COPY ./certs/gunicorn.key /app/gunicorn.key
#RUN chmod 644 /app/gunicorn.crt /app/gunicorn.key
#
#EXPOSE 8443
#
## Define the entrypoint script to run
#ENTRYPOINT ["/app/entrypoint.sh"]