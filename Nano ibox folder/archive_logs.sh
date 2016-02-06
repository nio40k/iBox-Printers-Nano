#!/bin/bash

HOME="/home/pi/ibox/"
LOGS="/home/pi/ibox/www/logs/"
ARCHIVE="/home/pi/ibox/www/logs/archives/"

if [ ! -d $LOGS/archives ];
then
echo "Archive folder doesnt exist...creating it"
mkdir $ARCHIVE
else
echo "Archive folder exists...good"
fi

if [ -s $LOGS/iBoxWebGUI_Forever_Log.log ];
then
	echo "Compressing files..."
	#TIME=echo date +%m%d%Y
	FILE="Logs$(date +%H%M%S%m%d%Y).tar"
	tar -zcf $ARCHIVE$FILE $LOGS*.log

	echo "Clearing Logs..."
	rm $LOGS*.log
	touch /home/pi/ibox/www/logs/iBoxWebGUI_Forever_Err.log
	touch /home/pi/ibox/www/logs/iBoxWebGUI_Forever_Log.log
	touch /home/pi/ibox/www/logs/iBoxWebGUI_Forever_StdOut.log
	chmod 777 $LOGS*.log

	echo "Restarting Forever"
	sudo forever stopall
	sudo forever start -a -e /home/pi/ibox/www/logs/iBoxWebGUI_Forever_Err.log -o /home/pi/ibox/www/logs/iBoxWebGUI_Forever_StdOut.log -l /home/pi/ibox/www/logs/iBoxWebGUI_Forever_Log.log --minUptime 30000 --spinSleepTime 10 /home/pi/ibox/iBoxWebGUI.js
else
	echo "Logs have nothing in them..."
fi

echo "Done..." 