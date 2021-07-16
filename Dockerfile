FROM php:7.4-apache
COPY apache/000-default.conf /etc/apache2/sites-available/000-default.conf
COPY apache/start-apache /usr/local/bin
COPY api/ /var/www/html/api/
COPY website/ /var/www/html/website/
EXPOSE 80
CMD ["start-apache"]
