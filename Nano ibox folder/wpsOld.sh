#!/bin/bash
# only run if there's no current wifi connection

#if  ! ifconfig ra0 | grep -q "inet addr:" ; then

  #sleep 1
  echo "Checking for a USB stick for Network Info in 20 seconds..."
  sleep 1
  MUST_REBOOT=0
  MYVAR=1

  echo "Checking for a USB stick with WiFi info in: interfaces.txt"
  if [ -f /media/*/interfaces.txt ];
  then sudo cp /media/*/interfaces.txt /etc/network/interfaces;
  #then sudo mv /media/*/interfaces.txt /etc/network/;
  #sudo mv /etc/network/interfaces.txt /etc/network/interfaces
  echo "::Successful copy of network interfaces.txt USB to RPi's SD Card";
  MUST_REBOOT=$(($MUST_REBOOT + $MYVAR))
  else
  echo ">>interfaces.txt not on USB Dongle"
  fi

  echo "Checking for a USB stick with WPA info in: wpa_supplicant.conf"
  if [ -f /media/*/wpa_supplicant.txt ];
  then sudo cp /media/*/wpa_supplicant.txt /etc/wpa_supplicant/wpa_supplicant.conf;
  #then sudo mv /media/*/wpa_supplicant.conf /etc/wpa_supplicant/;
  #sudo mv /etc/wpa_supplicant/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant
  echo "::Successful copy of wpa_supplicant.conf from USB to RPi's SD Card";
  MUST_REBOOT=$(($MUST_REBOOT + $MYVAR))
  else
  echo ">>wpa_supplicant.conf not on USB Dongle"
  fi

  echo "Checking for a USB stick with Host Name info in: hostname"
  if [ -f /media/*/hostname.txt ];
  then sudo cp /media/*/hostname.txt /etc/hostname;
  #then sudo mv /media/*/hostname /etc/hostname;
  #sudo mv /etc/hostname /etc/hostname
  echo "::Successful copy of /etc/hostname from USB to RPi's SD Card";
  MUST_REBOOT=$(($MUST_REBOOT + $MYVAR))
  else
  echo ">>hostname not on USB Dongle"
  fi

  echo "Checking for a USB stick with Host Name info in: hosts"
  if [ -f /media/*/hosts.txt ];
  then sudo cp /media/*/hosts.txt /etc/hosts;
  #then sudo mv /media/*/hosts /etc/hosts;
  #sudo mv /etc/hosts /etc/hosts
  echo "::Successful copy of hosts from USB to RPi's SD Card";
  MUST_REBOOT=$(($MUST_REBOOT + $MYVAR))
  else
  echo ">>hosts not on USB Dongle"
  fi

  if [ $MUST_REBOOT -gt 1 ];
  then echo "The system will reboot in 100 seconds; really... whats the rush?";
  sleep 100
  #sudo shutdown -r now;
  else
  echo "No files updated. Not rebooting."
  #The problem with auto rebooting, is that you can constantly reboot forever if the USB stick is not removed.
  fi

  # grab AP's that support WPS, sort by strength and select the strongest 
  wpa_cli scan
  sleep 4
  wpa_cli scan_results | grep WPS | grep iBox -v | sort -r -k3 | awk 'END{print $(NF-4)}' > /tmp/wifi
  # read ssid < /tmp/wifi
  # echo $ssid
  read mac < /tmp/wifi
  echo $mac
  #wpa_cli wps_pbc $ssid

  wpa_cli disable_network all
  wpa_cli enable_network all


  wpa_cli wps_pbc $mac
	sleep 4
	wpa_cli disable_network all
	wpa_cli enable_network all

  sudo ifdown ra0
  sleep 4
  sudo ifup ra0
  sleep 4
  #dhclient ra0
#else
#  echo "Already associated, just list pertinates"
#	wpa_cli enable_network all
#fi

if ifconfig ra0 | grep -q "inet addr:" ; then
  sudo poweroff
fi
