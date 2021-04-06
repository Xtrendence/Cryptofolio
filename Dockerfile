FROM php:7.4-apache
COPY api/ /var/www/html/api/
COPY website/ /var/www/html/website/
EXPOSE 8080