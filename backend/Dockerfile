FROM python:3.12-slim-bullseye


ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

WORKDIR /app


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
        libmagic1 \
    && rm -rf /var/lib/apt/lists/*


COPY ./requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt


COPY ./entrypoint.sh .
RUN chmod +x /app/entrypoint.sh


COPY ./backend /app/backend


COPY ./certs/gunicorn.crt /app/gunicorn.crt
COPY ./certs/gunicorn.key /app/gunicorn.key
RUN chmod 644 /app/gunicorn.crt /app/gunicorn.key

EXPOSE 8443


ENTRYPOINT ["/app/entrypoint.sh"]