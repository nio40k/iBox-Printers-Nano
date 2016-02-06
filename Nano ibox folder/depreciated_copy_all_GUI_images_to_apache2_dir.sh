#! /bin/sh
# copy all files from /home/pi/ibox/images/GUI to /var/www/images
sleep 1
echo "copy all files from /home/pi/ibox/images/GUI to /var/www/images"
sleep 1

sudo cp -R /home/pi/ibox/images/GUI/* /var/www/images/


echo "file copy complete"
