#!/bin/sh

if test $# -eq 0
then
    echo "No name on command line."
    exit 1
fi

echo $1
NAME=$1
echo $NAME

while grep -q 127.0.1.1 "/etc/hosts" 
do
   sudo sed -i '/127.0.1.1/d' /etc/hosts
done

echo $NAME | sudo tee  /etc/hostname

sudo sed -i -e 's/^.*hostname-setter.*$//g' /etc/hosts
echo "127.0.1.1      " $NAME " ### Set by hostname-setter"  | sudo tee -a /etc/hosts

sudo service hostname.sh stop
sudo service hostname.sh start

echo "Hostname set. Log out to see it on the command line"