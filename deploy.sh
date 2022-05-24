chown web_ftp:www-data src -R
chmod o+w src -R
rm /var/www/tnxqso/js/*.js
rm /var/www/tnxqso/js/*.js.map
cp /var/www/tnxqso-dev/dist/js/*.js /var/www/tnxqso/js/
cp /var/www/tnxqso-dev/dist/js/*.js.map /var/www/tnxqso/js/
rm /var/www/tnxqso/css/*
cp /var/www/tnxqso-dev/dist/css/* /var/www/tnxqso/css/
cp /var/www/tnxqso-dev/dist/static/images/* /var/www/tnxqso/static/images -R
cp /var/www/tnxqso-dev/dist/*.html /var/www/tnxqso/
cp /var/www/tnxqso-dev/dist/static/html/* /var/www/tnxqso/static/html
cp /var/www/tnxqso-dev/public/static/js/defaultUserSettings.json /var/www/tnxqso/static/js
cp /var/www/tnxqso-dev/public/static/js/donate.js /var/www/tnxqso/static/js
