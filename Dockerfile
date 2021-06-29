FROM php:7.4-apache

# copy the server configuration file
COPY apache/000-default.conf /etc/apache2/sites-available/000-default.conf
# copy the startup script
COPY apache/start-apache /usr/local/bin
# copy the app folders
COPY api/ /var/www/html/api/
COPY website/ /var/www/html/website/

EXPOSE 80
CMD ["start-apache"]
