
FROM nginx:stable-alpine3.17


COPY ./certs/gunicorn.crt /etc/nginx/certs/
COPY ./certs/gunicorn.key /etc/nginx/certs/


RUN chmod 600 /etc/nginx/certs/gunicorn.crt /etc/nginx/certs/gunicorn.key \
    && chown nginx:nginx /etc/nginx/certs/gunicorn.crt /etc/nginx/certs/gunicorn.key


RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/


COPY ./static /usr/share/nginx/html/static/
COPY ./templates/index.html /usr/share/nginx/html/index.html


RUN chmod -R 755 /usr/share/nginx/html/ \
    && chown -R nginx:nginx /usr/share/nginx/html/


WORKDIR /usr/share/nginx/html

