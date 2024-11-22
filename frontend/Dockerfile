# FROM nginx:stable-alpine3.17

# # Copy the SSL certificate and key
# #COPY --chown=nginx:nginx ./certs/localhost.crt /etc/nginx/certs/
# COPY --chown=nginx:nginx ./certs/gunicorn.crt /etc/nginx/certs/
# #COPY --chown=nginx:nginx ./certs/localhost.key /etc/nginx/certs/
# COPY --chown=nginx:nginx ./certs/gunicorn.key /etc/nginx/certs/

# # Remove the default Nginx configuration and copy your custom configuration
# RUN rm /etc/nginx/conf.d/default.conf
# COPY nginx.conf /etc/nginx/conf.d/


# # Copy your website files
# COPY --chown=nginx:nginx . /usr/share/nginx/html/
# # Changer les permissions pour le dossier media sans sudo
# RUN mkdir -p /usr/share/nginx/html/media/ \
#     && chown -R nginx:nginx /usr/share/nginx/html/media/ \
#     && chmod -R 755 /usr/share/nginx/html/media/

# WORKDIR /usr/share/nginx/html



FROM nginx:stable-alpine3.17

# Copie des certificats SSL
COPY ./certs/gunicorn.crt /etc/nginx/certs/
COPY ./certs/gunicorn.key /etc/nginx/certs/

# Permissions spécifiques pour les certificats
RUN chmod 600 /etc/nginx/certs/gunicorn.crt /etc/nginx/certs/gunicorn.key \
    && chown nginx:nginx /etc/nginx/certs/gunicorn.crt /etc/nginx/certs/gunicorn.key

# Suppression de la configuration par défaut de Nginx et ajout de la vôtre
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/

# Copie des fichiers front-end
COPY ./static /usr/share/nginx/html/static/
COPY ./templates/index.html /usr/share/nginx/html/index.html

# Définir les permissions pour tous les fichiers du site
RUN chmod -R 755 /usr/share/nginx/html/ \
    && chown -R nginx:nginx /usr/share/nginx/html/

# Répertoire de travail par défaut
WORKDIR /usr/share/nginx/html

