#!/usr/bin/python3

import os
import pygame
import time
import random
import socket #//  For "Pi Finder and ip address knowledge //
#import socketserver
import sys
import RPi.GPIO as GPIO #import GPIO Interface
from PIL import Image #For Image File I/O using PIL (aka Method ## 3 ##)
import itertools #to convert a bit stream to byte stream # For Image open to LCD ## 3 ## and bUse_ImgConvertType1Fcn
import numpy as np # For Image open to LCD ## 3 ## and bUse_ImgConvertType1Fcn and to average lists for PWM 
import select
import threading #from http://stackoverflow.com/questions/11758555/python-do-something-until-keypress-or-timeout
import subprocess # for calling Imagemagick from command line. Not sure if that will interfere with stdin/out to Node.js controlling Printmanager UI
import copy #for XML parsing of SVG files 9/29/14
import json #for json config file parsing
import serial #Digole from Paspbery Pi : From: http://www.seephar.com/2014/03/oled-display-for-raspberry-pi/

# START:  For StdIO Non Blocking Code
# select() should wait for this many seconds for input.
# A smaller number means more cpu usage, but a greater one
# means a more noticeable delay between input becoming
# available and the program starting to work on it.
timeout = 0.1 # seconds
last_work_time = time.time()
# END >> For StdIO Non Blocking Code

aryLED_Brightness_Chip_1_White_LEDs_Only = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,100] #OUT15 is LED, so last one.
aryLED_Brightness_Chip_2_White_LEDs_Only = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,100]
fExposure_Power_mA_White_LED_Default = 14.0
fExposure_Power_mA_White_LED_Dimmed = 4.0

LCD_CS = 2 #or GPIO Bit bang from: http://www.raspberrypi.org/forums/viewtopic.php?f=32&t=25029
LCD_RST  = 3
LCD_A0 = 4
LCD_CLK = 27
LCD_SI = 17
#Logic
TRUE = 1
FALSE = 0
true = True
false = False

#Calibration Vars
iGlobal_Calibration_Current_LED = 0

#Global Constants
bStepper_Drive_ULN2003 = TRUE
bUse_Display_NTSC = FALSE
bUse_Display_LCD = TRUE
bVideo_Output_NTSC = FALSE
bVideo_Output_Digole_128x64 = TRUE

# Define the colors we will use in RGB format
BLACK = (  0,   0,   0)
WHITE = (255, 255, 255)
BLUE =  (  0,   0, 255)
GREEN = (  0, 255,   0)
RED =   (255,   0,   0)

ON = 0
OFF = 1
UP = 1
DOWN = 0
LED_ON = 0
LED_OFF = 1

UV_LED_OFF = 0
UV_LED_ON = 1

NPN_LED_ON = 1
NPN_LED_OFF = 0

PIEZO_ON = 1
PIEZO_OFF = 0

NPN_ON = 1
NPN_OFF = 0
ULN2003_ON = 1
ULN2003_OFF = 0

SPI_OFF = 0
SPI_ON = 1

bSoundEnabled = TRUE

# BUZZER_PIEZO_GPIO15
gpio_sound_piezo_element = 15

BUTTON_B_LED_BLU = 2#18 #2 #v1p5p0
# B2_LED_GRN_GPIO18
#gpio_stepper_pin_led_green_B2 = 18 #Changing to : BUTTON_A_LED_GRN_GPIO18 for PCB Version 1p5
BUTTON_A_LED_GRN = 18#2 #18 #v1p5p0
# B2_LED_BLU_GPIO2
#gpio_stepper_pin_led_blue_B2 = 22 #2 #Changing to BUTTON_C_LED_RED_GPIO22 for PCB Ver 1p5
BUTTON_C_LED_RED = 16 # 2/1/15 depreciated, no longer an LED on the STOP pin button C22 #v1p5p0

iLCD_Contrast = 23  #23 and 86 are peaks. See XLS Tab LCD_Contrast
#User Input : aka Buttons ==========
# BUTTON_A_GPIO10              13 for SPI : 10 for pre 1p12p13 PCBs
gpio_stepper_pin_button_down = 13 #10# Moving to GPIO 13 to free up SPI for LED driver : was10 #Move Z Down manually
# BUTTON_B_GPIO9              26 for SPI : 9 for pre 1p12p13 PCBs
gpio_stepper_pin_button_up = 26# 9 #Moving to GPIO26 to free up SDIO for ST LED1642 ::  ##Move Z Up Manually
# BUTTON_C_GPIO7              
gpio_stepper_pin_button_endstop = 7# 7 #Physical Microswitch indicating Z has hit its maximum travel.
bUse_Endstop = False #1=use endstop in printing and DOWN button, also in stepper Step. 0=Ignore. Created for Beta 4 which seems to have a bad GPIO7 :(
# BUTTON_D_GPIO11              
gpio_stepper_pin_button_print = 8 # switched because it is low at boot with UV LED : 11 #Start print job, if printing then Pause, hold down to Cancel print job

# UV_LED_CTRL_GPIO8       19 for SPI : 11 for pre 1p12p13 PCBs
gpio_stepper_pin_led_UV = 19#11 #Move to GPIO19 to free up SPI for ST LED1642 :: switched because 8 was HOT at boot : 8 #Activates UV LED. But not used anymore because UV_LED is controlled over SPI on the LED1642 chip

gpio_stepper_pin_led_red_B1 = 27# 2/1/15 PCB 1p12p30 : was 16#4##27 #4 #RGB 4,17,27
# B1_LED_GRN_GPIO4
gpio_stepper_pin_led_green_B1 = 20# 2/1/15 PCB 1p12p30 : was 27##17 #9/4/14==red
# B1_LED_BLU_GPIO27
gpio_stepper_pin_led_blue_B1 = 17##4 #27 #9/4/14==red

#SPI
bUse_SPI_LED1642_BitBang = True

gpio_spi_sdo = 9
gpio_spi_clk = 11
gpio_spi_le = 21
gpio_spi_sdi = 10
gpio_led1642_pwm = 20 #was 4 : Moved to 20 to ditch it temp, using WiringPi and its GPIO pcmd line program instead To Be Implemented


fullRestore = False
jsonRestore = False

usrInput = ""

scrollInput = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","0","1","2","3","4","5","6","7","8","9"," ",".","!","?","@","#","$","%","^","&","*","(",")","_","-","+","=","/"]
currentInput = 0

scrollAuth = ["Open", "WPA2"]

