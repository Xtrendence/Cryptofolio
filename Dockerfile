FROM php:7.4-apache
COPY --chown=www-data:www-data api/ /var/www/html/api/
COPY --chown=www-data:www-data website/ /var/www/html/website/
EXPOSE 8080
