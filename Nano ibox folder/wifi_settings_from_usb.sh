#! /bin/sh
# Wifi from USB stick using crontab @reboot
#sleep 15
echo "Checking for a USB stick for Network Info in 20 seconds..."
sleep 1
MUST_REBOOT=0
MYVAR=1

sudo chomd +x /home/pi/nano_recovery.py
sudo /home/pi/nano_recovery.py

if [ -e "/media/usb/*" ];
then echo "USB Mounted";
else
echo "Mounting USB";
sudo mkdir /media/usb
sudo mount /dev/sd*1 /media/usb
fi

if [ -e "/media/usb/logs/" ];
then echo "logs folder exist";
else
sudo mkdir /media/usb/logs
fi

echo "Copying Logs"
sudo cp /home/pi/ibox/www/logs/* /media/usb/logs
sudo mkdir /media/usb/logs/print_config_files
sudo cp /home/pi/ibox/print_config_files/* /media/usb/logs/print_config_files/
sudo cp /home/pi/ibox/mysystem.json /media/usb/logs/
sudo cp /home/pi/ibox/mycalibration.json /media/usb/logs

echo "Checking for a USB stick with WiFi info in: interfaces.txt"
if [ -f /media/usb/interfaces.txt ];
then sudo cp /media/usb/interfaces.txt /etc/network/interfaces;
#then sudo mv /media/*/interfaces.txt /etc/network/;
#sudo mv /etc/network/interfaces.txt /etc/network/interfaces
echo "::Successful copy of network interfaces.txt USB to RPi's SD Card";
MUST_REBOOT=$(($MUST_REBOOT + $MYVAR))
else
echo ">>interfaces.txt not on USB Dongle"
fi

echo "Checking for a USB stick with WPA info in: wpa_supplicant.conf"
if [ -f "/media/usb/wpa_supplicant.txt" ];
then sudo cp /media/usb/wpa_supplicant.txt /etc/wpa_supplicant/wpa_supplicant.conf;
#then sudo mv /media/*/wpa_supplicant.conf /etc/wpa_supplicant/;
#sudo mv /etc/wpa_supplicant/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant
echo "::Successful copy of wpa_supplicant.conf from USB to RPi's SD Card";
MUST_REBOOT=$(($MUST_REBOOT + $MYVAR))
else
echo ">>wpa_supplicant.conf not on USB Dongle"
fi

echo "Checking for a USB stick with Host Name info in: hostname"
if [ -f /media/usb/hostname.txt ];
then sudo cp /media/usb/hostname.txt /etc/hostname;
#then sudo mv /media/*/hostname /etc/hostname;
#sudo mv /etc/hostname /etc/hostname
echo "::Successful copy of /etc/hostname from USB to RPi's SD Card";
MUST_REBOOT=$(($MUST_REBOOT + $MYVAR))
else
echo ">>hostname not on USB Dongle"
fi

echo "Checking for a USB stick with Host Name info in: hosts"
if [ -f /media/usb/hosts.txt ];
then sudo cp /media/usb/hosts.txt /etc/hosts;
#then sudo mv /media/*/hosts /etc/hosts;
#sudo mv /etc/hosts /etc/hosts
echo "::Successful copy of hosts from USB to RPi's SD Card";
MUST_REBOOT=$(($MUST_REBOOT + $MYVAR))
else
echo ">>hosts not on USB Dongle"
fi

echo "Checking for ibox directory"
if [ -e /media/usb/ibox/ ];
then echo "Directory found...copying everything over";
sudo cp -rf /media/usb/ibox/* /home/pi/ibox/;
echo "::Successful copy of ibox directory from USB to RPi's SD Card";
MUST_REBOOT=2
else
echo ">>directory not on USB Dongle"
fi

echo "Checking Network Connectivity"
if  ! ifconfig ra0 | grep -q "inet addr:" ; then
	sudo python3 /home/pi/ibox/networkConnect.py
fi

if [ $MUST_REBOOT -gt 1 ];
then echo "The system will reboot in 100 seconds; really... whats the rush?";
sleep 100
sudo poweroff;
else
echo "No files updated. Not rebooting."
#The problem with auto rebooting, is that you can constantly reboot forever if the USB stick is not removed.
fi