caps = False

haveSSID = False
havePasswd = False
haveKeyType = False

WPS = False

ssid = ""
passwd = ""
auth = ""

class cPM(object):
    screen = None;
    port = serial.Serial("/dev/ttyAMA0", baudrate=9600, timeout=1.0) #known good, 11/20/14, trying to speed up digole image load.

    
    def __init__(self):
        "Ininitializes Print Manager"
        #Initialize GPIO : http://sourceforge.net/p/raspberry-gpio-python/wiki/Inputs/
        GPIO.setmode(GPIO.BCM)

        self.SPI_LED1642_Set_Clock_On_GPIO4(2400000)
        
        GPIO.setup(gpio_stepper_pin_led_red_B1, GPIO.OUT) 
        GPIO.setup(gpio_stepper_pin_led_green_B1, GPIO.OUT)
        GPIO.setup(gpio_stepper_pin_led_blue_B1, GPIO.OUT)
        GPIO.setup(BUTTON_B_LED_BLU, GPIO.OUT)
        #Test of outputing a frequency on GPIO 4 ro drive the dimming portion CLK of the ST LED1642 constant current led chip
        #GPIO.setmode(GPIO.BCM)
        #GPIO.setup(4,GPIO.ALT0)
        #GPIO.setclock(4,9500000) Result: This lib is missing key features of the standard GPIO lib, like callbacks and interrupts.
        
        GPIO.setup(BUTTON_A_LED_GRN, GPIO.OUT)
        GPIO.setup(BUTTON_C_LED_RED, GPIO.OUT)
        
        #GPIO.setup(gpio_stepper_pin_led_UV, GPIO.OUT) #, pull_up_down=GPIO.PUD_DOWN) #, pull_up_down=GPIO.PUD_UP)
        
        GPIO.setup(gpio_stepper_pin_button_down, GPIO.IN)
        GPIO.setup(gpio_stepper_pin_button_up, GPIO.IN)
        GPIO.setup(gpio_stepper_pin_button_print, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
        
        #GPIO.setup(gpio_led_red_LCD_Illumination, GPIO.OUT)
        GPIO.setup(gpio_sound_piezo_element, GPIO.OUT)

        GPIO.setup(gpio_spi_clk, GPIO.OUT)
        GPIO.setup(gpio_spi_sdo, GPIO.IN)
        GPIO.setup(gpio_spi_le, GPIO.OUT)
        GPIO.setup(gpio_led1642_pwm, GPIO.OUT)
        GPIO.setup(gpio_spi_sdi, GPIO.OUT)
        
        #Set SPI Defaults
        GPIO.output(gpio_spi_sdi, SPI_OFF);
        GPIO.output(gpio_spi_clk, SPI_OFF);
        GPIO.output(gpio_spi_le, SPI_OFF);
        GPIO.output(gpio_led1642_pwm, SPI_OFF);

        self.lcd_init()
        self.load_splash_screen()

        self.SPI_LED1642_Set_Brightness_PWM(101,aryLED_Brightness_Chip_1_White_LEDs_Only,aryLED_Brightness_Chip_2_White_LEDs_Only)
        #Adjust current of LEDs
        self.SPI_LED1642_Register_Configuration(fExposure_Power_mA_White_LED_Default); 
        #Turn on White LEDs
        self.controlLED_UV(UV_LED_ON);

        self.start()

    def load_splash_screen(self):
        "Load the Splash / Landing Screen"
        global splash_screen_white_led_counter
        print("Load Splash Screen");
        self.lcd_clear() #cPM.cPM
        

        
        print("Setup LED1642 Brightness to defaults : from=>load_splash_screen")
        #You are about to show the user something on the LCD, so turn the UV power OFF, that will leave the White LEDs ON.
        


        #Set LCD Contrast from profile settings
        self.lcd_Tx_CMD("CT" + chr(iLCD_Contrast))
       
        
        self.lcd_Tx_CMD("DM^") #cPM.cPM#Display Mode for on coming command, the available values for B are: “!””~” not, “|” or, “^” xor, “&” and, this means the next drawing pixel will logic operation with pixel already on screen.
        
        #Draw filled rectangle BLACK
        self.lcd_Tx_CMD("FR" + chr(0) + chr(0) + chr(1300) + chr(1300)) ##cPM.cPM
        
        #Try rotating Text 
        self.lcd_Tx_CMD("SD" + chr(2)) #rotate 0-3 = 0deg -- 270 deg#cPM.cPM
        
        self.lcd_Tx_CMD("SC" + chr(1)) # Set color 0=black and 1=white#cPM.cPM
        
        #exampleMessage = "" + strIPAddress
        #Set text in middle of screen
        #cPM.lcd_Tx_CMD("TP")
        #cPM.lcd_Tx_Byte(64)
        #cPM.lcd_Tx_Byte(32)
        ##self.lcd_Tx_CMD("TT" + "IP Address:" + chr(0))#cPM.cPM
        ##self.lcd_Tx_CMD("TP" + chr(0) + chr(1))#cPM.cPM
        ##self.lcd_Tx_CMD("TT" + strIPAddress + chr(0))#cPM.cPM
        #self.lcd_Tx_CMD("TT" + "Restoring Printer" + chr(0))#cPM.cPM
        self.lcd_Tx_CMD("TP" + chr(0) + chr(1))
        #strIP_Address = self.get_local_ip_address('10.0.1.1')

   
        #TTBB = Set text postiotn "TP" where BB are X and Y
        ##self.lcd_Tx_CMD("TP" + chr(0) + chr(2))#cPM.cPM
        ##self.lcd_Tx_CMD("TT" + "Printer Name:" + chr(0))#cPM.cPM
        ##self.lcd_Tx_CMD("TP" + chr(0) + chr(3))#cPM.cPM
        ##self.lcd_Tx_CMD("TT" + strHostname + chr(0))#cPM.cPM
        '''self.lcd_Tx_CMD("TTName:" + chr(0))
        self.lcd_Tx_CMD("TP" + chr(0) + chr(2))
        self.lcd_Tx_CMD("TT" + strHostname + chr(0))
        self.lcd_Tx_CMD("TP" + chr(0) + chr(3))
        #self.lcd_Tx_CMD("TP" + chr(0) + chr(4))#cPM.cPM
        self.lcd_Tx_CMD("TTSSID:" + chr(0))#cPM.cPM
        self.lcd_Tx_CMD("TP" + chr(0) + chr(4))

        self.lcd_Tx_CMD("TT" + strSSID + chr(0))'''
        #self.SPI_LED1642_Set_Brightness_PWM(101,aryLED_Brightness_Chip_1,aryLED_Brightness_Chip_2);
        #time.sleep(10.555555555)
        #self.SPI_LED1642_Register_Configuration(fExposure_Power_mA_White_LED_Dimmed);
        #self.SPI_LED1642_Set_Brightness_PWM(101,aryLED_Brightness_Chip_1_White_LEDs_Only,aryLED_Brightness_Chip_2_White_LEDs_Only)
        #Turn off after X seconds from main loop, or at first button press
        #self.controlLED_UV(UV_LED_OFF);

    def led_red_B1(self, bState):
        "Red LED : B1"
        #print("Red")
        GPIO.output(gpio_stepper_pin_led_red_B1, bState);
        #Debug for inverted LED
        #GPIO.output(gpio_stepper_pin_led_green_B1, 1);
        #GPIO.output(gpio_stepper_pin_led_blue_B1, bState);

        
    def led_green_B1(self, bState):
        "Green LED : B1"
        #print("Green")
        GPIO.output(gpio_stepper_pin_led_green_B1, bState);
        #Debug for inverted LED
        #GPIO.output(gpio_stepper_pin_led_green_B1, 1);
        #GPIO.output(gpio_stepper_pin_led_red_B1, bState);
        #GPIO.output(gpio_stepper_pin_led_blue_B1, bState);
            
    def led_blue_B1(self, bState):
        "Blue LED : B1"
        #print("Blue")
        GPIO.output(gpio_stepper_pin_led_blue_B1, bState);
        #Debug for inverted LED
        #GPIO.output(gpio_stepper_pin_led_green_B1, 1);
        #GPIO.output(gpio_stepper_pin_led_red_B1, bState);
        
    def led_button_B_blue(self, bState):  #led_red_B2(self, bState):
        "Button B LED : Blue"
        GPIO.output(BUTTON_B_LED_BLU, bState);
    
    def led_button_A_green(self, bState):  #led_green_B2(self, bState):
        "Button A Green LED"
        #print(">>> led_button_A_green= ",bState)
        GPIO.output(BUTTON_A_LED_GRN, bState);
            
    def led_button_C_red(self, bState):  #led_blue_B2(self, bState):
        "Button C Z_Endstop Red LED"
        #GPIO.output(BUTTON_C_LED_RED, bState); #Depreciated
        
    def led_internal_red_illumination(self, bState): #use NPN_LED_ON
        "Internal Red LED"
        #GPIO.output(gpio_led_red_LCD_Illumination, bState);

    def beep(self, iBeep_Count):
        global bSoundEnabled
        "Beep to provide audible feedback to user"
        #Only beep if sound is enabled  //
        if bSoundEnabled:  
            fBeep_Delay = 0.05; #0.00048828125;
            for i in range(iBeep_Count):
                for s in range(1):
                    GPIO.output(gpio_sound_piezo_element, PIEZO_ON);   
                    time.sleep(fBeep_Delay)
                    GPIO.output(gpio_sound_piezo_element, PIEZO_OFF); 
                    time.sleep(fBeep_Delay)
                #delay between chirps
                #time.sleep(0.200);
            #Make sure the element is off
            #GPIO.output(gpio_sound_piezo_element, PIEZO_OFF); 

    def buttonEventHandler_down (self, test): # Dont move stepper until button is released. At button release determine if it was a short or long press.
        "DOWN button event"
        global currentInput
        global scrollInput
        global caps

        bBeep_After_Stepping = True;
        
        #Determine if its a PRESS or RELEASE of button
        time.sleep(0.1) #debounce to let GPIO change? : TEST

        if GPIO.input(gpio_stepper_pin_button_down) == 1:
            self.led_button_A_green(LED_ON);

            if currentInput == 0:
                currentInput = len(scrollInput) - 1

            else:
                currentInput = currentInput - 1

            time.sleep(0.1)
            if GPIO.input(gpio_stepper_pin_button_down) == 0:
                self.led_button_A_green(LED_OFF)
                return

            time.sleep(1.5)
            while GPIO.input(gpio_stepper_pin_button_down) == 1:
                if currentInput == 0:
                    currentInput = len(scrollInput) - 1

                else:
                    currentInput = currentInput - 1

                self.beep(1)

            self.beep(1)
            self.led_button_A_green(LED_OFF)


    def buttonEventHandler_up (self, test): # Dont move stepper until button is released. At button release determine if it was a short or long press.
        "UP button event"
        global currentInput
        global scrollInput
        global caps

        bBeep_After_Stepping = True;

        global currentInput

        bBeep_After_Stepping = True;
        
        #Determine if its a PRESS or RELEASE of button
        time.sleep(0.1) #debounce to let GPIO change? : TEST

        if GPIO.input(gpio_stepper_pin_button_up) == 1:
            self.led_button_B_blue(LED_ON);

            if currentInput == len(scrollInput) - 1:
                currentInput = 0

            else:
                currentInput = currentInput + 1

            time.sleep(0.1)
            if GPIO.input(gpio_stepper_pin_button_up) == 0:
                self.led_button_B_blue(LED_OFF);
                return

            time.sleep(1.5)
            while GPIO.input(gpio_stepper_pin_button_up) == 1:
                if currentInput == len(scrollInput) - 1:
                    currentInput = 0
                else:
                    currentInput = currentInput + 1
                self.beep(1)

            self.beep(1)
            self.led_button_B_blue(LED_OFF);

    def buttonEventHandler_enter (self, test): # Dont move stepper until button is released. At button release determine if it was a short or long press.
        "Enter button event"
        global currentInput
        global scrollInput
        global usrInput
        global caps
        global haveSSID
        global havePasswd
        global haveKeyType
        global ssid
        global passwd
        global auth
        global WPS

        bBeep_After_Stepping = True;

        global currentInput

        bBeep_After_Stepping = True;
        
        #Determine if its a PRESS or RELEASE of button
        time.sleep(0.1) #debounce to let GPIO change? : TEST

        
        if GPIO.input(gpio_stepper_pin_button_down) == 1 and GPIO.input(gpio_stepper_pin_button_print) == 1:
            '''if caps == True:
                caps = False
            else:
                caps = True'''

            usrInput = usrInput[:-1]
            return
        

        if GPIO.input(gpio_stepper_pin_button_print) == 1:
            #self.led_button_C_green(LED_ON);

            time.sleep(0.1)
            if GPIO.input(gpio_stepper_pin_button_print) == 0:
                if havePasswd == False:
                    if caps == True:
                        usrInput = usrInput + scrollInput[currentInput].upper()
                    else:
                        usrInput = usrInput + scrollInput[currentInput]

                    self.beep(1)
                    return

            '''if havePasswd == True and haveKeyType == False:
                    print("Auth: " + usrInput)

                    if usrInput == "WPA2":
                        auth = "WPA-PSK"
                    else:
                        auth = usrInput

                    haveKeyType = True
                    usrInput = ""
                    self.beep(10)'''

            time.sleep(2)
            if GPIO.input(gpio_stepper_pin_button_print) == 1:

                if haveSSID == False:
                    print("SSID: " + usrInput)
                    ssid = usrInput
                    
                    if ssid == "":
                        WPS = True
                        print(subprocess.Popen("sudo /home/pi/ibox/wps.sh", shell=True, stdout=subprocess.PIPE).stdout.read())
                        return
                    
                    haveSSID = True
                    self.beep(10)
                    usrInput = ""

                elif havePasswd == False and haveSSID == True:
                    print("Passwd: " + usrInput)
                    passwd = usrInput
                    havePasswd = True

                    if passwd == "":
                        auth = "NONE"
                    else:
                        auth = "WPA-PSK"

                    usrInput = ""
                    self.beep(10)

            #self.led_button_C_green(LED_OFF);

    def wpsScreen(self):
        self.lcd_clear()

        self.lcd_Tx_CMD("SD" + chr(2)) #rotate 0-3 = 0deg -- 270 deg#cPM.cPM
        self.lcd_Tx_CMD("TT" + "                " + chr(0))
        self.lcd_Tx_CMD("TT" + "  Starting WPS  " + chr(0))
        self.lcd_Tx_CMD("TT" + " Then Rebooting " + chr(0))

    def getSSID(self):
        global usrInput
        global scrollInput
        global currentInput

        self.lcd_clear()

        self.lcd_Tx_CMD("SD" + chr(2)) #rotate 0-3 = 0deg -- 270 deg#cPM.cPM
        self.lcd_Tx_CMD("TT" + "Not Associated  " + chr(0))

        if caps == True:
            self.lcd_Tx_CMD("TT" + "SSID:" +  usrInput + scrollInput[currentInput].upper() + chr(0))
        else:
            self.lcd_Tx_CMD("TT" + "SSID:" +  usrInput + scrollInput[currentInput] + chr(0))

    def getPasswd(self):
        global usrInput
        global scrollInput
        global currentInput

        self.lcd_clear()

        self.lcd_Tx_CMD("SD" + chr(2)) #rotate 0-3 = 0deg -- 270 deg#cPM.cPM
        self.lcd_Tx_CMD("TT" + "Not Associated  " + chr(0))

        if caps == True:
            self.lcd_Tx_CMD("TT" + "Pass:" +  usrInput + scrollInput[currentInput].upper() + chr(0))
        else:
            self.lcd_Tx_CMD("TT" + "Pass:" +  usrInput + scrollInput[currentInput] + chr(0))

    def rebootMessage(self):
        self.lcd_clear()

        self.lcd_Tx_CMD("SD" + chr(2)) #rotate 0-3 = 0deg -- 270 deg#cPM.cPM
        self.lcd_Tx_CMD("TT" + "Rebooting       " + chr(0))
        self.lcd_Tx_CMD("TT" + "Please Wait...  " + chr(0))


    '''def getKeyType(self):
        global usrInput
        global scrollInput
        global currentInput

        self.lcd_clear()

        self.lcd_Tx_CMD("SD" + chr(2)) #rotate 0-3 = 0deg -- 270 deg#cPM.cPM
        self.lcd_Tx_CMD("TT" + "Auth Type?      " + chr(0))

        self.lcd_Tx_CMD("TT" + "Auth:" +  usrInput + scrollAuth[currentInput] + chr(0))'''

    def writeNetworkInfo(self):
        exists = False
        next = False

        out = ""

        with open('/etc/wpa_supplicant/wpa_supplicant.conf', 'r') as input_file:
            for line in input_file:

                if line.strip() == ("ssid=\"" + str(ssid) + "\""):
                    out += ("\tssid=\"" + str(ssid) + "\"\n")
                    if passwd != "":
                        out += ("\tpsk=\"" + str(passwd) + "\"\n")
                    out += ("\tkey_mgmt=" + auth + "\n")

                    exists = True
                    next = True

                elif next == False:
                    out += line

                if "psk" in line and next == True:
                    out += ("")

                if "key_mgmt" in line and next == True:
                    out += ("")
                    next = False

                

        with open('/etc/wpa_supplicant/wpa_supplicant.conf', 'w') as output_file:
            for line in out:
                output_file.write(line)

        input_file.close()
        output_file.close()

        if exists == False:
            with open("/etc/wpa_supplicant/wpa_supplicant.conf", "a") as f:
                f.write("network={\n")
                f.write("\tssid=\"" + str(ssid) + "\"\n")
                if passwd != "":
                    f.write("\tpsk=\"" + str(passwd) + "\"\n")
                f.write("\tkey_mgmt=" + auth + "\n")
                f.write("\tauth_alg=OPEN\n")
                f.write("}\n")

            f.close()
        
    def lcd_clear(self):
        "Clear LCD"
        #write clear command CLCL
        self.lcd_Tx_CMD("CLCL"); #cPM.cPM
        return;

    def lcd_init(self):
        "Init and Connfigure LCD"
        print("lcd_init");
        #print("lcd_init and change BAUD");
        # Send command to Digole serial PCB to switch from 9600 to 57600
        #cPM.lcd_Tx_CMD("SB57600");
        #print("Changing baud rate from 9600 to 57600")
        #port = serial.Serial("/dev/ttyAMA0", baudrate=57600, timeout=1.0)
        #Result: did not work, no output to LCD 11/20/14
        
    
        #Send any commands needed to configure LCD
        #i.e. lcd_Tx_CMD("your_command_here")
        self.lcd_clear() #cPM.cPM
        # Print info to the LCD
        
        return;
        
    #@staticmethod
    def lcd_Tx_CMD(self,value):
        "Transfer Data from RPi to LCD as a LCD Command"
        #Use RPi serial pins 14 and 15. for GPIO you need: http://www.raspberrypi.org/forums/viewtopic.php?f=32&t=25029
        self.port.write(bytes(value, 'UTF-8'))#cPM.cPM
        #print("lcd_Tx_CMD[", bytes(value, 'UTF-8'), "]")
        return;
    
    #@staticmethod
    def lcd_Tx_Byte(self,value):
        "Transfer Data from RPi to LCD as Byte"
        #Use RPi serial pins 14 and 15. for GPIO you need: http://www.raspberrypi.org/forums/viewtopic.php?f=32&t=25029
        #cPM.port.write(bytes(value, 'UTF-8'))
        #print("lcd_Tx_Byte[", bytes(value, 'UTF-8'), "]")
        self.port.write(bytes((value,)))#cPM.cPM
        #print("lcd_Tx_Byte[", bytes((value,)), "]")
        return;
        
    #@staticmethod
    def lcd_set_page(self, page, column):
        lsb = column & 0x0f
        msb = column & 0xf0
        msb = msb>>4
        msb = msb | 0x10                  
        page = page | 0xb0                               
        self.lcd_Tx_Byte(page)#cPM.cPM
        self.lcd_Tx_Byte(msb)#cPM.cPM
        self.lcd_Tx_Byte(lsb)#cPM.cPM
        return;

    def SPI_Setup(self):
        print('Setting up SPI using spidev => For the ST LED1642 this wont work because we need to LE (latch) the last N bits of a word');
        #http://www.st.com/st-web-ui/static/active/en/resource/technical/document/application_note/DM00097096.pdf
        myspi = spidev.SpiDev()
        myspi.open(0,1)
        myspi.max_speed_hz = 500000
        myspi.bits_per_word = 8
        myspi.cshigh = True
        myspi.lsbfirst = False
        myspi.mode = 0 #sets clock mode 0-3 : i.e. 3=  __``````````````````|__
        #resp = myspi.xfer2([0xAF])
        #print("output resp=[",resp[0],"]")
        #myspi.xfer([0xAA])
        for i in range(256):
            resp = myspi.xfer([0xAA])
            print(resp);
            
        print("Sent i=[",i,"] SPI Bytes");        


    def SPI_LED1642_Register_Switch(self, State_LED):
        print("Latch Switch Register for LED1642  ===> State_LED====> ",State_LED); 
        #Latch Switch
        #Run Command Once for every LED1642, so Twice
        for n in range(2):
            #print("LED1642 #",n+1);
            # ! Must run twice, once for each Chip !
            #### Start - PerChip ------------------------ Start
            GPIO.output(gpio_spi_sdi, State_LED); #leave this on the full 16 for 0xFF
            time.sleep(0.0001);
            for i in range(16): #0-15
                #print(i)    
                GPIO.output(gpio_spi_clk, SPI_ON);    
                time.sleep(0.0001); #Delay UP Settle "__|"
                
                #GPIO.output(gpio_spi_sdi, SPI_OFF); #leave this on the full 16 for 0xFF
                GPIO.output(gpio_spi_clk, SPI_OFF);
    
                if(i == 14):
                    #time.sleep(0.00005); #Delay DOWN Settle "|__"
                    GPIO.output(gpio_spi_le, SPI_ON);
                    time.sleep(0.0001); #Delay DOWN Settle "|__"
                else:    
                    time.sleep(0.0001); #Delay DOWN Settle "|__"
                
            GPIO.output(gpio_spi_le, SPI_OFF);
            GPIO.output(gpio_spi_sdi, SPI_OFF);  
            #### AStop - PerChip ------------------------ AStop 
            time.sleep(0.1)
        
    def SPI_LED1642_Register_Brightness(self, State_LED):
        print("Brightness Register for LED1642 State_LED=====> ",State_LED);
        #Latch Switch
        #Sets to all 100% brightness, used for Init of all LEDs
        for n in range(16):
            GPIO.output(gpio_spi_sdi, State_LED); #leave this on the full 16 for 0xFF
            time.sleep(0.0001);
            for i in range(16): #0-15
                #print(i)
                
                if(n < 15):
                    if(i == 12):
                        GPIO.output(gpio_spi_le, SPI_ON);
                else:
                    if(i == 10):
                        GPIO.output(gpio_spi_le, SPI_ON);                    
                
                GPIO.output(gpio_spi_clk, SPI_ON);
                time.sleep(0.0001); #Delay UP Settle "__|"
                
                #GPIO.output(gpio_spi_sdi, SPI_OFF); #leave this on the full 16 for 0xFF
                GPIO.output(gpio_spi_clk, SPI_OFF);
    
                time.sleep(0.0001); #Delay DOWN Settle "|__" 
            GPIO.output(gpio_spi_le, SPI_OFF);
            GPIO.output(gpio_spi_sdi, SPI_OFF);  
            GPIO.output(gpio_spi_clk, SPI_OFF);
            time.sleep(0.0001);  
        time.sleep(0.001);    
        GPIO.output(gpio_spi_sdi, SPI_OFF);    
        
        #send Switch register
        #self.SPI_LED1642_Register_Switch();
            
    def SPI_LED1642_Brightness_PWM(self):
        for i in range(200000):
            GPIO.output(gpio_led1642_pwm, SPI_OFF);
            #time.sleep(0.0000001);
            GPIO.output(gpio_led1642_pwm, SPI_ON);
            #time.sleep(0.0000001);
        GPIO.output(gpio_led1642_pwm, SPI_OFF);
        #GPIO.output(gpio_led1642_pwm, SPI_ON);
        print("SPI_LED1642_Brightness_PWM ===>>> Finished")
        
    def SPI_LED1642_Set_Brightness_PWM(self, iBrightness_Percentage, aryLED_Brightness_Chip_1, aryLED_Brightness_Chip_2):
        #def SPI_LED1642_Set_Brightness_PWM(self, iBrightness_Percentage

        print("SPI_LED1642_Set_Brightness_PWM=>aryLED_Brightness_Chip_1_local=[",aryLED_Brightness_Chip_1,"]")
        print("SPI_LED1642_Set_Brightness_PWM=>aryLED_Brightness_Chip_2_local=[",aryLED_Brightness_Chip_2,"]")
        if(iBrightness_Percentage > 100):
            print("iBrightness_Percentage=",iBrightness_Percentage," which is > 100 so using led array values instead of global brightness");
        else:
            print("Setting PWM Brightness on LED1642 to [",iBrightness_Percentage,"] percent")
        #Sets ALL leds to brigtness iBrightness_Percentage
        #If the last bit of the configuration register is 0 then its 16bit (65536), if 1 its 12 but (4096)
        #Its 16 bit : Note the data is MSB so 1000 0000 0000 0000 = 32768 or 50%
        #The first word is for Ch7 15, the last word is for Ch 0
        #Convert Brightness from 0-100 to 0-65535
        iBrightness_65535 = int((iBrightness_Percentage/100.0) * 65535) #based on Config Bit 0 value : 0=65535, 1=4096)
        print("iBrightness_65535=",iBrightness_65535)
        
        #Test to clear buffers by clocking in a 1 bit LE
        #GPIO.output(gpio_spi_le, SPI_ON);
        #GPIO.output(gpio_spi_sdi, SPI_OFF); #leave this on the full 16 for 0xFF
        #GPIO.output(gpio_spi_clk, SPI_ON);
        #time.sleep(0.0001); #Delay UP Settle "__|"
        #GPIO.output(gpio_spi_clk, SPI_OFF);
        #GPIO.output(gpio_spi_le, SPI_OFF);

        #time.sleep(0.01); #Delay DOWN Settle "|__"

        #In the sample source code, file led_dimmer.c they write 1x for each slave chip then they write once for the host chip + LE.
        #i.e. Data+No_LE then Data+LE for two chips. The first write latches the data in Chip#1, the second write latches the data in Chip#2,then the LE latches
        #the data into the regiaters of Chip#1 and Chip#2 at the same time.
        #GPIO.output(gpio_spi_clk, SPI_ON);
        #time.sleep(0.0001); #Delay DOWN Settle "|__"
        #GPIO.output(gpio_spi_clk, SPI_OFF);
        #time.sleep(0.001); #Delay DOWN Settle "|__"
        
        for n in range(16): #LED Number 0-15
            GPIO.output(gpio_spi_sdi, SPI_OFF); #leave this on the full 16 for 0xFF
            #Set Brightness bit for each LED
            for s in range(2): #2 = 0,1
                #print("Chip#",s)
                if(s == 0):
                    iLED_Brightness_Local = aryLED_Brightness_Chip_2[15-n]; #Chip 2 gets sent first since it is latched through SDI->SDO1
                elif( s == 1):
                    iLED_Brightness_Local = aryLED_Brightness_Chip_1[15-n]; #15-n is to reverse the LED order m array. LED15 is first in SPI, where LED0 is first in array
                    
                if(iBrightness_Percentage > 100): #if iBrightness_Percentage > 100% then use the arrays, otherwise between 0-100 use iBrightness_Percentage 
                    iBrightness_65535 = int((iLED_Brightness_Local/100.0) * 65535) #based on Config Bit 0 value : 0=65535, 1=4096)
                    #print("Ary[",n,"]=[",aryLED_Brightness_Chip_Use[n],"] : Bright=(",iBrightness_65535,")")
                time.sleep(0.0001);
                
                for i in range(16): #0-15 #Bit number 0-15 
                    #GPIO.output(gpio_spi_sdi, SPI_OFF); #leave this on the full 16 for 0xFF
                    #GPIO.output(gpio_spi_clk, SPI_OFF);
    

                    #time.sleep(0.0002); #Delay DOWN Settle "|__"

                    if(s == 1):
                        if(n < 15):
                            if(i == 13):#12
                                GPIO.output(gpio_spi_le, SPI_ON);
                        else:
                            if(i == 11):#10
                                GPIO.output(gpio_spi_le, SPI_ON);                    
                    
                    #GPIO.output(gpio_spi_sdi, SPI_OFF); #leave this on the full 16 for 0xFF
                    if( i == 0 and iBrightness_65535 & 32768 > 0 ): #0b1000 0000 0000 0000
                        GPIO.output(gpio_spi_sdi,SPI_ON);
                        #print("Byte [",n,"-",i,"] = 1")
                    if( i == 1 and iBrightness_65535 & 16384 > 0 ): #0b0100 0000 0000 0000
                        GPIO.output(gpio_spi_sdi,SPI_ON);
                        #print("Byte [",n,"-",i,"] = 1")
                    if( i == 2 and iBrightness_65535 & 8192 > 0 ): #0b0010 0000 0000 0000
                        GPIO.output(gpio_spi_sdi,SPI_ON);
                        #print("Byte [",n,"-",i,"] = 1")
                    if( i == 3 and iBrightness_65535 & 4096 > 0 ): #0b0001 0000 0000 0000
                        GPIO.output(gpio_spi_sdi,SPI_ON);
                        #print("Byte [",n,"-",i,"] = 1")
                    if( i == 4 and iBrightness_65535 & 2048 > 0 ): #0b0000 1000 0000 0000
                        GPIO.output(gpio_spi_sdi,SPI_ON);
                        #print("Byte [",n,"-",i,"] = 1")
                    if( i == 5 and iBrightness_65535 & 1024 > 0 ): #0b0000 0100 0000 0000
                        GPIO.output(gpio_spi_sdi,SPI_ON);
                        #print("Byte [",n,"-",i,"] = 1")
                    if( i == 6 and iBrightness_65535 & 512 > 0 ): #0b0000 0010 0000 0000
                        GPIO.output(gpio_spi_sdi,SPI_ON);
                        #print("Byte [",n,"-",i,"] = 1")
                    if( i == 7 and iBrightness_65535 & 256 > 0 ): #0b0000 0001 0000 0000
                        GPIO.output(gpio_spi_sdi,SPI_ON);
                        #print("Byte [",n,"-",i,"] = 1")
                    if( i == 8 and iBrightness_65535 & 128 > 0 ): #0b0000 0000 1000 0000
                        GPIO.output(gpio_spi_sdi,SPI_ON);
                        #print("Byte [",n,"-",i,"] = 1")
                    if( i == 9 and iBrightness_65535 & 64 > 0 ): #0b0000 0000 0100 0000
                        GPIO.output(gpio_spi_sdi,SPI_ON);
                        #print("Byte [",n,"-",i,"] = 1")
                    if( i == 10 and iBrightness_65535 & 32 > 0 ): #0b0000 0000 0010 0000
                        GPIO.output(gpio_spi_sdi,SPI_ON);
                        #print("Byte [",n,"-",i,"] = 1")
                    if( i == 11 and iBrightness_65535 & 16 > 0 ): #0b0000 0000 0001 0000
                        GPIO.output(gpio_spi_sdi,SPI_ON);
                        #print("Byte [",n,"-",i,"] = 1")
                    if( i == 12 and iBrightness_65535 & 8 > 0 ): #0b0000 0000 0000 1000
                        GPIO.output(gpio_spi_sdi,SPI_ON);
                        #print("Byte [",n,"-",i,"] = 1")
                    if( i == 13 and iBrightness_65535 & 4 > 0 ): #0b0000 0000 0000 0100
                        GPIO.output(gpio_spi_sdi,SPI_ON);
                        #print("Byte [",n,"-",i,"] = 1")
                    if( i == 14 and iBrightness_65535 & 2 > 0 ): #0b0000 0000 0001 0010
                        GPIO.output(gpio_spi_sdi,SPI_ON);
                        #print("Byte [",n,"-",i,"] = 1")
                    if( i == 15 and iBrightness_65535 & 1 > 0 ): #0b0000 0000 0000 0001
                        GPIO.output(gpio_spi_sdi,SPI_ON);
                        #print("Byte [",n,"-",i,"] = 1")
                    #GPIO.output(gpio_spi_sdi,SPI_ON); #Debug Test
                    time.sleep(0.00005); #Delay UP Settle "__|"
                    GPIO.output(gpio_spi_clk, SPI_ON);
                    time.sleep(0.00005); #Delay UP Settle "__|"
                    
                    GPIO.output(gpio_spi_sdi, SPI_OFF); #leave this on the full 16 for 0xFF
                    GPIO.output(gpio_spi_clk, SPI_OFF);
                    time.sleep(0.0002); #Delay UP Settle "__|"
                

                
                GPIO.output(gpio_spi_le, SPI_OFF);
            GPIO.output(gpio_spi_sdi, SPI_OFF);  
            GPIO.output(gpio_spi_clk, SPI_OFF);
            time.sleep(0.0001);  
            
            
            if( s == 0):
                ###GPIO.output(gpio_spi_le, SPI_ON);
                time.sleep(0.00005); #Delay UP Settle "__|"
                #GPIO.output(gpio_spi_clk, SPI_ON);
                #time.sleep(0.0001); #Delay UP Settle "__|"
                GPIO.output(gpio_spi_le, SPI_OFF); #leave this on the full 16 for 0xFF
                #GPIO.output(gpio_spi_clk, SPI_OFF);
                time.sleep(0.0002); #Delay UP Settle "__|"
                
        #self.SPI_LED1642_Send_Blanking_Clocks()
        #self.SPI_LED1642_Send_Blanking_Clocks()
        #self.SPI_LED1642_Send_Blanking_Clocks()
        #self.SPI_LED1642_Send_Blanking_Clocks()


        time.sleep(0.001);    
        GPIO.output(gpio_spi_sdi, SPI_OFF);  
        
        #self.SPI_LED1642_Send_Blanking_Clocks()
        #self.SPI_LED1642_Send_Blanking_Clocks()
        
    def SPI_LED1642_Set_Clock_On_GPIO4(self, iFrequency):

        print("Setting clock on GPIO4 to [",iFrequency,"]")
        print("gpio mode 7 clock'")
        os.system('gpio mode 7 clock')
        os.system('gpio clock 7 2400000')
        
        #Issue: GPIOs no longer work as inputs on Print/Up/Down
        #pi@RPIBeta0005 ~ $ gpio exports
        #GPIO Pins exported:
        #   7: in   0  both    
        #   8: in   0  both    
        #  13: in   0  both    
        #  26: in   0  both    
        #os.system('gpio unexportall') #buttons dont work, even once
        print("gpio export 13 in")
        os.system('gpio export 13 in')
        #print("gpio export 26 in")
        os.system('gpio export 26 in')
        #print("gpio export 7 in")
        os.system('gpio export 7 in')
        #print("gpio export 8 in")
        os.system('gpio export 8 in')
        #Set Edge [gpio edge <pin> rising/falling/both/none]
        os.system('gpio edge 13 both')
        os.system('gpio edge 26 both')
        os.system('gpio edge 7 both')
        os.system('gpio edge 8 both')
        
        
    def SPI_LED1642_Send_Blanking_Clocks(self):
        #In the source code for the LED1642 dev board they have "NO_COMMAND" LE writes where the timing is set to -1 CLK or 16
        time.sleep(0.01); #Delay UP Settle "__|"
        for i in range(16): #0-15
            GPIO.output(gpio_spi_clk, SPI_ON);
            time.sleep(0.0001); #Delay UP Settle "__|"
            GPIO.output(gpio_spi_clk, SPI_OFF);
            time.sleep(0.0002); #Delay UP Settle "__|"
        time.sleep(0.0002); #Delay UP Settle "__|"
        #GPIO.output(gpio_spi_le, SPI_ON);
        #time.sleep(0.0002); #Delay UP Settle "__|"
        #GPIO.output(gpio_spi_le, SPI_OFF); 
        
    def SPI_LED1642_Register_Configuration(self, fExposure_Power_mA_Local):
        print("Configuration Register for LED1642 : fExposure_Power_mA_Local=[",fExposure_Power_mA_Local,"]");
        #Latch Switch
        #Note: At 3p3 Volts the max current seems to ve 7.5mA, but with little loss! Will need to run the LEDs anode at 5.0V to achieve > 7.5mA
        #The math for mA to Config bits can be found in the Pico_printer_Research...XLS in the UV_LED Testing tab.
        # S = =((AB59/AA59)*AD59) * 1000
        # S = =((1.23/20000)*80) * 1000
        S = ((1.23/20000.0)*80.0) * 1000.0
        # BINARY = DEC2BIN(=(((21*mA_Target)-(21*S))/S)
        mA_Decimal = int(((21*fExposure_Power_mA_Local)-(21*S))/S);
        #print("S=[",S,"] :: mA_Decimal=",mA_Decimal)
        #Convert Decimal to Binary
        mA_Binary = self.Convert_Dec_To_Bin(mA_Decimal) 
        print("mA_Decimal=[",mA_Binary,"]")
        #Returns: 0b10101
        #Bitwise Test:
        #print("mA_Decimal & 1=[",mA_Decimal & 1,"]")
        
        #Run Command Once for every LED1642, so Twice
        for n in range(2):
            #print("LED1642 #",n+1);
        
            #### Start - PerChip ------------------------ Start
            GPIO.output(gpio_spi_sdi, SPI_OFF); 
            time.sleep(0.0001);
            for i in range(16): #0-15", 
                #print(i)
                if(i == 9): 
                    GPIO.output(gpio_spi_sdi,SPI_ON); #High Power BIT
                    
                if(i == 0): 
                    GPIO.output(gpio_spi_sdi,SPI_OFF); #1=Brightness@4096 steps, 0=65536
                    
                if( i == 15 and mA_Decimal & 1 > 0 ): #0b000001
                    GPIO.output(gpio_spi_sdi,SPI_ON);
                    #print("Byte 1 = 1")
                    
                if( i == 14 and mA_Decimal & 2 > 0 ): #0b000010
                    GPIO.output(gpio_spi_sdi,SPI_ON);
                    #print("Byte 2 = 1")
        
                if( i == 13 and mA_Decimal & 0b000100 > 0 ):
                    GPIO.output(gpio_spi_sdi,SPI_ON);
                    #print("Byte 3 = 1")
                    
                if( i == 12 and mA_Decimal & 0b001000 > 0 ):
                    GPIO.output(gpio_spi_sdi,SPI_ON);
                    #print("Byte 4 = 1")
        
                if( i == 11 and mA_Decimal & 0b010000 > 0):
                    GPIO.output(gpio_spi_sdi,SPI_ON);
                    #print("Byte 5 = 1")
                    
                if( i == 10 and mA_Decimal & 0b100000 > 0):
                    GPIO.output(gpio_spi_sdi,SPI_ON); 
                    #print("Byte 6 = 1")
                    
                if(i == 9):
                    GPIO.output(gpio_spi_le, SPI_ON);
                    #if(CONF_VALUE > 0):
                    #    time.sleep(0.0001);
                    
                
                GPIO.output(gpio_spi_clk, SPI_ON);
                time.sleep(0.0001); #Delay UP Settle "__|"
                
                GPIO.output(gpio_spi_sdi, SPI_OFF); #leave this on the full 16 for 0xFF
                GPIO.output(gpio_spi_clk, SPI_OFF);
    
                time.sleep(0.0002); #Delay DOWN Settle "|__"
                
            
            GPIO.output(gpio_spi_sdi, SPI_OFF);
            GPIO.output(gpio_spi_le, SPI_OFF);
            GPIO.output(gpio_spi_sdi, SPI_OFF); 
            #### End - PerChip ------------------------ End
            time.sleep(0.1)

    def controlLED_UV(self, bState):
        "Turn UV LED On/Off : use UV_LED_OFF/ON"
        #if bState == LED_ON:
            #print("UV LED State Change: ** ON **");
        #if bState == LED_OFF:
            #print("UV LED State Change:    OFF  ");
            
        #Depreciated 12/15/14 with the implementation of the ST LED1642 constant current driver
        #GPIO.output(gpio_stepper_pin_led_UV, bState); #This pin is not used right now, so this can stay to be backwards compatible, but as of hardware >=1.3 not needed
        
        #self.SPI_LED1642_Register_Brightness(bState) #depreciated in favor of using State, sure it needs to be sent multiple times, but ti delays the LED on time by 10nS/led reducing inrush current.
        
        self.SPI_LED1642_UV_LEDs(bState);

    def SPI_LED1642_UV_LEDs(self, State_LED):
        print("SPI_LED1642_UV_LEDs :: State_LED=",State_LED);
        # ! Must run twice, once for each Chip !
        self.SPI_LED1642_Register_Switch(State_LED);

    def Convert_Dec_To_Bin(self, Decimal_Val):
        
        Z = bin(int(Decimal_Val))
        #Z = "{0:#b}".format(Z)
        return Z
        
        n = Decimal_Val
        x=n
        k=[]
        while (n>0):
            a=int(float(n%2))
            k.append(a)
            n=(n-a)/2
        k.append(0)
        string=""
        for j in k[::-1]:
            string=string+str(j)
            print("k[",j,"]=[ ",k[j] ," ]")
        print('The binary no. for %d is %s'%(x, string))
        return k


    def start(self):
        self.lcd_clear()

        #while True:
        self.getSSID()
        #    time.sleep(0.5)


def main(): 
    "Main Loop" 

    print("main started");
    sys.stdout.flush()

    print(subprocess.Popen("sudo forever stopall", shell=True, stdout=subprocess.PIPE).stdout.read())

    pm = cPM()

    pm.beep(1)

    #Send message to GUI letting them know we are 
    #was load splash screen location


    #Setup things inported from drlprintmanager
    #Setup Callbacks:
    #GPIO.add_event_detect(gpio_stepper_pin_button_up, GPIO.FALLING, callback=pm.buttonEventHandler_up, bouncetime=100) 
    GPIO.add_event_detect(gpio_stepper_pin_button_up, GPIO.BOTH, callback=pm.buttonEventHandler_up, bouncetime=50) 
    GPIO.add_event_detect(gpio_stepper_pin_button_down, GPIO.BOTH, callback=pm.buttonEventHandler_down, bouncetime=50) 
    #  re-enable for Beta2 with new PCB 
    GPIO.add_event_detect(gpio_stepper_pin_button_print, GPIO.BOTH, callback=pm.buttonEventHandler_enter, bouncetime=70) 
    #GPIO.add_event_detect(gpio_stepper_pin_button_endstop, GPIO.BOTH, callback=pm.buttonEventHandler_fullRestore, bouncetime=50) 
    #cant set two events for one GPIO >> use BOTH? GPIO.add_event_detect(gpio_stepper_pin_button_endstop, GPIO.FALLING, callback=pm.buttonEventHandler_endstop_falling, bouncetime=100)   

    print("__main__ Loaded <<<  READY >>>");

    #Load system data
    #pm.load_JSON_System_Data(); #Called from load_JSON_Config_Data
    time.sleep(0.1);

    #//  NEW StdIO Non Blocking code Added 9/26/2014 from : http://repolinux.wordpress.com/2012/10/09/non-blocking-read-from-stdin-in-python/ //                                                                                                                    
    # while still waiting for input on at least one file

    while haveSSID == False:
        if WPS == False:
            pm.getSSID()
        else:
            pm.wpsScreen()
        time.sleep(0.3)

    while havePasswd == False:
        pm.getPasswd()
        time.sleep(0.3)

    pm.writeNetworkInfo()
    pm.rebootMessage()

    GPIO.cleanup();    
    print(subprocess.Popen("sudo reboot", shell=True, stdout=subprocess.PIPE).stdout.read())

if __name__=="__main__": 
    main()
