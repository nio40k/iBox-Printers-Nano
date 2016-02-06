#!/bin/sh
#
### BEGIN INIT INFO
# Provides:          iboxnano
# Required-Start:    $local_fs $network
# Required-Stop:     $local_fs
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: bootscriptiboxnano
# Description:       bootscriptiboxnano
### END INIT INFO
# Note runlevel 2345, 86 is the Start order and 85 is the Stop order
#
# chkconfig: 2345 86 85
# description: iBox Nano Boot WebGUI
#
# Below is the source function library, leave it be


# result of whereis forever or whereis node
export PATH=$PATH:/usr/local/bin  
# result of whereis node_modules
export NODE_PATH=$NODE_PATH:/usr/local/lib/node_modules


start(){  
        sudo forever start -a -w /home/pi/ibox/iBoxWebGUI.js
}

stop(){  
        sudo forever stop -a -w /home/pi/ibox/iBoxWebGUI.js
}

restart(){  
        sudo forever restart -a -w /home/pi/ibox/iBoxWebGUI.js
}

case "$1" in  
        start)
                echo "Start service bootscriptiboxnano"
                start
                ;;
        stop)
                echo "Stop service bootscriptiboxnano"
                stop
                ;;
        restart)
                echo "Restart service bootscriptiboxnano"
                restart
                ;;
        *)
                echo "Usage: $0 {start|stop|restart}"
                exit 1
                ;;
esac 