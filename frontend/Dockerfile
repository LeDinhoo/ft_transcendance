FROM nginx:stable-alpine3.17

# Copy the SSL certificate and key
#COPY --chown=nginx:nginx ./certs/localhost.crt /etc/nginx/certs/
COPY --chown=nginx:nginx ./certs/gunicorn.crt /etc/nginx/certs/
#COPY --chown=nginx:nginx ./certs/localhost.key /etc/nginx/certs/
COPY --chown=nginx:nginx ./certs/gunicorn.key /etc/nginx/certs/

# Remove the default Nginx configuration and copy your custom configuration
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/


# Copy your website files
COPY --chown=nginx:nginx . /usr/share/nginx/html/
# Changer les permissions pour le dossier media sans sudo
RUN mkdir -p /usr/share/nginx/html/media/ \
    && chown -R nginx:nginx /usr/share/nginx/html/media/ \
    && chmod -R 755 /usr/share/nginx/html/media/

WORKDIR /usr/share/nginx/html
