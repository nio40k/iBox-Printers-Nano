#! /bin/sh
# 2-step process: convert .py to .pyc and move back to root directory
echo "Beginning script"
sleep 2
echo "This is a 4 step process: convert .py to .pyc and move back to root directory"
sleep 5

echo "Step 1: delete iBoxPrintManager.cpython-32.pyc from __pycache__ "
sudo rm /home/pi/ibox/__pycache__/iBoxPrintManager.cpython-32.pyc

echo "Step 2: Generate .pyc from .py"
sudo python3 /home/pi/ibox/convert_py_to_pyc.py
sleep 15


echo "Step 3: Move and rename from __pycache__ directory back to ibox folder"
sudo cp /home/pi/ibox/__pycache__/iBoxPrintManager.cpython-32.pyc /home/pi/ibox/iBoxPrintManager.pyc

echo "Step 4: Move and rename from __pycache__ directory back to ibox folder as a .bin so when the dir is put in the Software Update dir via FTP it will already have the correct extension .bin instead of .pyc. The .bin will be changed to .pyc as it is downloaded during the upgrade process on the Nano"
sudo cp /home/pi/ibox/__pycache__/iBoxPrintManager.cpython-32.pyc /home/pi/ibox/iBoxPrintManager.bin

echo "Finished!"