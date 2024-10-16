FROM nginx:stable-alpine

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

WORKDIR /usr/share/nginx/html
