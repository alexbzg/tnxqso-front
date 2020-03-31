chown web_ftp:www-data src -R
chmod o+w src -R
rm /var/www/tnxqso/static/js/*.js
rm /var/www/tnxqso/static/js/*.js.map
cp /var/www/tnxqso-test/dist/static/js/*.js /var/www/tnxqso/static/js/
cp /var/www/tnxqso-test/dist/static/js/*.js.map /var/www/tnxqso/static/js/
rm /var/www/tnxqso/static/css/*
cp /var/www/tnxqso-test/dist/static/css/* /var/www/tnxqso/static/css/
cp /var/www/tnxqso-test/dist/static/images/* /var/www/tnxqso/static/images
cp /var/www/tnxqso-test/dist/*.html /var/www/tnxqso/
cp /var/www/tnxqso-test/dist/static/html/* /var/www/tnxqso/static/html
cp /var/www/tnxqso-test/static/js/defaultUserSettings.json /var/www/tnxqso/static/js
cp /var/www/tnxqso-test/static/js/donate.js /var/www/tnxqso/static/js
