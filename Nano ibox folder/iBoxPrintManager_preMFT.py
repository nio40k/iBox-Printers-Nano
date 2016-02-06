#!/usr/bin/env python3


#print manager for BahnTech 3DLCD printer
#8/17/2014 from printmanager.py created 5/24/14
#9/26/2014 Total Re-Write to integrate with Node.js and add a browser based Client Side UI
#9/28/24 Migrated from Beta3s partial Node.js integration, picking it up in this file and on Beta4. Will switch to beta 5 ASAP (as soon as I populate a new PCB and cut Beta5)
#10/11/14 Trying to fix stepper random motion issue. PCB 1.6 in Beta 5
#11.29.2014 Adding ULN2003 Darlington Array driver for stepper
#11/30/14  ULN2003 working. Fixing LED ON to LED_ON and Long Hold code for Down and Up to release event and hold time.
#12/1/2014 Working on stepper studder using ULN2003
#12/4/14 Fixing iSteps_Per_100_Microns implemetiation issues
#12/6/14 Printing SSID, IP Address and local Host Name to LCD at BOOT
#12/7/14 Built Beta6 with Beta9-PCB
#12/8/14 Working Auto zero and LED code
#12/9/14 When the Limit switch is triggered, about 200-400 microns above 0, run the stepper down for 300 microns to make sure the build plate is on the VAT floor. Then step it back up one layer. i.e. 100 microns.
#12/10/14 Implementing Hold DOWN Print to invodke WPS (wifi auto connect) script wps.sh
#12/12-15/14 Working on SPI driver for ST LED1642 constant current LED driver. Works on PCB_11
#12/17/14 Added Init routine for LED1642 - Send SPI commands to set LED Current, and switch, brightness settings
#12/18/14 Adding Power myConfig param + Final integration of RPi A+ and PCB11 (1p12p13) in Beta 6 Chassis
#12/30/14 Adding Brightness control using LED1642: 2 parts: 1: Outputting a CLK into the Brightness_CLK (aka ST1642_PWCLK) pin on LED1642 on RPi_GPIO:4 aka GPIO GCLK 
#1/1/15 Happy New Year! : Initiated Pixel_Over_LED control of Brightness.aka POLB line 730 
#1/13/15 Back to PixelOverLED Control
#2/1/15 White Lite Integration
#2/9/15 Keey white LEDs oon for a while on boot but have them off during prints
#2/14/15 Bringing up Beta 12 with v1p12p30 PCB. Main difference from Beta10 PCV in Beta 5 unit is addition of I2C Photodiode (not yet implemented) and fully binned and equally radiating LEDs
#3/15/14 Changing stdin /button_sound handler. The toggle happens in node.js

#This program accepts client requests via StdIn from Node.ja, services them, then provides a status_update to Node.js Via StdOut.
#Key Files:
#File Name : Function : Location
#iBoxPrintManager.py : Print manager, direct hardware control, SVG parser : Currently: /usr/share/adafruit/webide/repositories/my-pi-projects/iBox_Nano/ but for production: /home/pi/ibox/
#
#Changelog:
    #v1p5p0 = 9/4/2014 for new purple 1.5.3 PCBs. Added a Print button, changed lights on up and down from RGB to Green=down and Blue=Up. Print=RGB aka B1
#//  Moving to threads for spawned processes like Print, Move Z Up/Down 9/28/14



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
import numpy as np # For Image open to LCD ## 3 ## and bUse_ImgConvertType1Fcn
import select
import threading #from http://stackoverflow.com/questions/11758555/python-do-something-until-keypress-or-timeout
import xml.etree.ElementTree as ET  #  to parse XML, step 1 to use slic3rs SVG files
import subprocess # for calling Imagemagick from command line. Not sure if that will interfere with stdin/out to Node.js controlling Printmanager UI
import copy #for XML parsing of SVG files 9/29/14
import json #for json config file parsing
import urllib.request #for Remote Upgrade of software
#import spidev #SPI for talking to ST LED1642 constant current chip
#import wiringpi2 #trying to get a MHz clk out of GPIO 4 GCLK (I2C CLK Pin)

#Center 10: 9,10,11,12,13     16,17,18,19,20   #PVCB LED Number
#Center 10: C2-9, C2-10, C1-1, C1-2, C1-8      C2-6, C2-5, C2-4, C1-3, C1-9 #Led1642 Output Number (not pin number)
#aryLED_Brightness_Chip_n [ BASE 0, i.e. 0 = the first element in array]
aryLED_Brightness_Chip_1_Full_PWR = [100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,0] #Overwritten during config.json load by iOEM_Calibrated_UV_LED_PWM
aryLED_Brightness_Chip_2_Full_PWR = [100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,0] #Overwritten during config.json load by iOEM_Calibrated_UV_LED_PWM
aryLED_Brightness_Chip_1 = [100,60,60,60,100,100,100,100,10,10,100,90,90,90,100,0] #Overwritten during config.json load by iOEM_Calibrated_UV_LED_PWM
aryLED_Brightness_Chip_2 = [100,100,91,100,60,60,10,85,90,10,60,100,100,100,100,0] #Overwritten during config.json load by iOEM_Calibrated_UV_LED_PWM
aryLED_Brightness_Chip_1_White_LEDs_Only = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,100] #OUT15 is LED, so last one.
aryLED_Brightness_Chip_2_White_LEDs_Only = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,100] #OUT15 is LED, so last one.
iOEM_Calibrated_UV_LED_PWM = [100,100,100,100,100,100,100,90,10,60,60,60,10,90,90,10,60,60,60,10,90,100,100,100,100,100,100,100]; #Loaded to LED number 0-27 as found on PCB from Config.json

fExposure_Power_mA_White_LED_Default = 14.0
fExposure_Power_mA_White_LED_Dimmed = 4.0

iLCD_Contrast = 23  #23 and 86 are peaks. See XLS Tab LCD_Contrast

#Init section for Pixel Over LEDs 
#aryLED_Brightness_Chip_1[ LED_4, LED_11, LED_12, LED_19, LED_26, na, LED_5, LED_6, LED_13, LED_20, LED_10, LED_28, LED_21, LED_14, LED_7, na]
#LED 0 == white LEDs to view LCD to get details on configutation as a UI
aryLED_To_LED1642_Output_Chip1 = [4,11,12,19,26,0,5,6,13,20,27,28,21,14,7,0] #This is a list 0-15 of Chip_Port with values of UV_LED_number i.e. Chip1_Port0 = UV_LED_4
aryLED_To_LED1642_Output_Chip2 = [25,24,23,22,18,17,16,15,8,9,10,1,2,3,0,0]
iPixel_Over_LED_Mode = 0; #0=Off : 1=Under_Pixel_Only_Full_Power : 2=Under_Px_Only_QACalibrated_Pwr : 3=Under_Px_Pnly_Equalized_Pwr : 4=Adjacent_Pix_Also_QA_Cal_Pwr : 5=Adjacent_Pix_Full_Power
            

#1/12/15 aryLED_Brightness_Chip_1 = [100,60,60,60,100,100,100,100,10,10,100,90,90,90,100,100]
#1/12/15 aryLED_Brightness_Chip_2 = [100,100,100,100,60,60,10,85,90,10,60,100,100,100,100,100]

#1/10/15 aryLED_Brightness_Chip_1 = [100,60,60,60,100,100,100,100,60,60,100,90,100,100,100,100]
#1/10/15 aryLED_Brightness_Chip_2 = [100,100,100,100,60,60,60,90,100,60,60,100,100,100,100,100]


#aryLED_Brightness_Chip_1 = [100,60,60,60,100,100,100,100,60,60,100,90,100,100,100,100]
#aryLED_Brightness_Chip_2 = [100,100,100,100,60,60,60,100,100,60,60,100,100,100,100,100]

#aryLED_Brightness_Chip_1 = [1,100,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
#aryLED_Brightness_Chip_2 = [1,1,1,1,100,1,1,1,1,1,1,1,1,1,1,1]
#aryLED_Brightness_Chip_1 = [1,20,40,60,80,100,5,50,90,100,90,80,70,60,50,40]
#aryLED_Brightness_Chip_2 = [2,20,30,40,50,60,70,80,90,100,90,80,70,60,50,2]
#aryLED_Brightness_Chip_2 = [100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]

min_version = (2,6) #Force a minimum Python Version
if sys.version_info < min_version :
    print >> stderr, "must be run with at least Python 2.6"
    sys.exit(1)
else:
    print("iBoxPrintmanager.py Loaded : python version: ",sys.version_info)
    sys.stdout.flush()

import serial #Digole from Paspbery Pi : From: http://www.seephar.com/2014/03/oled-display-for-raspberry-pi/

# START:  For StdIO Non Blocking Code
        # files monitored for input
read_list = [sys.stdin]
# select() should wait for this many seconds for input.
# A smaller number means more cpu usage, but a greater one
# means a more noticeable delay between input becoming
# available and the program starting to work on it.
timeout = 0.1 # seconds
last_work_time = time.time()
# END >> For StdIO Non Blocking Code

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


#Global Constants
bStepper_Drive_ULN2003 = TRUE
bUse_Display_NTSC = FALSE
bUse_Display_LCD = TRUE
bVideo_Output_NTSC = FALSE
bVideo_Output_Digole_128x64 = TRUE
imgTarget_Display_Size = 128, 64
strLayerImageDir = "/home/pi/projects/3D_Printer_Queue/"
strLayerImageSubDir = "_Rook" #"CagedBall" #"aluminum_beam_20mm_x20mm_x_600mm" #"HalfOpaque" #"aluminum_beam_20mm_x20mm_x_600mm" #"HalfOpaque" #"_Eiffel_Tower_100microns_42p9Tall" #"_Rabbit" #"_Rook" #"_Statue_Of_David_Head" #"_Rook" #"_Turbine_Dremel_Impeller" #"_Cellular_Lamp" #"_Birdcage_w_Bird" #"_Ring_Opensource_50micron" #"_Tank1" #"_Eiffel_Tower_100microns_42p9Tall" #"_Rabbit_50microns" #"_Ring_Link_50micron" #"_Pyramid5mm" #"_Rook" #"_Birdcage_w_Bird" #"_Rabbit" #"_Iron_Man_Ring1" #"_Thread_Draad_Both_60percent" #"_Keychain_Love" #"_Darth_Vader_med" #"_Lego_2x2" #"_Lego_Test1" #"_Lego_Ring" #"_Test_Calibration_Target_Form1" #"_Rook" #"_Manifold" #"_OpenBeam_Cap_BigBase" #"_Alum_Beam_20x20mm" #"_SphereGeo_W_Supports" #"_Iron_Man_Helmet2" #"_General_Grievous" #"_Tritium_Ring" #"_Cube_Hex_Supported_19mm" #"_SphereGeo_W_Supports" #"_Halo_Ring_100m" #"_Ring_95p_50micron" #"_Plug18mm" #"_Pyramid5mm" #"_Cube20mm" #"_OpenBeam_Cap" #"_Ring_110p_50micron" # #"_Ring_110p_50micron" #"_Ring_Square_Cutouts_RLCD" #"_RexSkull3_RLCD" #"_RexSkull2_RLCD" #"_RexSkull80p_RLCD" #"_RexSkull_RLCD" #"_Button_RLCD" #"_Cube_RLCD"
strLayerImageName_Base = "Rookv_fixed1" #"CagedSphere4" #"aluminumbeam600mm" #"HalfOpaque" #"aluminumbeam600mm" #"EiffelTower" #"bunny-flatfoot" #"Rookv_fixed1" #"david_remesh_01" #"Rookv_fixed1" #"Dremel_Impeller" #"cellularThing_optimizedForMakerbot" #"birdcage" #"open_hardware_ring" #"PzKpfw_VIB_Tiger_II" #"EiffelTower" #"bunny-flatfoot" #"linkBracelet" #"5mm_Calibration_Steps" #"Rookv_fixed1" #"birdcage" #"bunny-flatfoot" #"ironman_mask_ring_viv" #"DraadEnMoerVersie3_2_" #"keychain_love" #"darthVader_cleaned" #"customblock_r1_20131113-1047-a2c8l-0" #"L1" # #"L1" #"lego_ring3" #"calibrationtarget" #"Rookv_fixed1" #"manifold" #"TL625-000103-001_-_Feet_OpenBeam_1515" #"aluminumbeam600mm" #"sphere_plus_support" #"iron_mask_onepiece" #"GG_Printable" #"angel_ring-Actual_Cool_Ring" #"cube_small_supported" #"cube_small" #"sphere_plus_support" #"GD_Ring" #"test_plug" #"5mm_Calibration_Steps" #"20mm_Calibration_Box" #"TL625-000103-001_-_Feet_OpenBeam_1515" #"parametricRing_v.2.0" #"TL625-000103-001_-_Feet_OpenBeam_1515" #"parametricRing_v.2.0" #"dinifix" #"Dino_V1" #"Cutey-Rex_skins_OneHead" #"button_v1" #"Another_Hollow_Cube"
#//  SVG Print Vars  // 
strPrint_File_SVG = "" 
strPrint_File_Dir = "/home/pi/ibox/packages/"
strPtint_File_NoPath = "todo"
strPrint_File_SVG_noExt = "done"
strDirToMake = "done" #i.e. /home/pi/ibox/upload/data/your_file_name
strLayerImage_PNG_Folder_Append = "expanded/" #compressed/_svg/" #  4/3/15 was "data"

        
iNumber_Of_Layers = 301 #213 #50 #198 #301 #301 #549 #301 #170 #57 #160 #265 #506 #98 #427 #400 #429 #147 #72 #248 #301 #265 #198 #216 #237 #173 #130 #101 #113 #74 #281 #169 #301 #151 #68 #198 #231 #294 #261#187 67 #112 #55 #131 88 #248 #78 #131 #i.e. Last file number: #435 #Number of layers in current Print (Base 0, so 10 = 11 images 0-10) #150 #was 96; #i.e. 100 layers = 0-95


strLayerFileType = ".png"

#Printing States:
bPrinting_State_Printing = 0 # 0=Not printing 1=Printing
bPrinting_State_Printing_Last = 0;
bPrinting_State_Printing_Cancel = 0; #Set to 1 if you are printing and hit the print key again to CANCEL job
bPrinting_State_Driving_Stepper =0; #Print engine driving stepper, used to cancel mid stepper package execution in stepperStyep
bPrinting_State_Waiting_For_Platform_To_Reach_Bottom = 0; #platform moving down, waiting to print
bPrinting_Pause = 0
bEndstop_On_Z_Actuated = FALSE #Endstop = True means the Z has reached the lower range of its travel. The motor should not be actuaed further in this direction
iLayerNumber = 0
State_stepperEnable_Last = 0
iGlobal_Z_Position_Current = 0

start_time_Button_Down = 0.0
start_time_Button_Up = 0.0
start_time_Button_Print = 0.0

bBeep_After_Stepping = False
 
bLong_Press_Up = False
bLong_Press_Down = False 

#================  Printing Flags / Options / Settings  ==========================
bPrinting_Option_Direct_Print_With_Z_Homing = True #1=Zero Z before printing : 0=DO NOT Zero Z Before printing
#Z Travel Steps //  /1 = 1/8 :: /2 = 1/4 step. : /4 = 1/2 step :: /8 = 1:1 step
# at 1/8 Step moving 7.7mm UP takes 8 seconds and gives an accuracy of 64 steps / 50 microns.
#i.e. 1/2 is 4x faster than 1/8 and the step resolution drops from 50/64=[0.781 micron] to 50/(64/4)=[3.1 micron]
#i.e. at 1:1 step its 8x fater than 1/8th step and the resolution is 6.15 micron 50micron/(65/8) : Emperical: 3sec for 7mm
#Peel on Beta 2 is 6.5 and 7.5mm L / R so lets target 8mm = 80x 100micron layers = 80 * 164 = 13120 steps. At .006sec/step = 78 sec :( 8/31/14
#Reduced peel 9/1/14 : Removed 1x 5.6mm Peel_Z layer on each side. New L=2.8mm, new Right=1mm : 1.5mm = 2460steps == 14sec!! 3mm=5000steps @ 28sec

iGlobal_Z_Height_Peel_Stage_1 = 500 #microns Beta4=2500*(R=tight, L=one turn loosened) 4000 #3400 #2500 #300 : known Good #Fast part of peel
iGlobal_Z_Height_Peel_Stage_2 = 500 #microns Beta4=2500*(R=tight, L=one turn loosened) 4000 #3500 #500 #350 : known Good  #Slower part where the actual peel happens
iGlobal_Z_Layer_Thickness = 100 #microns Beta4=256 : 305 #257 #Beta3=256.83steps/100micron :1.5:1: Beta2=164steps/100micron on Beta2 : Alpha1=16 #Known Good:  for 50 micron : . 100 micron Layers
iOne_Layer_Of_Steps = 50  #iOne_Layer_Of_Steps = (iGlobal_Z_Layer_Thickness * iSteps_Per_100_Microns) / 100;
iSteps_Per_100_Microns = 256

iGlobal_Z_Layer_Micron_Thickness = 1 #was 100 for 100 microns/layer, but now we count in Microns and translate when we step using iSteps_Per_100_Microns #Must be set to calculate current position during Print
#1:1 50 microns at 6.18 microns/step = 8.09 steps : 65/8 ## for 75 microns 97 #was 65 for 50microns #was 129 #the Z Layer Thickness *see notes below on steps / mm
iGlobal_Z_Height_Retract = 30 #chaned to millimeters 3/14/2015 : 5511 #5500 #44000/8 #was 103332 #80mm on ORD Hadron Config_Alpha_A1 so 80/0.0007742=103,332 The highest Z to remove the finished part or perform maintence
iGlobal_Z_Height_Position_For_Print = 45 #Units mm #The endstop switch will stop it, have this be >> then Post Print Retract
iGlobal_Z_Height_Last_Build_Height = 0 #The last build completed, should be the current Z Height. If > 0 then there has been a Print attempt, thuus we can assume the unit was zeroed, thus the current heigt should be from True Z Zero.

########################################################
##### Red SubG seems to need at least a +1 on L4-N #### **UV LEDs need time to heat up and get to max current. First layer(s) exposure is lower because of this
#Printing Constants:####################################

iExposure_Time = 12.9 #12.9 #13 #known good for Alpha = 13 #12 #@140ma28led 13sec : @170mA Green 100micron = 18sec : #14sec@100micron : Units = Seconds i.e. 8.4sec : Known good for 50 microm=14sec :: 16 known good for 100 microns
iExposure_Time_First_Layer = 13 #16 #9.5 #35 #known good for Alpha = 35 #@140ma 28led 30sec : 30-32 is strong : @170mA Green 100micron = 24sec : #Green KG 22 #15sec@100micron : 17 known good 50 micron :: 19 known good for 100 micron ::  First layer gets longer exposures *Some Resin printers have the bottom 3 layers getting 40% more UV time i.e. 5sec 1-3layers, and 3 next N
fExposure_Power_mA = 9.99 #UV-LED Drive Current in mA (*the higher you drive them the lifespan can/will be reduced)
########################################################
intNumber_Of_Base_Layers = 3; #was 3

iGlobal_Z_Manual_Button_Speed_Up_Slow = 100 #150 #known good for Alpha = 30 #changed to iGlobal_Z_Layer_Thickness : was 30 #Increments per Push
iGlobal_Z_Manual_Button_Speed_Down_Slow = 100 #150 #known good for Alpha = 30 #changed to iGlobal_Z_Layer_Thickness : was 30 30 #Increments per Push
iGlobal_Z_Manual_Button_Speed_Up_Fast = 100000 #450 #known good for Alpha = 100 #Increments per Push
iGlobal_Z_Manual_Button_Speed_Down_Fast = 100000 #450 #known good for Alpha = 100 #Increments per Push
fDelay_Between_Rapid_Z_Botton_Events = 0.003 #known good for Alpha = 0.003 #in seconds. Delay between the Auto UP/Down button events, aka holding down button
#Acceleration Parameters
bStepper_Acceleration_Enabled = TRUE
bStepper_Deceleration_Enabled = TRUE
iGlobal_Z_Stepper_Acceleration_Percentage_Per_Step = 5 #Percentage of start-final speed to increase every step : i.e. 10 = 10% = 10 steps to get from initial delay to full_delay. 
iGlobal_Z_Stepper_Acceleration_Steps = 20
fGlobal_Stepper_Max_Pulse_Delay = 0.03
#Hardware mm/step emperical testing 5/27/14
#UP : 0.0007742mm/step or 0.774 microns/step
#Down : 0.00076mm/step or 0.76 microns *likely a testing error
#50 micron layer = 64.58279514337381
#100 micron layer = 129.16559028674762
#Could we run it at 1/4, 1/2 or 1:1 step? 
#1/8 = 129 steps / 100micron layer : 64.5 for 50micron
#1/4 = 64.58 steps / 100micron layer : 32 for 50 micron
#1/2 = 32.29 steps / 100micron layer : 16.145 for 50micron
#1:1 = 16.145steps / 100micron layer : 8 steps for 50 micron  
#Answer: Yes and it would be loads faster (800% at 1:1) and stronger for the PEEL process. 
#Cons: Resolution of layer thickness would not be acctrate, +/` 10%, but build height would still be fine because we know the distance. But it might be noiser.

#Units in seconds. Dataseet for 4988 states STEP Min HIGH Pulse = 1 uS or 0.000,001 sec : Same for LOW
#GRBL uses 30uS
#http://www.pololu.com/file/0J450/a4988_DMOS_microstepping_driver_with_translator.pdf
#Youtoube torque tests show 3mS to be max torque for 28BYJ-48 : https://www.youtube.com/watch?v=14jF8umwJLI&list=TLevyMuiCTzQvL_JuiRUI0BDY7kVrW0GuM
#Max torque is 300g-cm for unipolar, and 800g for bipolar at 5v (28BYJ-48) : https://www.youtube.com/watch?v=jHLyJbNgcDo&sns=em
#Testing of 28BYJ-48 on this site: http://www.jangeox.be/2013/10/stepper-motor-28byj-48_25.html
#  380 g-cm Full-Stepping at 3mS Delay aka 0.003
#  300 g-cm Half_Stepping at 3mS Delay
#  Max speed 1.2mS delay (0.0012) = 800pps = 5sec/rev
#  800g Full Step 5v in Bi-Polar Mode 3mS
fGlobal_Speed_Peel = 0.006 #0.012 most torque #0.001 #0.0011 #was for 1/8 th step 0.000060 #Fastest = 0.0000001, GRBL uses 0.00003
fGlobal_Speed_Down_Fast = 0.004 #0.002#0.001 ##0.0011 #was for 1:1 0.0007 #was 0.000001
fGlobal_Speed_Up_Fast   = 0.006 #0.002#0.001 ##0.0011 #was for 1:1 0.0008 #was 0.000001 for 1/8th step
fGlobal_Speed_Down_Slow = 0.01 #0.002#0.001 ##0.0011 #was for 1:1 0.0007 #was 0.000001
fGlobal_Speed_Up_Slow   = 0.01 #0.002#0.001 ##0.0011 #was for 1:1 0.0008 #was 0.000001 for 1/8th step
fGlobal_Speed_Down_Print = 0.004 #0.002#0.001 ##0.0011 #was for 1:1 0.0007 #was 0.000001
fGlobal_Speed_Up_Print   = 0.006 #0.002#0.001 ##0.0011 #was for 1:1 0.0008 #was 0.000001 for 1/8th step
#Test times:
#0.01sec has great torque on 28BYJ-48 5V at 140 mA (as set on driver)
#0.001 sec is fastest, but misses stepa on UP, need more testing
#0.01 sec is reliable on Down and medium torque *more tetsting needed 8/30/2014

#Calibration Vars
iGlobal_Calibration_Current_LED = 0

#Test Height / Step
#T#1 10000 steps @ 0.01sec DOWN ==> Result: 6.085mm / 10016 steps = 1646 steps / mm so 1step = 0.0006075mm == 0.6075microns = 100 micron layer = 164.6 steps
#T#2 Set layer thickness to 1000 then run 10x layers to make sure the start and end position is the same. So make final retract 1 : ==> Result: Start=58.68mm End=

strRoot_Path = "/home/pi/ibox/"
strSystem_File_Name = "mysystem.json"
strConfig_File_Name = "default.json"
strConfig_File_PathAndName = "/home/pi/ibox/"
strDashBeforeNumbers = "_" #was "_", but for easier integration with CreationWorkshop and how they number their files... Update: 4/3/15 F Creat Wkshop, _ is smarter
iJSON_System_File_Load_Counter = 0

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

bInvert_Stepper_Direction = TRUE
iGlobal_Currently_Stepping = FALSE

bSoundEnabled = TRUE

splash_screen_white_led_counter = 0

#Configure GPIO Pins

#ToDo List
# ILLUM_CTRL_GPIO3
#gpio_led_red_LCD_Illumination = 3

# BUZZER_PIEZO_GPIO15
gpio_sound_piezo_element = 15

#Indication LEDs RGB =======
#=======================
#====  Print RGB LEDs =====
#=====================
# B1_LED_RED_GPIO17           16 for SPI : 4 for pre 1p12p13 PCBs
# B1_LED_RED_GPIO17           20 for SPI : 4 for pre 1p12p23 PCBs
gpio_stepper_pin_led_red_B1 = 27# 2/1/15 PCB 1p12p30 : was 16#4##27 #4 #RGB 4,17,27
# B1_LED_GRN_GPIO4
gpio_stepper_pin_led_green_B1 = 20# 2/1/15 PCB 1p12p30 : was 27##17 #9/4/14==red
# B1_LED_BLU_GPIO27
gpio_stepper_pin_led_blue_B1 = 17##4 #27 #9/4/14==red

#Indication Single Color LEDs
# B2_LED_RED_GPIO22
#gpio_stepper_pin_led_red_B2 = 2 #22 #Changing to BUTTON_B_LED_BLU_GPIO2 for pCB Ver 1p5
BUTTON_B_LED_BLU = 2#18 #2 #v1p5p0
# B2_LED_GRN_GPIO18
#gpio_stepper_pin_led_green_B2 = 18 #Changing to : BUTTON_A_LED_GRN_GPIO18 for PCB Version 1p5
BUTTON_A_LED_GRN = 18#2 #18 #v1p5p0
# B2_LED_BLU_GPIO2
#gpio_stepper_pin_led_blue_B2 = 22 #2 #Changing to BUTTON_C_LED_RED_GPIO22 for PCB Ver 1p5
BUTTON_C_LED_RED = 16 # 2/1/15 depreciated, no longer an LED on the STOP pin button C22 #v1p5p0

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


#///  DRV8834
# STEPPER_STEP_GPIO23
gpio_stepper_pin_step = 23 #one step tells the 4988 chip to increment 1x step.
# STEPPER_DIRECTION_GPIO24
gpio_stepper_pin_direction = 24 #0=down 1=up
# STEPPER_ENABLE_GPIO25
gpio_stepper_pin_enable = 25 #0= enable all stepper drivers 1=disable
#///  ULN2003
gpio_stepper_pin_1 = 23
gpio_stepper_pin_2 = 24
gpio_stepper_pin_3 = 5 #was 3, but needed I2C Port
gpio_stepper_pin_4 = 22

#SPI
bUse_SPI_LED1642_BitBang = True

gpio_spi_sdo = 9
gpio_spi_clk = 11
gpio_spi_le = 21
gpio_spi_sdi = 10
gpio_led1642_pwm = 20 #was 4 : Moved to 20 to ditch it temp, using WiringPi and its GPIO pcmd line program instead To Be Implemented

aryLED_State = [];

iPrint_Counter = -1
iPrint_Time = -1
iPrint_UV_Time = -1
iLoad_Counter_Python = -1

# LCD_DATA_TX0_GPIO14 
#dead gpio_stepper_pin_button_pause = 11 #Pause print Job

class cPM(object):
    screen = None;
    port = serial.Serial("/dev/ttyAMA0", baudrate=9600, timeout=1.0) #known good, 11/20/14, trying to speed up digole image load.

    
    def __init__(self):
        "Ininitializes Print Manager"
        global bStepper_Drive_ULN2003
        print("...initializing Print Manager")
        #bStepper_Drive_ULN2003 = True moved to after first mySystem load, then set based on hardware version. i.e. 1.0 = False
        
        self.SPI_LED1642_Set_Clock_On_GPIO4(2400000)
        

                
        for s in range(50):
            aryLED_State.append(0); #set all LEDs to ON
        
        #Initialize GPIO : http://sourceforge.net/p/raspberry-gpio-python/wiki/Inputs/
        GPIO.setmode(GPIO.BCM)
        
        GPIO.setup(gpio_stepper_pin_enable, GPIO.OUT) #prevent crash in case the UNL2003 selection is misset.
        if(bStepper_Drive_ULN2003 == False):
            print(">>>   >>>>   >>> DRV8834");
            GPIO.setup(gpio_stepper_pin_step, GPIO.OUT) 
            GPIO.setup(gpio_stepper_pin_direction, GPIO.OUT)
            
        else: #ULN2003
            print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> UNL2003 ::::");
            GPIO.setup(gpio_stepper_pin_1, GPIO.OUT)
            GPIO.setup(gpio_stepper_pin_2, GPIO.OUT)
            GPIO.setup(gpio_stepper_pin_3, GPIO.OUT)
            GPIO.setup(gpio_stepper_pin_4, GPIO.OUT)
        
        GPIO.setup(gpio_stepper_pin_led_red_B1, GPIO.OUT) 
        GPIO.setup(gpio_stepper_pin_led_green_B1, GPIO.OUT)
        GPIO.setup(gpio_stepper_pin_led_blue_B1, GPIO.OUT)
        GPIO.setup(BUTTON_B_LED_BLU, GPIO.OUT)
        #Test of outputing a frequency on GPIO 4 ro drive the dimming portion CLK of the ST LED1642 constant current led chip
        #GPIO.setmode(GPIO.BCM)
        #GPIO.setup(4,GPIO.ALT0)
        #GPIO.setclock(4,9500000) Result: This lib is missing key features of the standard GPIO lib, like callbacks and interrupts.
        
        GPIO.setup(BUTTON_A_LED_GRN, GPIO.OUT)
        #GPIO.setup(BUTTON_C_LED_RED, GPIO.OUT)
        
        #GPIO.setup(gpio_stepper_pin_led_UV, GPIO.OUT) #, pull_up_down=GPIO.PUD_DOWN) #, pull_up_down=GPIO.PUD_UP)
        
        GPIO.setup(gpio_stepper_pin_button_down, GPIO.IN)
        GPIO.setup(gpio_stepper_pin_button_up, GPIO.IN)
        GPIO.setup(gpio_stepper_pin_button_endstop, GPIO.IN) #, pull_up_down=GPIO.PUD_DOWN)
        GPIO.setup(gpio_stepper_pin_button_print, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
        
        #GPIO.setup(gpio_led_red_LCD_Illumination, GPIO.OUT)
        GPIO.setup(gpio_sound_piezo_element, GPIO.OUT)
        
        if bUse_SPI_LED1642_BitBang == True:
            
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

        
        print("Running __init__");
        
        print("Set initial GPIO States");
        if(bStepper_Drive_ULN2003 == False):
            GPIO.output(gpio_stepper_pin_enable, 0)
        else: #ULN2003
            GPIO.output(gpio_stepper_pin_1, ULN2003_OFF)
            GPIO.output(gpio_stepper_pin_2, ULN2003_OFF)
            GPIO.output(gpio_stepper_pin_3, ULN2003_OFF)
            GPIO.output(gpio_stepper_pin_4, ULN2003_OFF)
            
        #GPIO.output(gpio_stepper_pin_led_UV, UV_LED_OFF);
        
        #LED Test Routine
        bLED_Test_Routine = True
        if bLED_Test_Routine == True:
            print("All LEDs ON")
            GPIO.output(gpio_stepper_pin_led_red_B1, LED_ON);
            GPIO.output(gpio_stepper_pin_led_green_B1, LED_ON);
            GPIO.output(gpio_stepper_pin_led_blue_B1, LED_ON);
            
            GPIO.output(BUTTON_B_LED_BLU, LED_ON);
            time.sleep(0.5);
            print("All LEDs OFF")
            GPIO.output(gpio_stepper_pin_led_red_B1, LED_OFF);
            GPIO.output(gpio_stepper_pin_led_green_B1, LED_OFF);
            GPIO.output(gpio_stepper_pin_led_blue_B1, LED_OFF);
            
            GPIO.output(BUTTON_B_LED_BLU, LED_OFF);
            GPIO.output(BUTTON_A_LED_GRN, LED_OFF);
            time.sleep(0.5);
            print("All Red and Button A")
            GPIO.output(gpio_stepper_pin_led_red_B1, LED_ON);
            GPIO.output(gpio_stepper_pin_led_green_B1, LED_OFF);
            GPIO.output(gpio_stepper_pin_led_blue_B1, LED_OFF);
            
            GPIO.output(BUTTON_B_LED_BLU, LED_OFF);
            GPIO.output(BUTTON_A_LED_GRN, LED_ON);
            time.sleep(0.5);
            print("All Green and Button B")
            GPIO.output(gpio_stepper_pin_led_red_B1, LED_OFF);
            GPIO.output(gpio_stepper_pin_led_green_B1, LED_ON);
            GPIO.output(gpio_stepper_pin_led_blue_B1, LED_OFF);
            
            GPIO.output(BUTTON_B_LED_BLU, LED_ON);
            GPIO.output(BUTTON_A_LED_GRN, LED_OFF);
            time.sleep(0.5);
            print("All Blue and Button A + B")
            GPIO.output(gpio_stepper_pin_led_red_B1, LED_OFF);
            GPIO.output(gpio_stepper_pin_led_green_B1, LED_OFF);
            GPIO.output(gpio_stepper_pin_led_blue_B1, LED_ON);
            
            GPIO.output(BUTTON_B_LED_BLU, LED_ON);
            GPIO.output(BUTTON_A_LED_GRN, LED_ON);
            time.sleep(1.0);
        
        GPIO.output(gpio_stepper_pin_led_red_B1, LED_OFF);
        GPIO.output(gpio_stepper_pin_led_green_B1, LED_OFF);
        GPIO.output(gpio_stepper_pin_led_blue_B1, LED_OFF);
        
        GPIO.output(BUTTON_B_LED_BLU, LED_OFF);
        GPIO.output(BUTTON_A_LED_GRN, LED_OFF);
        #GPIO.output(BUTTON_C_LED_RED, LED_ON);
        
        GPIO.output(gpio_sound_piezo_element, PIEZO_OFF);
        
        #Turn on internal RED Illum  //
        #GPIO.output(gpio_led_red_LCD_Illumination, NPN_LED_ON); #does not work, led likely in backwards ;)
        
        #Diasable Stepper Driver : Else they default to ON with current at 440mA instead of Idle at 240- (no wifi) to 280mA with WiFi
        self.stepperEnable(FALSE);
        

        #Turn off UV LEDs and turn on White LEDs so you can see the pretty Logo
        self.SPI_LED1642_Set_Brightness_PWM(101,aryLED_Brightness_Chip_1_White_LEDs_Only,aryLED_Brightness_Chip_2_White_LEDs_Only)
        #Adjust current of LEDs
        self.SPI_LED1642_Register_Configuration(fExposure_Power_mA_White_LED_Default); 
        #Turn on White LEDs
        self.controlLED_UV(UV_LED_ON);
        
        #File Info Defaults
        #imgLayerImage = pygame.image.load('Direct_Resin_Lithography_848x480.png').convert()
        #Example: /home/pi/projects/3D_Printer_Queue/Another_Hollow_Cube0000.png -...- 0096.png
        #Set Globally Now
        #strLayerImageDir = "/home/pi/projects/3D_Printer_Queue/";
        #strLayerImageName_Base = "Another_Hollow_Cube";
        iLayerNumber = 0; #Base 0
        strLayerFileType = ".png"
        
        #ONLY FOR NTSC
        if bUse_Display_NTSC:
            # Based on "Python GUI in Linux frame buffer"
            # http://www.karoltomala.com/blog/?p=679
            disp_no = os.getenv("DISPLAY")
            if disp_no:
                print ("I'm running under X display = {0}".format(disp_no));
            
            # Check which frame buffer drivers are available
            print("Processing FBCon Drivers");
            # Start with fbcon since directfb hangs with composite output
            drivers = ['fbcon', 'directfb', 'svgalib']
            print("Drivers: ", drivers);
            found = False
            for driver in drivers:
                # Make sure that SDL_VIDEODRIVER is set
                if not os.getenv('SDL_VIDEODRIVER'):
                    os.putenv('SDL_VIDEODRIVER', driver)
                try:
                    pygame.display.init()
                except pygame.error:
                    print ('Driver: {0} failed.'.format(driver));
                    continue
                found = True
                break
        
            if not found:
                raise Exception('No suitable video driver found!')
            
            size = (pygame.display.Info().current_w, pygame.display.Info().current_h)
            print ("Framebuffer size: %d x %d" % (size[0], size[1]));
            self.screen = pygame.display.set_mode(size, pygame.FULLSCREEN) #fails here sometimes and requires a reboot. A ctrrl+C clears this fail. Maybe a try; except;
            # Clear the screen to start
            self.screen.fill((0, 0, 0))        
            # Initialise font support
            print("init pygame font support")
            pygame.font.init()
            # Render the screen
            print("update display");
            pygame.display.update()
 
    def __del__(self):
        "Destructor to make sure print manager shuts down, etc."
        
    def get_ipaddress(self): #DOES NOT WORK
        "Returns the current IP address"
        #arg='ip route list'
        #p=subprocess.Popen(arg,shell=True,stdout=subprocess.PIPE)
        #data = p.communicate()
        #split_data = data[0].split()
        #ipaddr = split_data[split_data.index('src')+1]
        ipaddr = socket.gethostbyname(socket.gethostname());
        return ipaddr
        
    def get_local_ip_address(self,target):
        "Get the local paspberry Pi IP Address"
        #This one works!!!!!
        ipaddr = ''
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect((target, 8000))
            ipaddr = s.getsockname()[0]
            s.close()
        except:
            ipaddr = "error_2"
            pass
        
        return ipaddr
        
    def get_local_host_name(self) :
        "Get local host name"
        try:
            host_name = socket.gethostname()
        except:
            host_name = "error_3"
            pass
        
        print("host_name=",host_name);
        return host_name
        
    def get_local_wlan_ssid(self):
        "Get the current SSID"
        from subprocess import check_output
        ssid = "WiFi not found"
        
        try:
            #scanoutput = check_output(["iwlist", "ra0", "scan"])
            #from: http://askubuntu.com/questions/117065/how-do-i-find-out-the-name-of-the-ssid-im-connected-to-from-the-command-line
            #ssid = check_output(["iwgetid", "-r"])
            scanoutput = check_output(["iwgetid"])
            
            
            for line in scanoutput.split():
              line = line.decode("utf-8")
              if line[:5]  == "ESSID":
                ssid = line.split('"')[1]
        except:
            ssid = "error_4"
            pass
        
        print("ssid=",ssid)
        return ssid;
    
        
    def clear_screen(self):
        #self.screen.fill(WHITE); #Does not work??
        #pygame.clear(screen, backgroundSurface)
        size = (pygame.display.Info().current_w, pygame.display.Info().current_h)
        self.screen = pygame.display.set_mode(size, pygame.FULLSCREEN)
        self.screen.fill((0, 0, 0))
        # Update/Render the screen
        pygame.display.update()

        
    def changeLayer_NTSC(self, iLayerNumberCurrent):
        "Change the displayed image from splash screen or current Layer to indicated layer"
        #First clear the screen:
        self.clear_screen();
         
        iLayerNumber = iLayerNumberCurrent;
        strLayerNumber = str(iLayerNumber);
        #must pad to 0000, 0001, etc
        #print("len",len(strLayerNumber));
        #print('Image#', iLayerNumber);

        if(strDashBeforeNumbers == ""):
            if len(strLayerNumber) == 1:
                strLayerNumber = "000" + strLayerNumber;
                
            if len(strLayerNumber) == 2:
                strLayerNumber = "00" + strLayerNumber;
            
            if len(strLayerNumber) == 3:
                strLayerNumber = "0" + strLayerNumber;
        
        strLayerImageName = strLayerImageDir + "/" + strLayerImageName_Base + strDashBeforeNumbers + strLayerNumber + strLayerFileType;
        print("->" + strLayerImageName );
        imgLayerImage = pygame.image.load(strLayerImageName).convert()
        #write to screen
        self.screen.blit(imgLayerImage, (0,0));
        # Update/Render the screen
        pygame.display.update()

    def changeLayer_LCD(self, iLayerNumberCurrent):
        "Change the displayed image from splash screen or current Layer to indicated layer on LCD"
        global aryLED_State
        #Clear Display 
        self.lcd_clear() #cPM.cPM
        
        iLayerNumber = iLayerNumberCurrent;
        strLayerNumber = str(iLayerNumber);
        #must pad to 0000, 0001, etc
        #print("len",len(strLayerNumber));
        #print('Image#', iLayerNumber);
        if(strDashBeforeNumbers == ""):
            if len(strLayerNumber) == 1:
                strLayerNumber = "000" + strLayerNumber;
                
            if len(strLayerNumber) == 2:
                strLayerNumber = "00" + strLayerNumber;
            
            if len(strLayerNumber) == 3:
                strLayerNumber = "0" + strLayerNumber;
        
        strLayerImageName = strLayerImageDir + "/" + strLayerImageName_Base + strDashBeforeNumbers + strLayerNumber + strLayerFileType;
        print("->" + strLayerImageName + " => LCD");
        ###############################################
        ##### From 3 in Init  ###########################
        ###############################################
        boolImage_Loaded = False
        try:
            img = Image.open(strLayerImageName) #Using PIL (Python Image Library)
            boolImage_Loaded = True
            #Moved below so I can trap errors
        except: #Exception handling whilst opening files is always a great idea 
            boolImage_Loaded = False
            print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            print("!!!!!!!!!!!           Unable to load image: ",strLayerImageName)
            print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            #really should exit
            #The images may be in "processing" from Imagemagick's convert cmd line.
            #Maybe wait 10sec and try again?
            #turn off UV_LEDs
            #Disable UV LED
            self.controlLED_UV(UV_LED_OFF);
            time.sleep(10)
            iLayerNumberCurrent = iLayerNumberCurrent - 1 #rewind
            #comment this out for all pixel Clear
            bPrinting_State_Printing_Cancel = 1;
            return;
    
        if boolImage_Loaded == False:
            print(" Image did not load, exiting........")
            return;
            
        #print("The size of the Image is: ")
        #Debug i.e. PNG (128,64) RGBA 
        #print(img.format, img.size, img.mode)
        #if coming from Creation Workshop, the images will be 128x64 and scaled for the 40x19mm screen.
        #If coming from Slic3r, they will be scaled in SVG to some arbitrary pixel width/height that is less than the 40x19mm inputted into the printer>settings>build area config of Slic3r
        # Format to LCD size; currently 128x64
        if img.size != imgTarget_Display_Size: 
            print("Slic3r to iBox Nano : Image must be inserted in center of screen;  from " , img.size , " to " , imgTarget_Display_Size[0] , ", " , imgTarget_Display_Size[1])
            #try and do this from Imagemajic. Canvas needs to be set to 40x19, then you can scale and have it work.
            
        # Format to LCD size; currently 128x64
        if img.size != imgTarget_Display_Size: 
            print("Image must be resized from " , img.size , " to " , imgTarget_Display_Size[0] , ", " , imgTarget_Display_Size[1])
            basewidth = imgTarget_Display_Size[0]
            wpercent = (basewidth/float(img.size[0]))
            hsize = int((float(img.size[1])*float(wpercent)))
            print("Ratio from " , img.size , " to " , imgTarget_Display_Size[0] , ", " , imgTarget_Display_Size[1] , " is: " , wpercent , " so new Y is: " , hsize)
            #img = img.resize((basewidth,hsize), Image.ANTIALIAS)
            img = img.resize((basewidth,hsize))
            print("The NEW size of the Image is: ")
            print(img.format, img.size, img.mode)

        # use Image Convert to Type 1 (white or black) from: http://stackoverflow.com/questions/20541023/in-python-how-to-convert-array-of-bits-to-array-of-bytes
        bUse_ImgConvertType1Fcn = TRUE
        if bUse_ImgConvertType1Fcn:
            bits = list(img.convert("1").getdata())  #"list" converts image data to an ordinary sequence, in this case named "bits"
            #Other ways to access the image raw data:
            #pixels = img.load()
            
            #width, height = img.size
            #for x in range(width):
                #for y in range(height):
                    #cpixel = pixels[x, y]
                    #bw_value = int(round(sum(cpixel) / float(len(cpixel))))
                    #the above could probably be bw_value = sum(cpixel)/len(cpixel)
                    #all_pixels.append(bw_value)
                
            #im.getpixel(xy) ⇒ value or tuple ==> VERY SLOW
            #tobitmap #
            #im.tobitmap() ⇒ string
            #Returns the image converted to an X11 bitmap.
            #tostring #
            #im.tostring() ⇒ string
            #bits = list(img.convert("1").getdata())
            #Roll through array and change all 255s to 1s
            #for item in bits:
            #    if item == 255:
            #        bits[item] = 1 
            #    else:
            #        bits[item] = 0
            #b = raw_img_data
            # assuming that `bits` is your array of bits (0 or 1)
            # ordered from LSB to MSB in consecutive bytes they represent
            # e.g. bits = [0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1] will give you bytes = [128,255]
            bytesFromImgBits = [sum([byte[b] << b for b in range(0,8)]) for byte in zip(*(iter(bits),) * 8)]
            # warning! if len(bits) % 8 != 0, then these last bits will be lost
            # Send byte to LCD, rinse and repeat for 128x64=8192 bits or 1024 bytes.
            self.digole_drawBitmap_From_PIL_Image_Data(0,0,128,64,bytesFromImgBits); #cPM.cPM
            
            #Rotate Image
            #cPM.lcd_Tx_CMD("SD" + chr(2)) #rotate 0-3 = 0deg -- 270 deg ::==> Did not work
            
            #iPixel_Over_LED_Mode = 1; #0=Off : 1=Under_Pixel_Only_Full_Power : 2=Under_Px_Only_QACalibrated_Pwr : 3=Under_Px_Pnly_Equalized_Pwr : 4=Adjacent_Pix_Also_QA_Cal_Pwr : 5=Adjacent_Pix_Full_Power
            if iPixel_Over_LED_Mode == 0:
                #No fancy UAP (Under Active Pixel aka Pixel_Over_LED) modes here. Brightness of LEDs were set to defaults outside of this function. We need to set them here to turn OFF the white LEDs
                aryLED_Brightness_Chip_2[15] = 0   #Turn OFF White LEDs
                aryLED_Brightness_Chip_1[15] = 0   #Turn OFF White LEDs
                #The brightness function is called at every layer from : def print_all_layers(self): , but this function is called drom print_all_layers at each layer change.

            elif iPixel_Over_LED_Mode > 0:
                print("Using iPixel_Over_LED_Mode=",iPixel_Over_LED_Mode);
            
                #Set LED Brightness based on if there is open pixels above said LED.
                #This is to increase the Contrast between Opaque pixels and transparent pixels. 
                #Increasing contrast could have the following benefits:
                # 1. Unintended cure of resin due to some dose making it through the Opaque lcd pixels
                # 2. Sheeting and/or "slag" from unintended cure
                # 3. Increased LED power (mA->thus->uW/cm^2) which has the benefit of reduced cure time which has the benefit of reduced print time. i.e. 6mA takes 22sec/layer, and 12mA could take only 11sec/layer.
                # 4. Reduced current consumption which has many benefits including extended battery life, increased LED lifetime, reduced internal heating, reduced RPi current loading
                
                #Steps:
                #1. If any Pixel above LED_N is transparent, then the LED brightness should be > 0
                #2. If any Pixel above an adjacent LED to LED_N is transparent, then the LED_N brightness should be > 0 *Note: Adjavent is assuming 15 deg spread LEDs. At 30deg its two-adjacent. i.e. L-2 - L-1 L L+1 L+2
                #3. Pixels are "shades of grey" and thus do not have to be binary ON/OFF. i.e. if a nearby pixel needs some power the adjacent lEDs can be PWMed to 70%
                #Current brightness is stored in aryLED_Brightness_Chip_1 and aryLED_Brightness_Chip_2
                
                #Get list of Pixel Data:
                #1. http://stackoverflow.com/questions/1109422/getting-list-of-pixel-values-from-pil
                
                #Iterate though 128 pixels in chunks of 128/number of LEDs or more specifically width_in_pixels / led_count_width or 128/7
                #Iterate through 64 pixels in chinks of 64/number of LEDs or height_in_pixels / led_count_height or 64 / 4
                width_in_pixels, height_in_pixels = img.size
                iCurrent_LED_Square = 0
                led_count_height = 4;
                led_count_width = 7;
                iWidth_Step = int(width_in_pixels / led_count_width)
                iHeight_Step = int(height_in_pixels / led_count_height)
                print("iWidth_Step=",iWidth_Step," iHeight_Step=",iHeight_Step, " width_in_pixels=",width_in_pixels," height_in_pixels=",height_in_pixels)
                pixels = img.load()
                #aryLED_State[]; #28 elements, one per LED. Populated by default with 1s at Init
                PIXEL_ON = False
                    
                #print("START :: aryLED_Brightness_Chip_1:",aryLED_Brightness_Chip_1)
                #print("START :: aryLED_Brightness_Chip_2:",aryLED_Brightness_Chip_2)     
                
                for y in range(0, height_in_pixels, iHeight_Step): #Python3 range(begin, end, step) :: width-1 because 18.2 leaves a fraction that causes there to be 8 rows of leds instead of 7
                    for x in range(0, width_in_pixels-iWidth_Step, iWidth_Step):
                        iCurrent_LED_Square = iCurrent_LED_Square + 1
                        #This puts you in the CORNER pixel of each Square Area Over LED
                        #Now loop through this box looking for pixels. As sooon as you find one, mark it as LED ON and move to the next BOX
                        for xx in range(x,x+iWidth_Step):
                            for yy in range(y,y+iHeight_Step):
                                PIXEL_ON = False
                                if xx > 127:
                                    print("x: error---------------- xx=",xx," yy=",yy)
                                    xx = 127
                                    
                                if yy > 63:
                                    print("y : yyyyy error---------------- xx=",xx," yy=",yy)
                                    yy = 63
                                    
                                cpixel = pixels[xx, yy]
                                if isinstance( cpixel, int ):
                                    if cpixel == 0: #Single element aka True Binary black and white image
                                        MK=1;
                                    else:
                                        #print("[[",xx,",",yy,"]] - iCurrent_LED_Square=(",iCurrent_LED_Square,") :: cpixel=",cpixel)
                                        PIXEL_ON = True
                                        break
                                else:
                                    if cpixel[0] == 0: #Multiple elements, likely RGB
                                        MK=1;
                                    else:
                                        #print("[[",xx,",",yy,"]] - iCurrent_LED_Square=(",iCurrent_LED_Square,") :: cpixel=",cpixel)
                                        PIXEL_ON = True
                                        break

                                #if cpixel > 0:
                            if PIXEL_ON == True:
                                break

                                                          
                        if PIXEL_ON == True:
                            #print(">>>iCurrent_LED_Square=",iCurrent_LED_Square)
                            aryLED_State[iCurrent_LED_Square] = 1;
                            print("LED[",iCurrent_LED_Square,"]=",PIXEL_ON)
                        else:
                            aryLED_State[iCurrent_LED_Square] = 0;
                        
                        #Reset:
                        PIXEL_ON = False
                        
                        #cpixel = pixels[x, y]
                        #bw_value = round(sum(cpixel) / float(len(cpixel)))
                        #the above could probably be bw_value = sum(cpixel)/len(cpixel)
                        #all_pixels.append(bw_value)
                        #print("[",x,",",y,"] - iCurrent_LED_Square=(",iCurrent_LED_Square,") :: cpixel=",cpixel," : PIXEL_ON=",PIXEL_ON)
            
                #Print out entire 28 LED array to console to make it Human Readable
                iCurrent_LED_Square = 0;
                for y in range(0, height_in_pixels, iHeight_Step): 
                    print(" : "); 
                    for x in range(0, width_in_pixels-iWidth_Step, iWidth_Step): 
                        iCurrent_LED_Square = iCurrent_LED_Square + 1;
                        print(" : " , aryLED_State[iCurrent_LED_Square], end="")
                    print(" : ");  
                
                if iPixel_Over_LED_Mode == 4 or iPixel_Over_LED_Mode == 5:
                    print("Adjacent LED Version:===================")
                    aryLED_State_TMP = aryLED_State[:]; #Make a copy
                    #Find Adjacent LEDs
                    for L in range(1,29):
                        C = L - 1; #int((L - 1)/7) #For determining of the leds are on the same row you need to int((LED_Number - 1) / 7)
                        #print("L=",L)
                        if aryLED_State[L] == 1: #only enable adjacenet LEDs for active LEDs
                            if int((C+1)/7) == int((C)/7): #+1
                                aryLED_State_TMP[L+1] = 1;
                                #print(L," : #+1 : aryLED_State_TMP[",L+1,"]=",aryLED_State_TMP[L+1])
                            if int((C-1)/7) == int((C)/7): #-1  
                                aryLED_State_TMP[L-1] = 1;  
                                #print(L," : #-1 : aryLED_State_TMP[",L-1,"]=",aryLED_State_TMP[L-1])
                            if L+7 <= 28: #In bounds ABOVE
                                if int((7+C+1)/7) == int((7+C)/7): #+One Row +1
                                    aryLED_State_TMP[L+7+1] = 1;
                                    #print(L," : #+One Row +1 : aryLED_State_TMP[",L+7+1,"]=",aryLED_State_TMP[L+7+1])
                                if int((7+C-1)/7) == int((7+C)/7): #+One Row -1  
                                    aryLED_State_TMP[L+7-1] = 1;   
                                    #print(L," : #+One Row -1 : aryLED_State_TMP[",L+7-1,"]=",aryLED_State_TMP[L+7-1])
                                aryLED_State_TMP[L+7] = 1; #+One Row +0 aka Directly Above
                            if L-7 >= 1: #In bounds BELOW
                                if int((C+1-7)/7) == int((C-7)/7): #-One Row +1
                                    aryLED_State_TMP[L-7+1] = 1;
                                if int((C-1-7)/7) == int((C-7)/7): #-One Row -1  
                                    aryLED_State_TMP[L-7-1] = 1;      
                                aryLED_State_TMP[L-7] = 1; #+One Row +0 aka Directly Above
                                    
                    
                    
                    iCurrent_LED_Square = 0;
                    for y in range(0, height_in_pixels, iHeight_Step): 
                        print(" : ");
                        for x in range(0, width_in_pixels-iWidth_Step, iWidth_Step):
                            iCurrent_LED_Square = iCurrent_LED_Square + 1;
                            print(" : " , aryLED_State_TMP[iCurrent_LED_Square], end="")
                        print(" : "); 
                        
                    aryLED_State = aryLED_State_TMP[:]; #Copy back to original Array : Make a copy
                    
                #Turn off LEDs that are NOT NEEDED: This will increase contrast and decrease inadvertant cure.
                #Notes: The screen is inverted. 
                #LED1 is Front-Right and 28 is Rear-Left
                #USE def SPI_LED1642_Set_Brightness_PWM(self, iBrightness_Percentage, aryLED_Brightness_Chip_1, aryLED_Brightness_Chip_2):
                #or ON/OFF, like "77" but the code is not written.
                #Pythin Lists: http://effbot.org/zone/python-list.htm
                #Although I refer tho them as Arrays in Python these are Lists. To make a copy of a list you need to use A = B[:], NOT A = B. If you use A = B then both lists will be modified if either is modified. 
                aryLED_Brightness_Chip_1_TMP = aryLED_Brightness_Chip_1[:];
                aryLED_Brightness_Chip_2_TMP = aryLED_Brightness_Chip_2[:];
                
                #aryLED_Brightness_Chip_1[ LED_4, LED_11, LED_12, LED_19, LED_26, na, LED_5, LED_6, LED_13, LED_20, LED_10, LED_28, LED_21, LED_14, LED_7, na]
                #LED 0 == white LEDs to view LCD to get details on configutation as a UI
                # Moved to begining of file as static 
                ##aryLED_To_LED1642_Output_Chip1 = [4,11,12,19,26,0,5,6,13,20,27,28,21,14,7,0] #This is a list 0-15 of Chip_Port with values of UV_LED_number i.e. Chip1_Port0 = UV_LED_4
                ##aryLED_To_LED1642_Output_Chip2 = [25,24,23,22,18,17,16,15,8,9,10,1,2,3,0,0]

                #Loop through Chip ports, turning the PWM to ZERO for the un-used LEDs, and setting the PWM for the used LEDs from the Manufacturing_and_Test_Array aryLED_Brightness_Chip_1
                for i in range(15): #Loop through LED1642 Chip Ports
                    if aryLED_State[aryLED_To_LED1642_Output_Chip1[i]] == 1:# ON
                        if iPixel_Over_LED_Mode == 1: #0=Off : 1=Under_Pixel_Only_Full_Power : 2=Under_Px_Only_QACalibrated_Pwr : 3=Under_Px_Pnly_Equalized_Pwr : 4=Adjacent_Pix_Also_QA_Cal_Pwr
                            aryLED_Brightness_Chip_1_TMP[i] = 100;
                        elif iPixel_Over_LED_Mode == 2:
                            aryLED_Brightness_Chip_1_TMP[i] = aryLED_Brightness_Chip_1[i]
                        elif iPixel_Over_LED_Mode == 3:
                            #No UAP - F
                            aryLED_Brightness_Chip_1_TMP[i] = aryLED_Brightness_Chip_1_Full_PWR[i] # TEMP Solution
                        elif iPixel_Over_LED_Mode == 4:
                            aryLED_Brightness_Chip_1_TMP[i] = aryLED_Brightness_Chip_1[i]
                            #Enable Adjacent LEDs @ Equalized PWR using Adjacent LED List. i.e. LED 11 has 10,12 + 3,4,5 + 17,18,19 as adjacent, some have less. i.e. LED 1 only has 2,9,8 adjacent
                            #Done when building aryLED_To_LED1642_Output_Chip1
                        elif iPixel_Over_LED_Mode == 5:
                            aryLED_Brightness_Chip_1_TMP[i] = 100; #Full power   
                            
                        #print("aryLED_Brightness_Chip_1_TMP[",i,"] = [",aryLED_Brightness_Chip_1_TMP[i],"]")
                        #print("aryLED_Brightness_Chip_1[",i,"] = [",aryLED_Brightness_Chip_1[i],"]")
                        ##print("====>aryLED_State[aryLED_To_LED1642_Output_Chip1[",i,"]]=[",aryLED_State[aryLED_To_LED1642_Output_Chip1[i]],"] aryLED_To_LED1642_Output_Chip1[i]=",aryLED_To_LED1642_Output_Chip1[i])

                    else: # OFF
                        aryLED_Brightness_Chip_1_TMP[i] = 0; #1=debug, should be 0
                        
                    #LED1642_Chip_2
                    if aryLED_State[aryLED_To_LED1642_Output_Chip2[i]] == 1:# ON
                        if iPixel_Over_LED_Mode == 1: #0=Off : 1=Under_Pixel_Only_Full_Power : 2=Under_Px_Only_QACalibrated_Pwr : 3=Under_Px_Pnly_Equalized_Pwr : 4=Adjacent_Pix_Also_QA_Cal_Pwr
                            aryLED_Brightness_Chip_2_TMP[i] = 100;
                        elif iPixel_Over_LED_Mode == 2:
                            aryLED_Brightness_Chip_2_TMP[i] = aryLED_Brightness_Chip_2[i]
                        elif iPixel_Over_LED_Mode == 3:
                            #Under Pixel Only LEDs but auto equalize power in real time :: ToDo
                            aryLED_Brightness_Chip_2_TMP[i] = aryLED_Brightness_Chip_2[i] # TEMP Solution
                        elif iPixel_Over_LED_Mode == 4:
                            aryLED_Brightness_Chip_2_TMP[i] = aryLED_Brightness_Chip_2[i]
                            #Enable Adjacent LEDs @ Equalized PWR using Adjacent LED List. i.e. LED 11 has 10,12 + 3,4,5 + 17,18,19 as adjacent, some have less. i.e. LED 1 only has 2,9,8 adjacent
                            #Done when building aryLED_To_LED1642_Output_Chip1
                        elif iPixel_Over_LED_Mode == 5:
                            aryLED_Brightness_Chip_2_TMP[i] = 100; #Full power
                        
                        #print("aryLED_Brightness_Chip_2_TMP[",i,"] = [",aryLED_Brightness_Chip_2_TMP[i],"]")
                        #print("aryLED_Brightness_Chip_2[",i,"] = [",aryLED_Brightness_Chip_2[i],"]")
                        ##print("====>aryLED_State[aryLED_To_LED1642_Output_Chip2[",i,"]]=[",aryLED_State[aryLED_To_LED1642_Output_Chip2[i]],"] aryLED_To_LED1642_Output_Chip2[i]=",aryLED_To_LED1642_Output_Chip2[i])

                    else: # OFF
                        aryLED_Brightness_Chip_2_TMP[i] = 0; #2=debug, should be 0
                        
                    #print("aryLED_State[aryLED_To_LED1642_Output_Chip1[",i,"]]=[",aryLED_State[aryLED_To_LED1642_Output_Chip1[i]],"] aryLED_To_LED1642_Output_Chip1[i]=",aryLED_To_LED1642_Output_Chip1[i])
                    #print("aryLED_State[aryLED_To_LED1642_Output_Chip2[",i,"]]=[",aryLED_State[aryLED_To_LED1642_Output_Chip2[i]],"] aryLED_To_LED1642_Output_Chip2[i]=",aryLED_To_LED1642_Output_Chip2[i])
                        
                #print("END :: aryLED_Brightness_Chip_1:",aryLED_Brightness_Chip_1)
                #print("END :: aryLED_Brightness_Chip_2:",aryLED_Brightness_Chip_2)   
                #Turn OFF white LEDs
                aryLED_Brightness_Chip_2_TMP[15] = 0   
                aryLED_Brightness_Chip_1_TMP[15] = 0     
                
                self.SPI_LED1642_Set_Brightness_PWM(101,aryLED_Brightness_Chip_1_TMP,aryLED_Brightness_Chip_2_TMP)
                        
    def changeLayer(self,iLayerNumberCurrent):
        "Change the Image on the Layer"
        start_time = time.time()
        if bUse_Display_NTSC:
            self.changeLayer_NTSC(iLayerNumberCurrent);
            
        if bUse_Display_LCD:
            self.changeLayer_LCD(iLayerNumberCurrent); #cPM.cPM
        
        finish_time = time.time()
        print("changeLayer: IMG Load Time = %.3f" % (finish_time - start_time))
        
    def drawGraticule(self):
        "Draws a grid for alignment and test"
        # the grid should be evenly spaced on X and Y to determine of there is distortion on X-Y
        borderColor = (255, 255, 255)
        lineColor = (64, 64, 64)
        subDividerColor = (128, 128, 128)
        # Draw a rectangle with a 4px boarder
        pygame.draw.rect(self.screen, borderColor, (10,10,848-10,470), 4)#(10,10,630,470), 4)
        # Horizontal lines (40 pixels apart)
        for i in range(0, 12):
            y = 10+(i*40)
            pygame.draw.line(self.screen, lineColor, (10, y), (848-10, y))
        # Vertical lines (50 pixels apart)
        for i in range(0, 12):
            x = 10+(i*40*1.7647) #1.7647 is to account for 480x272 ratio
            pygame.draw.line(self.screen, lineColor, (x, 10), (x, 848-10))
        # Vertical sub-divisions (8 pixels apart)
        #for i in range(1, 40):
        #    y = 30+i*8
        #    pygame.draw.line(self.screen, subDividerColor, (258, y), (262, y))
        # Horizontal sub-divisions (10 pixels apart)
        #for i in range(1, 50):
        #    x = 10+i*10
        #    pygame.draw.line(self.screen, subDividerColor, (x, 188), (x, 192))
 
    def test(self):
        "Test method to make sure the display is configured correctly"
        adcColor = (255, 255, 0)  # Yellow
        self.drawGraticule()
        # Render the Adafruit logo at 10,360
        ###logo = pygame.image.load('Direct_Resin_Lithography_848x480.png').convert()
        logo = pygame.image.load('RPi_Contrast_848x480.jpg').convert()
        #orig TRC self.screen.blit(logo, (10, 335))
        #self.screen.blit(logo, ((848-480)/2,(480-272)/2))
        #self.screen.blit(logo, ((848)/2,(480)/2))
        self.screen.blit(logo, (0,0))
        # Get a font and use it render some text on a Surface.
        print ('IP-address: '+self.get_ipaddress())
        #strIpAddress = self.get_ipaddress()
        #strIpAddress = "IP Address Here";
        font = pygame.font.Font(None, 32)
        #Rennder in 255,255,255   # White text
        #text_surface = font.render('pyScope (%s)' % "0.1",True, (255, 255, 255))
        text_surface = font.render('%s' %self.get_ipaddress(),True, (255, 255, 255))
        # Blit the text at 10, 0
        self.screen.blit(text_surface, (20, 490-30)) 
        # Render some text with a background color # Black text with yellow BG
        text_surface = font.render('Channel 0',True, (0, 0, 0), (255, 255, 0)) 
        # Blit the text
        #self.screen.blit(text_surface, (120, 50))
        # Update the display
        pygame.display.update()
        # Random adc data
        yLast = 260
        #for x in range(10, 509):
        #    y = random.randrange(30, 350, 2) # Even number from 30 to 350
        #    pygame.draw.line(self.screen, adcColor, (x, yLast), (x+1, y))
        #    yLast = y
        #    pygame.display.update()
      
    
    def load_splash_screen(self):
        "Load the Splash / Landing Screen"
        global splash_screen_white_led_counter
        print("Load Splash Screen");
        self.lcd_clear() #cPM.cPM
        

        
        print("Setup LED1642 Brightness to defaults : from=>load_splash_screen")
        #You are about to show the user something on the LCD, so turn the UV power OFF, that will leave the White LEDs ON.
        


        #Set LCD Contrast from profile settings
        self.lcd_Tx_CMD("CT" + chr(iLCD_Contrast))
        
        
        strIPAddress = self.get_local_ip_address('10.0.1.1')
        strHostname = self.get_local_host_name()#cPM.cPM - 1/18/15
        strSSID = self.get_local_wlan_ssid()#cPM.cPM
        print("Raspberry Pi - Local IP Address:",strIPAddress, " Hostname:", strHostname, " SSID:", strSSID)
        
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
        self.lcd_Tx_CMD("TT" + strIPAddress + chr(0))#cPM.cPM
        self.lcd_Tx_CMD("TP" + chr(0) + chr(1))
        #strIP_Address = self.get_local_ip_address('10.0.1.1')

   
        #TTBB = Set text postiotn "TP" where BB are X and Y
        ##self.lcd_Tx_CMD("TP" + chr(0) + chr(2))#cPM.cPM
        ##self.lcd_Tx_CMD("TT" + "Printer Name:" + chr(0))#cPM.cPM
        ##self.lcd_Tx_CMD("TP" + chr(0) + chr(3))#cPM.cPM
        ##self.lcd_Tx_CMD("TT" + strHostname + chr(0))#cPM.cPM
        self.lcd_Tx_CMD("TTName:" + chr(0))
        self.lcd_Tx_CMD("TP" + chr(0) + chr(2))
        self.lcd_Tx_CMD("TT" + strHostname + chr(0))
        self.lcd_Tx_CMD("TP" + chr(0) + chr(3))
        #self.lcd_Tx_CMD("TP" + chr(0) + chr(4))#cPM.cPM
        self.lcd_Tx_CMD("TTSSID:" + chr(0))#cPM.cPM
        self.lcd_Tx_CMD("TP" + chr(0) + chr(4))

        self.lcd_Tx_CMD("TT" + strSSID + chr(0))
        #Run UV LEDs for 5 sec
        
        if splash_screen_white_led_counter == 0:
        	splash_screen_white_led_counter = 8 #2 sec decrements. i.e. 10 = 20sec
        	self.SPI_LED1642_Register_Configuration(fExposure_Power_mA_White_LED_Default);
        	self.SPI_LED1642_Set_Brightness_PWM(101,aryLED_Brightness_Chip_1_White_LEDs_Only,aryLED_Brightness_Chip_2_White_LEDs_Only)
        	self.controlLED_UV(UV_LED_ON);
        #self.SPI_LED1642_Set_Brightness_PWM(101,aryLED_Brightness_Chip_1,aryLED_Brightness_Chip_2);
        #time.sleep(10.555555555)
        #self.SPI_LED1642_Register_Configuration(fExposure_Power_mA_White_LED_Dimmed);
        #self.SPI_LED1642_Set_Brightness_PWM(101,aryLED_Brightness_Chip_1_White_LEDs_Only,aryLED_Brightness_Chip_2_White_LEDs_Only)
        #Turn off after X seconds from main loop, or at first button press
        #self.controlLED_UV(UV_LED_OFF);

    def stepperStep(self,iSteps,bDirection,fPulse_Width_Z):
        "Execute GPIOs to move Stepper Motors Z steps in a direction"
        iSteps = int(iSteps)
        global iGlobal_Z_Position_Current #0 = first layer Z 
        global iGlobal_Z_Layer_Micron_Thickness #100 / 75 / 50 micron
        global bPrinting_State_Printing 
        global bPrinting_State_Printing_Cancel 
        global bPrinting_State_Driving_Stepper
        
        global bStepper_Acceleration_Enabled
        global bStepper_Deceleration_Enabled
        global iGlobal_Z_Stepper_Acceleration_Percentage_Per_Step
        global iGlobal_Z_Stepper_Acceleration_Steps
        global fGlobal_Stepper_Max_Pulse_Delay
        global iGlobal_Currently_Stepping
        global bUse_Endstop
        global bBeep_After_Stepping
        global bStepper_Drive_ULN2003 
        
        iCntLED = 0;
        bLED_State = 0;

        fPulse_Width_Z_Adj_For_Acceleration = fPulse_Width_Z
        
        start_time_Stepper = time.time() 
        
        if iGlobal_Currently_Stepping == TRUE:
            print("!!!!Currently stepping, so HALT Movement!!!!!!");
            self.stepperEnable(FALSE);
            iGlobal_Currently_Stepping = FALSE;
            #time.sleep(0.1); #debounce ==> remed because it might have been casing a RACE condition, making it more likely to have two instances of stepperStep running at the same time
            return;
        
        #print("Entered StepperStepping : Start")
        iGlobal_Currently_Stepping = TRUE; 
        
        if bStepper_Acceleration_Enabled == 'true' or bStepper_Deceleration_Enabled == 'true':
            #Calculations that need to be completed only once for Acceleration/Deceleration
            #fAcceleration_Constant_Local = (fPulse_Width_Z * (100.0 / iGlobal_Z_Stepper_Acceleration_Percentage_Per_Step));
            #Initial-final / Steps
            fAcceleration_Constant_Local = (fGlobal_Stepper_Max_Pulse_Delay - fPulse_Width_Z) / (100.0 / iGlobal_Z_Stepper_Acceleration_Percentage_Per_Step);
            fAccelerated_Delay = fGlobal_Stepper_Max_Pulse_Delay;
            fPulse_Width_Z_Adj_For_Acceleration = fAccelerated_Delay;
            #print(">> accel >>>>>> fAcceleration_Constant_Local:",fAcceleration_Constant_Local);
        #Enable Stepper Driver  
        self.stepperEnable(TRUE);
        #Invert UP and Down
        bDirection_Local = bDirection
        #if bInvert_Stepper_Direction == TRUE:
        #    if bDirection == UP:
        #        bDirection_Local = DOWN
        #    else:
        #        bDirection_Local = UP
        #Set Direction
        if(bStepper_Drive_ULN2003 == False):
            GPIO.output(gpio_stepper_pin_direction, bDirection_Local);
        if bDirection_Local == UP:
            print("Steps:", iSteps, "Direction:UP", bDirection_Local, "fPulse_Width_Z:",fPulse_Width_Z,"PositionZ:",iGlobal_Z_Position_Current," Height:%.2f" %  ((iGlobal_Z_Position_Current / iSteps_Per_100_Microns) / 100.0));
        if bDirection_Local == DOWN:
            print("Steps:", iSteps, "Direction:DOWN", bDirection_Local, "fPulse_Width_Z:",fPulse_Width_Z,"PositionZ:",iGlobal_Z_Position_Current," Height:%.2f" %  ((iGlobal_Z_Position_Current / iSteps_Per_100_Microns) / 100.0));
        
        #Measure entire process time:
        start_time_EP = time.time()
        
        if(True): # || bStepper_Drive_ULN2003 == False
            for i in range(iSteps):
                #Check for endstop, if endstop then exit and alery user  
                if bDirection_Local == DOWN : # DOWN
                    if False and GPIO.input(gpio_stepper_pin_button_endstop) == 1 and bUse_Endstop == 'true':
                    #if bEndstop_On_Z_Actuated == TRUE:
                        print("you should never see this : disabled, handle this in buttonEventHandler_endstop_rising_or_falling");
                        print("!!!!!!!!!Endstop reached : Step Command Terminated on Step# ",i," at PositionZ:",iGlobal_Z_Position_Current," Height:%.2f" %  ((iGlobal_Z_Position_Current / iSteps_Per_100_Microns) / 100.0),"!!!!!!!!!!!!!!!!");
                        i = iSteps;
                        #Disable Stepper driver
                        self.stepperEnable(FALSE);
                        iGlobal_Currently_Stepping = FALSE;
                        self.led_button_A_green(LED_OFF);
                        self.led_button_B_blue(LED_OFF);
                        return;
                    iGlobal_Z_Position_Current = iGlobal_Z_Position_Current - 1; 
                else: #UP
                    iGlobal_Z_Position_Current = iGlobal_Z_Position_Current + 1;
                
                #Exit of anyone stops stepping
                if iGlobal_Currently_Stepping == FALSE: #should always be true here in the i stepper loop
                    print("%%%%%----Terminating Stepper Process midStep:",i," at PositionZ:",iGlobal_Z_Position_Current," Height:%.2f" %  ((iGlobal_Z_Position_Current / iSteps_Per_100_Microns) / 100.0),"----%%%%%%%%%%%");
                    i = iSteps;
                    #Disable Stepper driver
                    self.stepperEnable(FALSE);
                    #iGlobal_Currently_Stepping = FALSE;
                    self.led_button_A_green(LED_OFF);
                    self.led_button_B_blue(LED_OFF);
                    return;
                    
                #Make sure printing has not been canceled:
                if bPrinting_State_Driving_Stepper == 1 and (bPrinting_State_Printing_Cancel == 1 or bPrinting_State_Printing == 0): 
                    print("!!!===!!!Terminating Stepper Process in stepperStep at Step:",i,"!!!===!!!");
                    i = iSteps;
                    #Disable Stepper driver
                    self.stepperEnable(FALSE);
                    iGlobal_Currently_Stepping = FALSE;
                    bPrinting_State_Printing_Cancel = 0;
                    bPrinting_State_Printing = 0;
                    self.led_button_A_green(LED_OFF);
                    self.led_button_B_blue(LED_OFF);
                    return;
                
                if bStepper_Acceleration_Enabled == 'true' and fPulse_Width_Z_Adj_For_Acceleration > fPulse_Width_Z:
                    #!!!!!!Accelerate!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! http://www.ti.com/lit/an/slyt482/slyt482.pdf
                    fAccelerated_Delay = fAccelerated_Delay - fAcceleration_Constant_Local
                    fPulse_Width_Z_Adj_For_Acceleration = fAccelerated_Delay
                    #print(">:>:> accel>> step:",i," fAccelerated_Delay:",fAccelerated_Delay," fPulse_Width_Z_Adj_For_Acceleration:",fPulse_Width_Z_Adj_For_Acceleration)
                    if fPulse_Width_Z_Adj_For_Acceleration < fPulse_Width_Z:
                            fPulse_Width_Z_Adj_For_Acceleration = fPulse_Width_Z; #never let the accel or decel calc be less than the orig set delay
                            #print(">:>:>:>:> Acceleration Complete: Step:",i," fPulse_Width_Z_Adj_For_Acceleration=:",fPulse_Width_Z_Adj_For_Acceleration);
                
                if(bStepper_Drive_ULN2003 == False):
                    #====================================================================== STEPPING : DRV8834 =========================== Start
                    #A Low to High pulse transition advances the stepper by one step.
                    GPIO.output(gpio_stepper_pin_step, 1);
                    #self.led_red_B1(LED_OFF); #debug the pausing in stepper. Is it missed steps or CPU speep issues
                    #A4988 Driver needs a minum on_time of 1us : Datasheet:a4988_DMOS_microstepping_driver_with_translator
                    time.sleep(fPulse_Width_Z_Adj_For_Acceleration/2.0); #The /2.0 is because one pulse width is 2x states L then H
                    GPIO.output(gpio_stepper_pin_step, 0);
                    time.sleep(fPulse_Width_Z_Adj_For_Acceleration/2.0); 
                    #====================================================================== STEPPING  =========================== END
                else:
                    #====================================================================== STEPPING : ULN2003 =========================== Start
                    if bDirection == UP:
                        self.stepper_move_up_fullStep(1, fPulse_Width_Z_Adj_For_Acceleration)    
                        #self.stepper_move_up_fullStep(iSteps, fPulse_Width_Z_Adj_For_Acceleration/2.0)
                    else: #Down
                        self.stepper_move_down_fullStep(1, fPulse_Width_Z_Adj_For_Acceleration)
                        #self.stepper_move_down_fullStep(iSteps, fPulse_Width_Z_Adj_For_Acceleration/2.0)
                    #====================================================================== STEPPING  =========================== END
                iCntLED = iCntLED + 1
                if iCntLED > 25:
                    iCntLED = 0;
                    if bLED_State == 0:
                        bLED_State = 1;
                        if bDirection == DOWN:
                            self.led_button_A_green(LED_OFF);
                        else:
                            self.led_button_B_blue(LED_OFF);
                    else:
                        bLED_State = 0;
                        if bDirection == DOWN:
                            self.led_button_A_green(LED_ON);
                        else:
                            self.led_button_B_blue(LED_ON);
                                #
                    #Moved to stepper.Step :: stepperStep(self,iSteps,bDirection,fPulse_Width_Z):
                    #if GPIO.input(gpio_stepper_pin_button_down) == 1 : 
                        #Beep again to let them know its on AUTO
                    #    self.beep(1);
                    #    if iGlobal_Z_Position_Current > 0:  #was 0, but at boot it could be in a high state
                            #Go down to true ZERO
                            #self.stepperStep(iGlobal_Z_Position_Current,DOWN,fGlobal_Speed_Down_Fast); 
                    #        iSteps = iGlobal_Z_Position_Current
                    #        bDirection = DOWN
                    #        fPulse_Width_Z = fGlobal_Speed_Down_Fast
                    #        fPulse_Width_Z_Adj_For_Acceleration = fGlobal_Speed_Down_Fast
                    #    else:
                    #        #Go down X Steps
                            #self.stepperStep(iGlobal_Z_Manual_Button_Speed_Down_Fast,DOWN,fGlobal_Speed_Down_Fast); 
                    #        iSteps = iGlobal_Z_Manual_Button_Speed_Down_Fast
                    #        bDirection = DOWN
                    #        fPulse_Width_Z = fGlobal_Speed_Down_Fast
                    #        fPulse_Width_Z_Adj_For_Acceleration = fGlobal_Speed_Down_Fast
                    #    print("Button DOWN (HELD_DOWN) : ",iSteps," Delay:",fPulse_Width_Z)
                        
                #start_time = time.time()
                
                #elapsed_time = time.time() - start_time
                
        else: # ULN2003
            ######============================================= Start:  ULN2003 Darlington Driver  ==========================================
            print("You should never see this")
            ######============================================= End:  ULN2003 Darlington Driver  ==========================================
                
            
        #Stepping Finished
        if(bStepper_Drive_ULN2003 == False):
            GPIO.output(gpio_stepper_pin_step, 0);
        
        #print("stepperStep: fPulse_Width_Z_Adj_For_Acceleration=",fPulse_Width_Z_Adj_For_Acceleration);
        #print("stepperStep: fPulse_Width_Z_Adj_For_Acceleration=",fPulse_Width_Z_Adj_For_Acceleration);
        #If it was an auto step, then beep
        if iSteps == iGlobal_Z_Manual_Button_Speed_Up_Fast or iSteps == iGlobal_Z_Manual_Button_Speed_Up_Slow:
            self.beep(2);
        else:
            if(bBeep_After_Stepping == True):
                self.beep(1);
                bBeep_After_Stepping = False;
            
        #elapsed_time_EP = time.time() - start_time_EP
        #print("Measured Pulse Width Delay (last) |``|__|:",elapsed_time);
        #print("Total Step Time for ",iSteps, "is ", elapsed_time_EP, " :: Time/Step=", (elapsed_time_EP/iSteps)/2);
        #Disable Stepper driver
        self.stepperEnable(FALSE);
        iGlobal_Currently_Stepping = FALSE;
        if bDirection == DOWN:
            self.led_button_A_green(LED_OFF);
        else:
            self.led_button_B_blue(LED_OFF);
        elapsed_time_EP = time.time() - start_time_Stepper
        print("Stepper Driver : Elapsed Time: ",elapsed_time_EP);

    def stepperEnable(self, bEnabled): 
        global bStepper_Drive_ULN2003
        #"Enable and Disable Stepper Driver hardware aka 4988"
        if(bEnabled == 0):
            print("Turning OFF Stepper Driver");
            if(bStepper_Drive_ULN2003 == False):
                GPIO.output(gpio_stepper_pin_enable, 1);
            else: # ULN2003
                GPIO.output(gpio_stepper_pin_1, ULN2003_OFF)
                GPIO.output(gpio_stepper_pin_2, ULN2003_OFF)
                GPIO.output(gpio_stepper_pin_3, ULN2003_OFF)
                GPIO.output(gpio_stepper_pin_4, ULN2003_OFF)
            self.led_red_B1(LED_OFF);  
            #Turn off both UP and Down LEDs
            self.led_button_A_green(LED_OFF)
            self.led_button_B_blue(LED_OFF)
        
        if(bEnabled == 1):
            #print("Turning ON Stepper Driver");
            if(bStepper_Drive_ULN2003 == False):
                GPIO.output(gpio_stepper_pin_enable, 0);
            self.led_red_B1(LED_ON); 
            
    def stepper_move_down_fullStep(self, iSteps, fStep_Time):
        #GPIO.output(gpio_stepper_pin_1, ULN2003_OFF)
        #GPIO.output(gpio_stepper_pin_2, ULN2003_OFF)
        #GPIO.output(gpio_stepper_pin_3, ULN2003_OFF)
        #GPIO.output(gpio_stepper_pin_4, ULN2003_OFF)
        #fTime_Step_Delay_Local = fStep_Time * 2
        for i in range(iSteps):
            #print("u");
            GPIO.output(gpio_stepper_pin_3, ULN2003_OFF)
            GPIO.output(gpio_stepper_pin_1, ULN2003_ON)
            time.sleep(fStep_Time/2.0)
            GPIO.output(gpio_stepper_pin_2, ULN2003_OFF)
            GPIO.output(gpio_stepper_pin_4, ULN2003_ON)
            time.sleep(fStep_Time/2.0)
            GPIO.output(gpio_stepper_pin_1, ULN2003_OFF)
            GPIO.output(gpio_stepper_pin_3, ULN2003_ON)
            time.sleep(fStep_Time/2.0)
            GPIO.output(gpio_stepper_pin_4, ULN2003_OFF)
            GPIO.output(gpio_stepper_pin_2, ULN2003_ON)
            time.sleep(fStep_Time/2.0)
 
    def stepper_move_up_fullStep(self, iSteps, fStep_Time):
        #GPIO.output(gpio_stepper_pin_1, ULN2003_OFF)
        #GPIO.output(gpio_stepper_pin_2, ULN2003_OFF)
        #GPIO.output(gpio_stepper_pin_3, ULN2003_OFF)
        #GPIO.output(gpio_stepper_pin_4, ULN2003_OFF)
        #fTime_Step_Delay_Local = fStep_Time * 2
        for i in range(iSteps):
            #print("d");
            GPIO.output(gpio_stepper_pin_4, ULN2003_OFF)
            GPIO.output(gpio_stepper_pin_2, ULN2003_ON)
            time.sleep(fStep_Time/2.0)
            GPIO.output(gpio_stepper_pin_1, ULN2003_OFF)
            GPIO.output(gpio_stepper_pin_3, ULN2003_ON)
            time.sleep(fStep_Time/2.0)
            GPIO.output(gpio_stepper_pin_2, ULN2003_OFF)
            GPIO.output(gpio_stepper_pin_4, ULN2003_ON)
            time.sleep(fStep_Time/2.0)
            GPIO.output(gpio_stepper_pin_3, ULN2003_OFF)
            GPIO.output(gpio_stepper_pin_1, ULN2003_ON)
            time.sleep(fStep_Time/2.0)
            
    def stepper_move_up_halfStep(self, iSteps, fStep_Time):
        GPIO.output(gpio_stepper_pin_1, ULN2003_OFF)
        GPIO.output(gpio_stepper_pin_2, ULN2003_OFF)
        GPIO.output(gpio_stepper_pin_3, ULN2003_OFF)
        GPIO.output(gpio_stepper_pin_4, ULN2003_OFF)
        fTime_Step_Delay_Local = fStep_Time
        for i in range(iSteps):
            #print("u");
            GPIO.output(gpio_stepper_pin_1, ULN2003_OFF)
            time.sleep(fTime_Step_Delay_Local)
            GPIO.output(gpio_stepper_pin_3, ULN2003_ON)
            time.sleep(fTime_Step_Delay_Local)
            GPIO.output(gpio_stepper_pin_4, ULN2003_OFF)
            time.sleep(fTime_Step_Delay_Local)
            GPIO.output(gpio_stepper_pin_2, ULN2003_ON)
            time.sleep(fTime_Step_Delay_Local)
            GPIO.output(gpio_stepper_pin_3, ULN2003_OFF)
            time.sleep(fTime_Step_Delay_Local)
            GPIO.output(gpio_stepper_pin_1, ULN2003_ON)
            time.sleep(fTime_Step_Delay_Local)
            GPIO.output(gpio_stepper_pin_2, ULN2003_OFF)
            time.sleep(fTime_Step_Delay_Local)
            GPIO.output(gpio_stepper_pin_4, ULN2003_ON)
            time.sleep(fTime_Step_Delay_Local)
 
    def stepper_move_down_halfStep(self, iSteps, fStep_Time):
        GPIO.output(gpio_stepper_pin_1, ULN2003_OFF)
        GPIO.output(gpio_stepper_pin_2, ULN2003_OFF)
        GPIO.output(gpio_stepper_pin_3, ULN2003_OFF)
        GPIO.output(gpio_stepper_pin_4, ULN2003_OFF)
        fTime_Step_Delay_Local = fStep_Time
        for i in range(iSteps):
            #print("d");
            GPIO.output(gpio_stepper_pin_3, ULN2003_OFF)
            time.sleep(fTime_Step_Delay_Local)
            GPIO.output(gpio_stepper_pin_1, ULN2003_ON)
            time.sleep(fTime_Step_Delay_Local)
            GPIO.output(gpio_stepper_pin_4, ULN2003_OFF)
            time.sleep(fTime_Step_Delay_Local)
            GPIO.output(gpio_stepper_pin_2, ULN2003_ON)
            time.sleep(fTime_Step_Delay_Local)
            GPIO.output(gpio_stepper_pin_1, ULN2003_OFF)
            time.sleep(fTime_Step_Delay_Local)
            GPIO.output(gpio_stepper_pin_3, ULN2003_ON)
            time.sleep(fTime_Step_Delay_Local)
            GPIO.output(gpio_stepper_pin_2, ULN2003_OFF)
            time.sleep(fTime_Step_Delay_Local)
            GPIO.output(gpio_stepper_pin_4, ULN2003_ON)
            time.sleep(fTime_Step_Delay_Local)
            
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
        
    def status_blink(self, iBlink_Count):
        "status_blink : Blink to let user know something is happening : For GUI"
        strBlinkCount = str(iBlink_Count)
        thread = threading.Thread(target=self.status_blink_threaded, args=(strBlinkCount))
        e = threading.Event()
        thread.start()
                
    def status_blink_threaded(self, strBlinkCount):
        "status_blink_threaded : Blink to let user know something is happening : For GUI"
        #This is threded so the user does not have to wait for the blinking to finish  
        iBlink_Count = int(strBlinkCount) #2
        #print("blink");
        for i in range(iBlink_Count):
            self.led_green_B1(LED_ON);
            time.sleep(0.2);
            self.led_green_B1(LED_OFF);
            if iBlink_Count > 0:
                time.sleep(0.1);

        
    def status_messages_to_GUI(self, strMessage):
        "Send status messages to GUI"
        sys.stdout.flush() #Flush before and after so the ARY is base 0
        time.sleep(0.2) #Needed to keep messages fome concatinating
        print("Message_GUI:" + strMessage);
        sys.stdout.flush()
        time.sleep(0.2) #Needed to keep messages fome concatinating

    def status_messages_to_JSON(self, strMessageElement, strMessageValue):
        "Send status messages to JSON"
        sys.stdout.flush() #Flush before and after so the ARY is base 0
        time.sleep(0.2) #Needed to keep messages fome concatinating
        print("Message_JSON:" + strMessageElement + ":" + strMessageValue);
        sys.stdout.flush()
        time.sleep(0.2) #Needed to keep messages fome concatinating

    def update_meta_refresh_time(self, iSeconds):
        "Updates meta refresh time"
        sys.stdout.flush() #Flush before and after so the ARY is base 0
        time.sleep(0.2) #Needed to keep messages fome concatinating
        #print("Update_Meta_Refresh:" + str(iSeconds));
        print("Update_Meta_Refresh Debug")
        sys.stdout.flush()
        time.sleep(0.2) #Needed to keep messages fome concatinating
        
    def status_messages_to_GUI_Sm_2(self, strMessage):
        "Send status messages to GUI"
        sys.stdout.flush() #Flush before and after so the ARY is base 0
        time.sleep(0.2) #Needed to keep messages fome concatinating
        print("Message_GUI_Sm_2:" + strMessage);
        sys.stdout.flush()
        time.sleep(0.2) #Needed to keep messages fome concatinating

    def status_messages_to_GUI_Print_Percentage_Completed(self, strMessage):
        "Send status messages to GUI - Print Percentage Complete"
        sys.stdout.flush() #Flush before and after so the ARY is base 0
        #Dont use large delay here, will delay the print!!!! This function is inlined from the print manager
        time.sleep(0.05) #Needed to keep messages fome concatinating
        print("Message_GUI_Print_Percentage:" + strMessage);
        sys.stdout.flush()
        time.sleep(0.05) #Needed to keep messages fome concatinating
         
    def status_messages_to_GUI_3(self, strMessage):
        "Send status messages to GUI"
        sys.stdout.flush() #Flush before and after so the ARY is base 0
        #Dont use large delay here, will delay the print!!!! This function is inlined from the print manager
        time.sleep(0.05) #Needed to keep messages fome concatinating
        print("Message_GUI_3:" + strMessage);
        sys.stdout.flush()
        time.sleep(0.05) #Needed to keep messages fome concatinating
        
    def status_messages_State_Boot(self, strMessage):
        "Send status messages to GUI"
        sys.stdout.flush() #Flush before and after so the ARY is base 0
        time.sleep(0.6) #Needed to keep messages fome concatinating
        print("Message_State_Boot:" + strMessage); 
        sys.stdout.flush()
        time.sleep(0.6) #Needed to keep messages fome concatinating
        
    def status_messages_State_General(self, strMessage):  #"Printing" "Stopped", etc //  
        "Send status messages to GUI"
        sys.stdout.flush() #Flush before and after so the ARY is base 0
        time.sleep(0.4) #Needed to keep messages fome concatinating
        print("Message_State_General:" + strMessage);
        sys.stdout.flush()
        time.sleep(0.4) #Needed to keep messages fome concatinating
        
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
        
    def buttonEventHandler_down (self, iGPIO_PIN): # Dont move stepper until button is released. At button release determine if it was a short or long press.
        "DOWN button event"
        global State_stepperEnable_Last
        global start_time_Button_Down
        global bBeep_After_Stepping
        global bLong_Press_Down
        global iOne_Layer_Of_Steps
        self.led_button_A_green(LED_ON);
        bBeep_After_Stepping = True;
        
        #Determine if its a PRESS or RELEASE of button
        time.sleep(0.05) #debounce to let GPIO change? : TEST
        if GPIO.input(gpio_stepper_pin_button_down) == 1 :
            print ("handling DOWN button event : PRESSED")  
            self.beep(1);
            start_time_Button_Down = time.time() 
            #Check for UP and Down button simutanious pressing:
            #if GPIO.input(gpio_stepper_pin_button_up) == 1 :
                #Both buttons pressed, ignore DOWN
            #    print("Down and Up both pressed, ignoring Down")
            #    return;
            if bPrinting_State_Printing == 1:
                print("exiting Button UP Handler to stop print Job")
                self.fcnCancel_Print_Job();
                #EXIT
                return;
            #If currently stepping, stop:
            iGlobal_Currently_Stepping = False
            #If button is held down, continue to move Z
            time.sleep(0.5); # a debounce delay 
            if GPIO.input(gpio_stepper_pin_button_down) == 1 :
                #Beep again to let them know its on AUTO 
                #start_time_Button_Down = 999
                bLong_Press_Down = True
                self.beep(2);
                if iGlobal_Z_Position_Current > 0:  #was 0, but at boot it could be in a high state
                    #Go down to true ZERO
                    self.stepperStep(iGlobal_Z_Position_Current,DOWN,fGlobal_Speed_Down_Fast); 
                else:
                    #Go down X Steps
                    self.stepperStep(iGlobal_Z_Manual_Button_Speed_Down_Fast,DOWN,fGlobal_Speed_Down_Fast); 
            time.sleep(1.2); # a debounce delay
            if GPIO.input(gpio_stepper_pin_button_down) == 1 and GPIO.input(gpio_stepper_pin_button_up) == 1 :
                #Both buttons pressed - Process the UP event.
                print("buttonEventHandler_down : Down and Up both pressed, processing Down Both Button Event")
                print("==================================================ShutDown printer NOW=============================")
                self.beep(15);
                time.sleep(0.2);
                self.shutdown_rpi();
                time.sleep(0.1) #debounce
                return;

        else:
            elapsed_time_EP = time.time() - start_time_Button_Down
            self.led_button_A_green(LED_OFF);
            print ("handling DOWN button event : RELEASED : bLong_Press_Down=",bLong_Press_Down, " : Hold_Time=",elapsed_time_EP)
            if(bLong_Press_Down == True):
                bLong_Press_Down = False
                #start_time_Button_Down = 0
                print("Long Press : DOWN")
                #self.beep(1);

            else:
                print("Quick press : DOWN")
                #if bPrinting_State_Printing == 1:
                #    self.fcnCancel_Print_Job();
                #    return;#EXIT
                bStepperEnable_TMP = State_stepperEnable_Last; #Save stepper enable state
                self.stepperEnable(TRUE);
                self.stepperStep(iOne_Layer_Of_Steps,DOWN,fGlobal_Speed_Down_Slow); #(Steps,Direction)
        
        
    def buttonEventHandler_up (self, iGPIO_PIN): # Dont move stepper until button is released. At button release determine if it was a short or long press. >> UP
        "UP button event"
        global State_stepperEnable_Last
        global start_time_Button_Up
        global bBeep_After_Stepping
        global bLong_Press_Up
        global iOne_Layer_Of_Steps
        self.led_button_B_blue(LED_ON);
        bBeep_After_Stepping = True;

        #Determine if its a PRESS or RELEASE of button 
        time.sleep(0.05) #debounce to let GPIO change? : TEST
        if GPIO.input(gpio_stepper_pin_button_up) == 1 :
            print ("handling UP button event : PRESSED")  
            self.beep(1);
            start_time_Button_Up = time.time() 
            if bPrinting_State_Printing == 1: 
                print("exiting Button UP Handler to stop print Job")
                self.fcnCancel_Print_Job();
                #EXIT
                return;
            #If currently stepping, stop:
            iGlobal_Currently_Stepping = False
            #If button is held down, continue to move Z
            time.sleep(0.5); # a debounce delay 
            if GPIO.input(gpio_stepper_pin_button_up) == 1 :
                #Beep again to let them know its on AUTO 
                #start_time_Button_Up = 999
                bLong_Press_Up = True
                self.beep(2);
                self.stepperStep(iGlobal_Z_Manual_Button_Speed_Up_Fast,UP,fGlobal_Speed_Up_Fast); 

            time.sleep(1.5); # a debounce delay
            if GPIO.input(gpio_stepper_pin_button_down) == 1 and GPIO.input(gpio_stepper_pin_button_up) == 1 :
                #Both buttons pressed - Process the UP event.
                print("buttonEventHandler_up : Down and Up both pressed, processing Down Both Button Event")
                print("==================================================ShutDown printer NOW=============================")
                self.beep(15);
                time.sleep(0.2);
                self.shutdown_rpi();
                time.sleep(0.1) #debounce
                return;
            if GPIO.input(gpio_stepper_pin_button_print) == 1 and GPIO.input(gpio_stepper_pin_button_up) == 1 :
                #Both buttons pressed
                print("buttonEventHandler_up : Print and Up both pressed, processing Show Network Info On Nano LCD")
                #print("=============================================================================")
                start_time_Button_Print = 999 #to stop the printer from printing
                self.beep(3);
                time.sleep(0.2);
                self.beep(2);
                self.load_splash_screen();
                time.sleep(0.1) #debounce
                self.beep(1);
                return;
            
                    

        else:
            elapsed_time_EP = time.time() - start_time_Button_Up
            self.led_button_B_blue(LED_OFF);
            print ("handling UP button event : RELEASED : Hold_Time=",elapsed_time_EP)
            if(bLong_Press_Up == True):
                bLong_Press_Up = False
                #start_time_Button_Up = 0
                print("Long Press : UP")
                #self.beep(1);

            else:
                print("Quick Press : UP")
                #if bPrinting_State_Printing == 1:
                #    self.fcnCancel_Print_Job();
                #    return;#EXIT
                bStepperEnable_TMP = State_stepperEnable_Last; #Save stepper enable state
                self.stepperEnable(TRUE);
                self.stepperStep(iOne_Layer_Of_Steps,UP,fGlobal_Speed_Up_Slow); #(Steps,Direction)
        
    def fcnCancel_Print_Job(self):
        "Cancel Print Job"
        global bPrinting_State_Waiting_For_Platform_To_Reach_Bottom
        bPrinting_State_Waiting_For_Platform_To_Reach_Bottom = 0;
        print("---------------------------Already Printing - Cancel Print--------------------")
        self.status_messages_to_GUI("Printing Canceled")
        global bPrinting_State_Printing
        global bPrinting_State_Printing_Cancel 
        self.controlLED_UV(UV_LED_OFF);
        self.stepperEnable(FALSE);
        #self.moveZtoExtractPosition();
        bPrinting_State_Printing = 0;
        bPrinting_State_Printing_Cancel = 1;
        self.led_blue_B1(LED_OFF);# turn the green LED off
        self.status_messages_to_GUI("Stopped");
        
 
        
    def buttonEventHandler_print (self, iGPIO):
        "PRINT/Pause/Cancel button event"
        global strPrint_File_SVG
        print ("handling PRINT/Pause/Cancel button event : Printing file:[" + strPrint_File_SVG + "]")
        global bPrinting_State_Printing
        global bPrinting_State_Printing_Cancel     
        global bPrinting_State_Waiting_For_Platform_To_Reach_Bottom
        global bPrinting_Option_Direct_Print_With_Z_Homing
        global bUse_Endstop
        global start_time_Button_Print
        
        time.sleep(0.05) #debounce to let GPIO change? : TEST
        
        self.led_button_A_green(LED_OFF);
        self.led_button_B_blue(LED_OFF);
        
        #Determine if its a PRESS or RELEASE of button
        #time.sleep(0.05) #debounce to let GPIO change? : TEST
        
        #Determine if its a PRESS or RELEASE of button
        if GPIO.input(gpio_stepper_pin_button_print) == 1 :
            print ("handling Print button event : PRESSED")  
            self.beep(1);
            start_time_Button_Print = time.time() 
            time.sleep(5.0); # a debounce delay 
            if GPIO.input(gpio_stepper_pin_button_print) == 1 :
                #Beep again to let them know its on accepted the long delay  
                start_time_Button_Print = 999
                self.beep(4);
        else:
            #Button RELEASED
            print ("handling PRINT/Pause/Cancel button event ::  RELEASED")
            elapsed_time_EP = time.time() - start_time_Button_Up
            if(start_time_Button_Print == 999):
                start_time_Button_Print = 0
                print("Long Press : Print : maybe try WPS")
                self.beep(4);
                time.sleep(0.2);
                #self.shutdown_rpi();
                #Run WPS Pushbutton on strongest SSID signal that also supports WPS. Do this from wps.sh
                strScript_Full_Path = "/home/pi/ibox/wps.sh"
                try:
                    p = subprocess.Popen(strScript_Full_Path, stdout=subprocess.PIPE)
                except OSError:
                    print ("Could not run the script: " + strScript_Full_Path)
                    #exit(1) #Why exit???
                out, err = p.communicate()
                print("I assume the script ran as expected : wait 10 sec and update screen")
                for i in range(11):
                    for z in range(3):
                        time.sleep(0.2)
                        if z == 0:
                            self.led_red_B1(LED_ON);
                            self.led_green_B1(LED_OFF);
                            self.led_blue_B1(LED_OFF);
                        if z == 1:
                            self.led_red_B1(LED_OFF);
                            self.led_green_B1(LED_ON);
                            self.led_blue_B1(LED_OFF);
                        if z == 2:
                            self.led_red_B1(LED_OFF);
                            self.led_green_B1(LED_OFF);
                            self.led_blue_B1(LED_ON);
                    
                self.beep(3);
                self.load_splash_screen();
                

            else:
                print("Print: Quick Press : Print :: strPrint_File_SVG=" + strPrint_File_SVG)
                # Set last file as the one to print
                self.set_to_be_printed_file_names_and_paths( strPrint_File_SVG );
                #print ("handling PRINT/Pause/Cancel button event :: RELEASED :: strPrint_File_SVG=" + strPrint_File_SVG)
                self.print_command_manager(); #was strPrint_File_SVG)
    
    def shutdown_rpi(self):
        command = "/usr/bin/sudo /sbin/shutdown -h now"
        import subprocess
        process = subprocess.Popen(command.split(), stdout=subprocess.PIPE)
        output = process.communicate()[0]
        print(output)
    
    def restart_rpi(self):
        command = "/usr/bin/sudo /sbin/shutdown -r now"
        import subprocess
        process = subprocess.Popen(command.split(), stdout=subprocess.PIPE)
        output = process.communicate()[0]
        print(output)
    
    def count_files_in_directory(path,extension):  #***NOT USING
        "count files in directory"
        list_dir = []
        list_dir = os.listdir(path)
        count = 0
        for file in list_dir:
            if file.endswith(extension): # eg: '.txt'
                count += 1
        return count
  
    def print_command_manager (self): #aka print_manager or print manager
        "print_command_manager"
        global strPrint_File_SVG
        global bPrinting_State_Printing
        global bPrinting_State_Printing_Cancel     
        global bPrinting_State_Waiting_For_Platform_To_Reach_Bottom
        global bPrinting_Option_Direct_Print_With_Z_Homing
        global bUse_Endstop
        global iNumber_Of_Layers
        global strDashBeforeNumbers
        global iGlobal_Currently_Stepping
        
        print ("print_command_manager : Printing file:[" + strPrint_File_SVG + "] from Dir[" + strLayerImageDir + "]")
        bEndstop_On_Z_Actuated = FALSE #Reset Endstop Trigger
        #self.beep(1);
        
        #Step 1 : Verify files and directories exist : may as well count layers and verify that as well
        #strLayerImageDir = strDirToMake :: ## i.e. /home/pi/ibox/uploads/data/Bunny10 
        #strLayerImageName_Base = strPrint_File_SVG_noExt :: i.e. "Bunny10 
        if os.path.isdir(strLayerImageDir) == True:
            print("Dir exists: " + strLayerImageDir)
        else:
            print("Dir DOES NOT exist: " + strLayerImageDir + "....  EXITING")
            self.beep(3);
            return
        if strDashBeforeNumbers == "":
            strFileTmp = strLayerImageDir + "/" + strLayerImageName_Base + strDashBeforeNumbers + "0000.png"
        else:
            strFileTmp = strLayerImageDir + "/" + strLayerImageName_Base + strDashBeforeNumbers + "0.png"
        if os.path.exists(strFileTmp) == True:
            print("First File exists: " + strFileTmp)
        else:
            print("First File DOES NOT exist: " + strFileTmp + "....  EXITING")
            self.beep(3);
            return
        
        #Step2 Count files  
        #iFilesCounted = self.count_files_in_directory(strLayerImageDir,".png")
        list_dir = []
        list_dir = os.listdir(strLayerImageDir)
        count = 0
        for file in list_dir:
            if file.endswith(".png"): # eg: '.txt'
                count += 1
        iFilesCounted = count
        print("iFilesCounted=",iFilesCounted," : in dir:" + strLayerImageDir)
         
        #Step3 Make sure the first and last file exist, well we have checked the first file above, so just check the last
        #But you want to start printing asap, so either wait for all files to convert (blocking Thread), or not check if files and dir exists
        strPad = ""
        if(strDashBeforeNumbers == ""):
            strPad = "000"
            if iFilesCounted > 9:
                strPad = "00"
            if iFilesCounted > 99:
                strPad = "0"
            if iFilesCounted > 999:
                strPad = ""
         
        strFilesCounted = str(iFilesCounted-1) #-1 because its a base 0 counter 0=1 9=10
        strFileTmp_LastFile = strLayerImageDir + "/" + strLayerImageName_Base + strDashBeforeNumbers + strPad + strFilesCounted + ".png"
        
        if os.path.exists(strFileTmp_LastFile) == True:
            print("Last File exists: " + strFileTmp_LastFile)
        else:
            
            strDashBeforeNumbers = "";
            strPad = "000"
            if iFilesCounted > 9:
                strPad = "00"
            if iFilesCounted > 99:
                strPad = "0"
            if iFilesCounted > 999:
                strPad = ""
            strFileTmp_LastFile = strLayerImageDir + "/" + strLayerImageName_Base + strDashBeforeNumbers + strPad + strFilesCounted + ".png"
            print("Checking to see of the file format is FileName0001.xxx or FileName_1.xxx :: File=[" + strFileTmp_LastFile + "]")
            if os.path.exists(strFileTmp_LastFile) == True:
                strDashBeforeNumbers = "";
            else:
                strDashBeforeNumbers = "_";

            print("Last File DOES NOT exist: " + strFileTmp_LastFile + "....  EXITING")
            self.beep(3);
            #//Note but dont exit return
        
        iNumber_Of_Layers = iFilesCounted - 1 #base 0 (lastlayerprintissue)

        if bPrinting_State_Waiting_For_Platform_To_Reach_Bottom == 1:
            print("print was previously pressed, and Z is moving down. Cancel that movement.");
            #print was previously pressed, and Z is moving down. Cancel that movement
            bPrinting_State_Waiting_For_Platform_To_Reach_Bottom = 0;
            #Stop stepper by sending 1 step
            ##self.stepperStep(1,DOWN,fGlobal_Speed_Down_Fast); 
            #Stop by changing iGlobal_Currently_Stepping to False
            iGlobal_Currently_Stepping = False
            #exit
            return;
         
        #Print All Layers : 
        if bPrinting_State_Printing == 1:
            self.fcnCancel_Print_Job();
            #EXIT
            return;
        elif bPrinting_State_Printing == 0:
            bPrinting_State_Printing_Cancel = 0;
            self.led_blue_B1(LED_ON);
            #Done in print_all_layers() :: bPrinting_State_Printing = 1;
            print("print_command_manager :: bPrinting_Option_Direct_Print_With_Z_Homing=",bPrinting_Option_Direct_Print_With_Z_Homing)
            if (bPrinting_Option_Direct_Print_With_Z_Homing == 'false' or bPrinting_Option_Direct_Print_With_Z_Homing == False):
                print("Just start printing, no need to Zero first")
                self.print_all_layers(); #++++++===============> PRINT 
            else:
                print("Zero first, then print")
                #Only move build plate down if it is not already on the limit switch
                if GPIO.input(gpio_stepper_pin_button_endstop) == 0:
                    self.moveZtoPrintPosition_ThenStartPrint(); 
                else:
                    self.print_all_layers(); #++++++===============> PRINT     
            
    def buttonEventHandler_endstop_rising_or_falling (self, iGPIO_PIN):
        global bUse_Endstop
        global bEndstop_On_Z_Actuated
        global bPrinting_State_Waiting_For_Platform_To_Reach_Bottom
        global iGlobal_Currently_Stepping
        global iOne_Layer_Of_Steps
        "UP button ENDSTOP : EVENT"
        self.led_button_A_green(LED_OFF);
        self.led_button_B_blue(LED_OFF);
        
        if GPIO.input(gpio_stepper_pin_button_endstop) == 1: 
            
            print (">>   handling ENDSTOP button event >> RISING > bUse_Endstop=",bUse_Endstop)
            if bPrinting_State_Waiting_For_Platform_To_Reach_Bottom == 1:
                self.beep(1);
                print(">>>>> Endstop on Print Setup : Platform moving to VAT");
                #print button was pressed, platform was sent from Z to Z=Prnt_Level. 
                bPrinting_State_Waiting_For_Platform_To_Reach_Bottom = 0;
                #Stop by changing iGlobal_Currently_Stepping to False
                iGlobal_Currently_Stepping = False
                time.sleep(0.2);
                #Move Stepper down 300 microns, yes it will be Plate on VAT, but thats fine
                self.stepperStep(iSteps_Per_100_Microns*3,DOWN,fGlobal_Speed_Up_Slow); #(Steps,Direction)

                #Lift Build Plate one layer.
                #iOne_Layer_Of_Steps = (iGlobal_Z_Layer_Thickness * iSteps_Per_100_Microns) / 100;
                self.stepperStep(iOne_Layer_Of_Steps,UP,fGlobal_Speed_Up_Slow); #(Steps,Direction)
                
                self.print_all_layers();
            elif bPrinting_State_Printing == 1:
                print (">>>>   IGNORE ENDSTOP WHILST PRINTING")
            elif bUse_Endstop == 'true':
                print (">>>>   USE ENDSTOP")
                self.beep(2);
                bEndstop_On_Z_Actuated = TRUE
                self.led_button_C_red(LED_ON)
                #Stop by changing iGlobal_Currently_Stepping to False
                iGlobal_Currently_Stepping = False
                #Motor platform back up One Layer -> so the Endstop button does not flutter, or you could go down one more layer. hmmm ?
                #self.stepperStep(iSteps_Per_100_Microns,UP,fGlobal_Speed_Up_Slow); #(Steps,Direction)
                #you can fire the print from here or from the post stepperStep return in 
 
        else:
            print (">>>     ENDSTOP button event :  ------ falling /////// ")
            bEndstop_On_Z_Actuated = FALSE
            self.led_button_C_red(LED_OFF)

        
        
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
        
    def moveZtoExtractPosition(self):
        "Move Z to Extract Position - The goal is to clear the VAT. So like 15-30mm - Units in millimeters"
        print("Move Z to Extract Position");
        self.status_messages_to_GUI_3("Moving Platofrm to Extract Position");
        #iTicks = (iGlobal_Z_Height_Retract*iSteps_Per_100_Microns)/100.0  #Convert steps to Microns
        iTicks = (iGlobal_Z_Height_Retract*(iSteps_Per_100_Microns*10))  #Convert steps to MilliMeters [ 3/14/2015 TRC ]
        self.stepperStep(iTicks,UP,fGlobal_Speed_Up_Fast);

        

    def moveZtoPrintPosition_ThenStartPrint(self):
        global bPrinting_State_Waiting_For_Platform_To_Reach_Bottom
        "Move Z to Print Position - As low as it will go, endstop should terminate this movement : Then Start Print"
        #print("Move Z to Print Position : Then Start Print"); 
        print("-------->>>>> Prepare to Print: Move Print_Platofrm to Print Position... --------->>>>")
        #Send message To HID via Node.js
        self.status_messages_to_GUI_3("Moving Print Platofrm to Print Position");

        #Send platform DOWN
        bPrinting_State_Waiting_For_Platform_To_Reach_Bottom = 1;
        #If the Build plate has been "calibrated" so we know where Layer 1 should be then move there. [This is set at First Print on every reboot]
        #If we dont know where the delta distance between the Build plate and VAT then move down iGlobal_Z_Height_Position_For_Print microns
        if iGlobal_Z_Position_Current != 0:
            iUse_This_Height_In_Steps = iGlobal_Z_Position_Current
        else:
            iUse_This_Height_In_Steps = (iGlobal_Z_Height_Position_For_Print*(iSteps_Per_100_Microns*10)) #Units Mimmimeters

        self.stepperStep(iUse_This_Height_In_Steps,DOWN,fGlobal_Speed_Down_Fast);
        print("--- moving complete : moveZtoPrintPosition_ThenStartPrint : exiting ---")
        #Start print now... or from Endstop routine
        if bUse_Endstop == 'true':
            print("waiting for carrage to hit endstop to initiate PrintManager")
        else:
            print("We moved down, now print")
            self.print_all_layers(); #++++++===============> PRINT 
        

        
     
    def print_all_layers(self):
        "Print all layers"
        
        #Load vars as Global 
        global bPrinting_Pause
        global iGlobal_Z_Position_Peel
        global iGlobal_Z_Layer_Thickness
        global iOne_Layer_Of_Steps
        #global fGlobal_Speed_Peel
        #global fGlobal_Speed_Down
        #global fGlobal_Speed_Up
        global iGlobal_Z_Height_Retract
        global iGlobal_Z_Height_Position_For_Print
        global iNumber_Of_Layers
        global iGlobal_Z_Position_Current
        global iExposure_Time_First_Layer
        global iExposure_Time
        
        global bPrinting_State_Printing
        global bPrinting_State_Printing_Cancel
        global bPrinting_State_Driving_Stepper 
        global bPrinting_State_Waiting_For_Platform_To_Reach_Bottom
        global splash_screen_white_led_counter

        global iPrint_Counter
        global iPrint_Time
        global iPrint_UV_Time
        global iLoad_Counter_Python

        splash_screen_white_led_counter = 0; #Stop white LED countdown till off.

        #//  3/16/2015
        bPrinting_State_Waiting_For_Platform_To_Reach_Bottom = 0;

        #self.status_messages_to_GUI("Printing Initiated")    #writing crap tio screen 
        #Reset Vars  
        bPrinting_Pause = 0
        elapsed_time_total = 0
        
        #Debug Vars###################################
        iExposure_Time_Max = 10.0
        ##############################################
        iExposure_Time_Current = iExposure_Time_Max; #Debug var to test UV Resin at varios cure times.
        iExposure_Reduced_After_This_Count = 10
        iExposure_Reduced_After_This_Count_Current = 0
        
        #DEBUG, will be automatic based on how many filesare in the dir, or on a config/gcode type file
        #Set Globally iNumber_Of_Layers = 150 #was 96; #i.e. 100 layers = 0-95
        
        #Please stop Print function RACEs, and save the kids!
        if bPrinting_State_Printing == 1:
            print("Print RACE : Ending that sh$t")
            bPrinting_State_Printing_Cancel = 1;
            return;
        
        print("Setup LED1642 Brightness and Power (mA) to defaults")
        self.SPI_LED1642_Set_Brightness_PWM(101,aryLED_Brightness_Chip_1,aryLED_Brightness_Chip_2);
        self.SPI_LED1642_Register_Configuration(fExposure_Power_mA); 
        
        print(" ----------->>>>>>> Start Printing ---------------->>>>>>>>>");
        bPrinting_State_Printing = 1;
        #DEBUG -> Test result == FAST!
        #self.stepperStep(111,DOWN,fGlobal_Speed_Down);
        
        iGlobal_Z_Position_Current = 0 #0 = first layer Z and the lowest Z
        
        #Local Vars
        iTicks_Up = 0;
        iTicks_Down = 0;
        
        #Make sure UV LED is OFF
        self.controlLED_UV(UV_LED_OFF);
        
        #Lower Z from the Z_Position_Extract position to the Z_Position_Peel
        #Enable Stepper 4988 Driver
        #self.stepperEnable(TRUE); ##Now done in function stepperStep
        
        print("Loading First Layer : START");
        #For the first image, load it, then wait. Wont really affect print time
        bUse_Sample_Static_Image = FALSE;
        if bUse_Sample_Static_Image == FALSE:
            self.changeLayer(0); #cPM.cPM
            
        #Wait for Layer 0 to load:
        time.sleep(1);
        print("Loading First Layer : END");
        
        iEstimated_Print_Time_Layer = int(iExposure_Time + ((fGlobal_Speed_Peel * (((iGlobal_Z_Height_Peel_Stage_1 + iGlobal_Z_Height_Peel_Stage_2))*(iSteps_Per_100_Microns/100.0)) * 4 ) + 0.7))
        self.update_meta_refresh_time(iEstimated_Print_Time_Layer);
        iEstimated_Print_Time_UV = ((iNumber_Of_Layers+1) * iExposure_Time)/60.0; #lastlayerprintissue
        iEstimated_Print_Time_Stepper = (((fGlobal_Speed_Peel * (((iGlobal_Z_Height_Peel_Stage_1 + iGlobal_Z_Height_Peel_Stage_2))*(iSteps_Per_100_Microns/100.0)) * 4 ) + 0.7)*(iNumber_Of_Layers+1)/60.0);#0.7 is image load time : 4x because pause between GPIO On/OFF (2) + Up and Down (2)
        iEstimated_Print_Time_Total = iEstimated_Print_Time_UV + iEstimated_Print_Time_Stepper
        print("                >>>> Estimated Print Time : %.2f" % iEstimated_Print_Time_Total, " min : UV_Time: %.2f <<<<" % iEstimated_Print_Time_UV, " min : Stepper_Time: %.2f <<<<" % iEstimated_Print_Time_Stepper," min :: Est_Build_Height:%.2f" % (((iNumber_Of_Layers+1) * iGlobal_Z_Layer_Thickness) / 1000.0));
        
        start_time = time.time()
        
        #Debug (up then down)
        bDirection_Last = 0;

        for i in range(iNumber_Of_Layers+1): #To Number Of Layers # lastlayerprintissue
        #i = 0
        #while i < iNumber_Of_Layers:
            if bPrinting_State_Printing_Cancel == 1 or bPrinting_State_Printing == 0:
                print("...Canceling Current Print Job at Layer:",i);
                i = iNumber_Of_Layers;
                #do this upon restart of printing : bPrinting_State_Printing_Cancel = 0;
                bPrinting_State_Printing = 0;
                bPrinting_State_Printing_Cancel = 0;
                self.status_messages_to_GUI("Stopped");
                return;
                
            #print(">Layer:",i," out of ",iNumber_Of_Layers);
            #sys.stdout.flush() 
            self.status_messages_to_GUI_3("Layer " + str(i) + " out of " + str(iNumber_Of_Layers))
            start_time_layer = time.time()
            #Check for Pause Printing
            if bPrinting_Pause == 1:
                print("Pausing Print Job");
                while bPrinting_Pause:
                    time.sleep(1);
                    

            
            iExposure_Time_Local = iExposure_Time;
            
            #######################################
            #Debug to test UV Resin cure rate. Start long and get shorter stopping at iExposure_Time
            bDebug_Test_Resin = 0;
            iExposure_Time_Decrement = 0.5;
            if i > intNumber_Of_Base_Layers: #was 3 : only decrement during non-peel layers
                if bDebug_Test_Resin == 1:
                    iExposure_Time_Local = iExposure_Time_Current;
                    if iExposure_Time_Local <= iExposure_Time:
                        iExposure_Time_Local = iExposure_Time; #Dont go below the orig exposure time
                    iExposure_Reduced_After_This_Count_Current = iExposure_Reduced_After_This_Count_Current + 1;
                    if iExposure_Reduced_After_This_Count_Current >=iExposure_Reduced_After_This_Count:
                        iExposure_Reduced_After_This_Count_Current = 0;
                        iExposure_Time_Current = iExposure_Time_Current - iExposure_Time_Decrement; 
                
                
            
            #Lower Z from Z_Position_Peel to Z_Position_Expose
            if i > 0: #Only move from PEEL on > first Exposure
                #Move Z from PEEL to EXPOSE
                bPrinting_State_Driving_Stepper = 1;
                iTicks_Down = ((iGlobal_Z_Height_Peel_Stage_1 + iGlobal_Z_Height_Peel_Stage_2) - iGlobal_Z_Layer_Thickness);
                iTicks_Down = (iTicks_Down*iSteps_Per_100_Microns)/100.0  #Convert to Microns to steps
                #print("<>move_to_epose_z")
                self.stepperStep(iTicks_Down,DOWN,fGlobal_Speed_Down_Print);
                bPrinting_State_Driving_Stepper = 0;
            
            if i <= intNumber_Of_Base_Layers: #was 4
                #First N Layers that neex extra UV to "stick"
                iExposure_Time_Local = iExposure_Time_First_Layer;
            
            #Load Exposure Image for current Layer
            #Takes too long, need to load it earlier: self.changeLayer_NTSC(i);
            
            #Enable UV LED
            if bPrinting_State_Printing_Cancel == 0 and bPrinting_State_Printing == 1:
                self.controlLED_UV(UV_LED_ON);
            
            #Sleep while Exposing UV
            time.sleep(iExposure_Time_Local);
            
            #Disable UV LED
            self.controlLED_UV(UV_LED_OFF);
            
            print(">:<Exposure iExposure_Time_Local: %.2f >:<" % iExposure_Time_Local);
            
            #Load NEXT Layer Image, if there is a next Layer
            
            if i<iNumber_Of_Layers-1: # added -1 on 3/26/15 because of lastlayerprintissue issue.
                if bUse_Sample_Static_Image == 0:
                    self.changeLayer(i+1); #cPM.cPM
            
            #Peel Z : Stage 1
            bPrinting_State_Driving_Stepper = 1;
            iTicks_Up = (iGlobal_Z_Height_Peel_Stage_1*iSteps_Per_100_Microns)/100; 
            #print("<>peelz_1") 
            self.stepperStep(iTicks_Up,UP,fGlobal_Speed_Up_Print);
            
            #Peel Z : Stage 2 ::==> #Only use two stages if stage 2 has > 1 steps (ticks). Why 1 and not 0, in case it is used somewhere else and might cause a div/0 err
            if(iGlobal_Z_Height_Peel_Stage_2 > 1):
                iTicks_Up = (iGlobal_Z_Height_Peel_Stage_2 * iSteps_Per_100_Microns)/100;
                #print("<>peelz_2")
                self.stepperStep(iTicks_Up,UP,fGlobal_Speed_Peel);
                
            bPrinting_State_Driving_Stepper = 0;
            #DEBUG
            #time.sleep(5);
            
            elapsed_time = time.time() - start_time_layer;
            elapsed_time_total = (elapsed_time_total + elapsed_time);
            elapsed_time_minutes = elapsed_time_total/60.0;
            timeETA = ((iNumber_Of_Layers - i) * elapsed_time) / 60.0
            print("== Layer Time : %.2f" % elapsed_time," : Elapsed: %.2f" % elapsed_time_minutes, " : ETA: %.2f" % timeETA, "min ==" );
            strI = str(i+1) #base 0, so 0 is layer 1
            self.status_messages_to_GUI("Printing Layer " + strI)
            #strMsg = str("%.2f" % timeETA)
            #strMsg.join(strMsg,"min")
            self.status_messages_to_GUI_Sm_2(str(int(timeETA)) + " min")
            #Let other events happen
            #time.sleep(0.05);
            #Pass Print Percentage Complete to Node.js
            iPCurent_Layer = i;
            iPercent_Complete = int((iPCurent_Layer / iNumber_Of_Layers) * 100)
            if iPercent_Complete > 100:
                iPercent_Complete = 100;
            if iPCurent_Layer >= iNumber_Of_Layers - 1:
                iPercent_Complete = 100;
            self.status_messages_to_GUI_Print_Percentage_Completed(str(iPercent_Complete))
            #i = i + 1; #for while loop test, instead of FOR :: DEBUG TEST
            
            
        #Print Finished
        self.led_blue_B1(LED_ON); #Idle

        print("------------Print Finished------------")

        #Note the current height
        iGlobal_Z_Height_Last_Build_Height = iGlobal_Z_Position_Current;
        
        elapsed_time = time.time() - start_time;
        #iLayerTime = time.time() - iTime_Last;

        print("====== Total Print Time : %.2f" % elapsed_time," ========");
        time.sleep(0.2) 
        self.status_messages_to_GUI("Printing Complete")
        self.status_messages_to_GUI_Sm_2(str(int(elapsed_time/60.0)) + " min") #Send print time instead of "---"

        self.status_messages_to_GUI_3("Total Print Time " + str(int(elapsed_time/60)) + " minutes")

        #print("Save JSON via Node.js : START pre")
        #Alert user that printing is finished
        
        
        #Update Metrics
        iPrint_Counter = int(iPrint_Counter) + 1;
        #print("Save JSON via Node.js : START 1")
        iPrint_Time = int(iPrint_Time) + int(elapsed_time);
        #print("Save JSON via Node.js : START 2")
        iPrint_UV_Time = int(iPrint_UV_Time) + (int(iExposure_Time_Local) * i); #Use i because iNumber_Of_Layers is not accurate if one cancels print job
        #print("Save JSON via Node.js : START 3")
        #print("Save JSON via Node.js : START")
        #self.status_messages_to_JSON('Print_Counter','2');
        #Send to Node.jsusing self.status_messages_to_JSON(JSON_Name,JSON_Value)
        self.status_messages_to_JSON('Print_Counter',str(int(iPrint_Counter)));
        #time.sleep(0.1); #Delay because the Node.js function needs time to write the file
        self.status_messages_to_JSON('Print_Time',str(int(iPrint_Time)));
        #time.sleep(0.1); #Delay because the Node.js function needs time to write the file
        self.status_messages_to_JSON('Print_UV_Time',str(int(iPrint_UV_Time)));
        #time.sleep(0.1); #Delay because the Node.js function needs time to write the file
        self.status_messages_to_JSON('Load_Counter_Python',str(int(iLoad_Counter_Python)));
        #time.sleep(0.1); #Delay because the Node.js function needs time to write the file
        #print("Save JSON via Node.js : END")

        

        #Disable Stepper 4988 Driver
        self.stepperEnable(FALSE); #Just in case even tough ##Now done in function stepperStep
        
        #Finished: Load Splash Screen after UV light is OFF
        
        #Turn UV OFF - should already be off, this is a double check.
        #Make sure UV LED is OFF
        self.controlLED_UV(UV_LED_OFF);
        
        bPrinting_State_Printing = 0;
        

        
        #DEBUG -> Test result == fast as well
        #self.stepperStep(111,DOWN,fGlobal_Speed_Down);
        
        #Load Splash Screen
        #if bVideo_Output_NTSC:
        #    self.load_splash_screen();
        self.beep(4);    
        #Move Z to Extract Position ==> Last because stepping is Thread BLOCKING
        self.moveZtoExtractPosition();
        

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
        
    #@staticmethod
    def bytes_from_file(self,filename):
        "Load bytes from image file on drive : Use data via:: for b in bytes_from_file('filename'): crlf do_stuff_with(b)"
        with open(filename, "rb") as bitmap_file:
            while True:
                byte = bitmap_file.read(1)
                if not byte:
                    break
                yield(ord(byte))

    
    
    def bit_reverse(self,value, width=8):
        "Bit Reverse function for LCD output : i.e. 1 0 0 0 becomes 0 0 0 1"
        result = 0
        for _ in range(width):
            result = (result << 1) | (value & 1)
            value >>= 1
        return result
        
    def bit_invert(self,value, width=8):
        "Bit Invert function for LCD output : i.e. 1 1 0 0 becomes 0 0 1 1"
        result = 0
        result = ~np.uint8(value);
        return result
    
    
    #BITREVERSE = map(bit_reverse, range(256))
    
    #@staticmethod
    def load_bitmap_directly_to_LCD(self,filename, reverse=False): #### 4 ####
        "Load image file directly into LCD"
        # http://www.raspberrypi.org/forums/viewtopic.php?p=261343
        mask = 0xff if reverse else 0x00
        #self.gotoxy(0, 0)
        with open(filename, 'rb') as bitmap_file:
            for x in range(8): #was 6, i.e. 48/8 = 6, so for 64, it should be 64/8=8
              for y in range(128): #was 84. Nokia display is 84x48 pixels
                bitmap_file.seek(0x3e + y * 8 + x)
                self.lcd_Tx_Byte(ord(bitmap_file.read(1)) ^ mask)#cPM.cPM
                if x>2:
                    print(x," : ", y, " : ",bitmap_file.read(1))
                #cPM.lcd_Tx_Byte(map(cPM.bit_reverse, range(256))[ord(bitmap_file.read(1))] ^ mask)
                #self.lcd_data(BITREVERSE[ord(bitmap_file.read(1))] ^ mask)
   
    def digole_drawBitmap(self,xPos,yPos,iWidth,iHeight,bitmap_image):  ################ <<<<<<<<<<<<< . . . . >>>>>>>>>>>>>>>>>> ############### Draw Image
        "digole_drawBitmap with params"
        print("start:;digole_drawBitmap xPos[%d],yPos[%d],iWidth[%d],iHeight[%d]",xPos,yPos,iWidth,iHeight);
        i = 0;
        j = 0;
        if ((iWidth & 7) != 0):
            i = 1;
            
        self.lcd_clear()#cPM.cPM
        self.lcd_Tx_CMD("DIM"); # + xPos + yPos + iWidth + iHeight);#cPM.cPM
        self.lcd_Tx_Byte(xPos);#cPM.cPM
        self.lcd_Tx_Byte(yPos);#cPM.cPM
        self.lcd_Tx_Byte(iWidth);#cPM.cPM
        self.lcd_Tx_Byte(iHeight);#cPM.cPM
        
        #for i in range(0, 8):
        #    self.lcd_set_page(yPos+i,xPos)
        #    for j in range(128*i, 128*(i+1)): #
        #        self.lcd_Tx_Byte(RPi_Logo_Image[0][j])
                #self.lcd_Tx_Byte(bitmap_image[0][j])
        
        for j in range(0,  iHeight * ((iWidth >> 3) + i)):
            #for j in range(0,  10):
            ##print("j",j,"-",RPi_Logo_Image[0][j])
            self.lcd_Tx_Byte(bitmap_image[0][j]);#cPM.cPM
            #cPM.lcd_Tx_Byte(*(bitmap_image + j));
            #printf("%d-",*(bitmap + j));
            #delay(1);
           
        print(">>>iHeight * ((iWidth >> 3) + i)=",iHeight * ((iWidth >> 3) + i)); 
        
        #print("end:;digole_drawBitmap");
        return;
        
    def digole_drawBitmap_From_PIL_Image_Data(self,xPos,yPos,iWidth,iHeight,imageDataInBytes):  ################ <<<<<<<<<<<<< . .33333 . . >>>>>>>>>>>>>>>>>> ############### Draw Image
        "digole_drawBitmap_From_PIL_Image_Data with imageDataInBytes"
        #print("start: :digole_drawBitmap_From_PIL_Image_Data:",xPos,yPos,iWidth,iHeight,len(imageDataInBytes));
       
        self.lcd_clear()#cPM.cPM
        self.lcd_Tx_CMD("DIM"); # + xPos + yPos + iWidth + iHeight);#cPM.cPM
        self.lcd_Tx_Byte(xPos);#cPM.cPM
        self.lcd_Tx_Byte(yPos);#cPM.cPM
        self.lcd_Tx_Byte(iWidth);#cPM.cPM
        self.lcd_Tx_Byte(iHeight);#cPM.cPM
         
        for item in imageDataInBytes:
            #Invert Data from right to left, aka Transpose, because the Pixels were inverted right to left
            #iData_Raw = self.bit_reverse(item,8)
            iData = int(item/255);
            iData = self.bit_reverse(iData,8)#cPM.cPM
            #Invert data; i.e. 11110000 to 00001111
            iData = self.bit_invert(iData)#cPM.cPM
            self.lcd_Tx_Byte(iData); #/255 because the Bytes are built from 8x 255 bytes.#cPM.cPM
               
        #print("end: :digole_drawBitmap_From_PIL_Image_Data");  ######  3  #######
        return;
    
    def digole_serial_128x64_display_initialize(self):
        "Initialize Digole Disoplay"
        print("NEVER USE, nothing in here 12/10/14 - Start: Initializing Digole Module")
        
        return;
        
        
        # setup oled display on serial (txd pin 14) at 9600 baud 
        #moved to top of class self.port = serial.Serial("/dev/ttyAMA0", baudrate=9600, timeout=1.0)
        
        #Convert to Bytes (needed for Python >= 3.x)
        self.lcd_clear()#cPM.cPM
        strIPAddress = self.get_local_ip_address('10.0.1.1')
        strHostname = self.get_local_host_name(self)#cPM.cPM
        strSSID = self.get_local_wlan_ssid(self)#cPM.cPM
        print("Raspberry Pi - Local IP Address:",strIPAddress, " Hostname:", strHostname, " SSID:", strSSID)
        
        #exampleMessage = "" + strIPAddress
        #Set text in middle of screen
        #cPM.lcd_Tx_CMD("TP")
        #cPM.lcd_Tx_Byte(64)
        #cPM.lcd_Tx_Byte(32)
        self.lcd_Tx_CMD("TT" + "IP Address:" + chr(0))#cPM.cPM
        self.lcd_Tx_CMD("TP" + chr(0) + chr(1))#cPM.cPM
        self.lcd_Tx_CMD("TT" + strIPAddress + chr(0))#cPM.cPM
        
        #strIP_Address = self.get_local_ip_address('10.0.1.1')

   
        #TTBB = Set text postiotn "TP" where BB are X and Y
        self.lcd_Tx_CMD("TP" + chr(0) + chr(2))#cPM.cPM
        self.lcd_Tx_CMD("TT" + "Printer Name:" + chr(0))#cPM.cPM
        self.lcd_Tx_CMD("TP" + chr(0) + chr(3))#cPM.cPM
        self.lcd_Tx_CMD("TT" + strHostname + chr(0))#cPM.cPM

        self.lcd_Tx_CMD("TP" + chr(0) + chr(4))#cPM.cPM
        self.lcd_Tx_CMD("TTSSID:" + strSSID + chr(0))#cPM.cPM

        #DEBUG  
        #time.sleep(10.0);
        #cPM.lcd_clear()
        
        
        #time.sleep(0.2);
        #return;
        #Change Baud rate to FAST, digole always defaults to 9600
        #cPM.lcd_Tx_CMD("SB1152000")
        #port.write(bytes("SB" + chr(0), "utf-8"))
        # x00/0x0A/0x0D")
        #cPM.lcd_Tx_Byte(0x00);
        #cPM.lcd_Tx_Byte(0x0A);
        #cPM.lcd_Tx_Byte(0x0D);
        #time.sleep(1.0);
        
        #Change serial port on RPi to same Baud rate
        #port = serial.Serial("/dev/ttyAMA0", baudrate=115200, timeout=1)
        #time.sleep(1.0);
        #exampleMessage = "Test443-C"
        #cPM.lcd_Tx_CMD("TT" + exampleMessage + chr(0))
        
        #port.write(bytes("CLCL", "utf-8"))
        iFont = 7
        
        #Clear Display
        ##cPM.lcd_clear()
        
        
        time.sleep(0.1)
        
        while iFont < 1:
            self.lcd_Tx_CMD("CLCL")#cPM.cPM
            exampleMessage = "FoReal font " + str(iFont)
            self.lcd_Tx_CMD("TT" + exampleMessage + chr(0))#cPM.cPM
            time.sleep(0.1)
            #port.write(bytes("TT" + exampleMessage + chr(0), "utf-8"))
            #time.sleep(2)
            iFont = iFont + 1;
            self.lcd_Tx_CMD("SF"+chr(iFont)) #set font iFont#cPM.cPM
        
        #strImageName = "XandO_128x64.jpg"
        #strImageName = "XandO_128x64.bmp"
        #strImageName = "1stnLastPx.bmp"
        start_time = time.time()
        
        ## 1 ##
        bUse1 = FALSE
        if bUse1:
            ## Draw Bitmap from Static HEX Array ##
            #cPM.digole_drawBitmap(0,0,128,64,OctaCircle_Image);
            #cPM.digole_drawBitmap(0,0,128,64,CubeFiveByFive_Image);
            print("You should never see this, old test code");
        
        ## 2 ##
        ## Draw Bitmap from File : works on any file, image or NOT ##
        #From example here: http://stackoverflow.com/questions/1035340/reading-binary-file-in-python
        #great example : http://stackoverflow.com/questions/20276458/working-with-bmp-files-in-python-3
        #Created file in Photoshop
        #Converted from jpg to BMP  using web tool : http://www.online-convert.com/result/461c961dceb74d8a1b9d89825019dc02
        #File name: XandO_128x64.bmp on RPi, its 24630 Bytes
        #for b in bytes_from_file(strImageName):
            #get rid of headers of BMP
            #do_stuff_with(b)
            
        ## 3 ##
        # Open image using Pythons built in Image libraries  //
        # Benefit is it can be used for mahy image types, but that should not be an issue in prossduction  
        # PIL can also convery color and greyscale to nonochrome using: im.convert(mode, matrix)
        # PIL im.getdata() or im.getpixel might work
        # im.getdata is ordered in column-major and 
        # im.getpixel will be row-major.
        # PIL im.tobitmap() => string might work as well, converts to X11 Bitmap
        # PRO: Load time VERY fast at 63 milliseconds, does not include download to LCD, for a 24K Byte file
        #imMyImage = Image.open(strImageName)
        bUse3 = FALSE;
        #im = Image.open(strImageName)
        #print(im.format, im.size, im.mode)
        if bUse3:
            try:
                img = Image.open(strImageName)
                #Moved below so I can trap errors
            except: #Exception handling whilst opening files is always a great idea 
                print("Unable to load image",strImageName)
        
            
            print("The size of the Image is: ")
            print(img.format, img.size, img.mode)
            # Format to LCD size; currently 128x64
            # Create 8 bit bytes of 8 px data, where 1 is black and 0 is white (I think)
            # getpixel from: http://stackoverflow.com/questions/10579414/the-data-from-pils-getpixel-getdata-are-not-the-same
            # load command : http://stackoverflow.com/questions/1109422/getting-list-of-pixel-values-from-pil
            bUse_All_Pixel_Option_Load_FCN = FALSE
            if bUse_All_Pixel_Option_Load_FCN:
                pixels = img.load()
                iWidth, iHeight = img.size
                print("iWidth/iHeight: ",iWidth," / ",iHeight)
                all_pixels = []
                cpixel = pixels[x, y]
                if round(sum(cpixel)) / float(len(cpixel)) > 127:
                    all_pixels.append(255)
                else:
                    all_pixels.append(0)
            # use Image Convert to Type 1 (white or black) from: http://stackoverflow.com/questions/20541023/in-python-how-to-convert-array-of-bits-to-array-of-bytes
            bUse_ImgConvertType1Fcn = TRUE
            if bUse_ImgConvertType1Fcn:
                bits = list(img.convert("1").getdata())
                #bits = list(img.convert("1").getdata())
                #Roll through array and change all 255s to 1s
                #for item in bits:
                #    if item == 255:
                #        bits[item] = 1
                #    else:
                #        bits[item] = 0
                #b = raw_img_data
                # assuming that `bits` is your array of bits (0 or 1)
                # ordered from LSB to MSB in consecutive bytes they represent
                # e.g. bits = [0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1] will give you bytes = [128,255]
                bytesFromImgBits = [sum([byte[b] << b for b in range(0,8)]) for byte in zip(*(iter(bits),) * 8)]
                # warning! if len(bits) % 8 != 0, then these last bits will be lost
                # Send byte to LCD, rinse and repeat for 128x64=8192 bits or 1024 bytes.
                self.digole_drawBitmap_From_PIL_Image_Data(0,0,128,64,bytesFromImgBits);#cPM.cPM
                #Debug Bits to Bytes:
                #b = 0
                #for item in bits:
                #    if b < 8:
                #        print(b," : ",item)
                #    b = b + 1
                #debug Print
                #c = 0
                #for item in bytesFromImgBits:
                #    c = c + 1
                #    if c < 3:
                #        print(c, ": ",item);
                    
                print("About to print list of Bytes : Len(bytesFromImgBits)[", len(bytesFromImgBits)," Len(bits)=[", len(bits),"]")
                #print(bytesFromImgBits) 
                    
        ## 4 ## 
        # Load files from file system directly into LCD
        # This is fine as long as the files are already formatted for the LCD, or
        # Or we dont mind formatting them on the fly. For instance a BMP is RGBAlpha, 
        # so 4x bytes per pixel, and the serial Digole LCD wants one bit per pixel.
        # Someone has to convert the RGBA to 1bit/px format. This would only work on BMP, 
        # which are larger files and some exporters might not support them.
        # If we use PIL/Pillow then we can format to our size and ask for the values for 
        # specific pixels as we need them. This is ## 3 ##
        bUse4 = FALSE;
        if bUse4:
            self.load_bitmap_directly_to_LCD(strImageName,FALSE)#cPM.cPM
        
        finish_time = time.time()
        print("BMP Load, total time = %.3f" % (finish_time - start_time))
        #print("End: Initializing Digole Module : strImageName=[ ",strImageName, " ]")
        return; ######################################################################### EXIT  ######
        
        #scrap
        port.write(bytes("SOO"+chr(1)+"SOO"+chr(1), "utf-8"))
        port.write(bytes("CLCL", "utf-8"))
        port.write(bytes("CS" + chr(0), "utf-8"))
        port.write(bytes("SC" + chr(1), "utf-8"))
        port.write(bytes("CLCL", "utf-8"))
        
        port.write("SOO"+chr(1)+"SOO"+chr(1)) # turn the oled screen on (if off)
        port.write("CLCL") #clear screen, sets font to 0 (default) and cursor off at position 0,0
        # port.write("CS\x01") #cursor on, (\x01) hex value can be inserted in the text
        # the inline hex value (\0x01) will be converted to a character
        port.write("CS" + chr(0)) #cursor off, but chr(byte value) is perhaps clearer
        port.write("SC" + chr(1)) # set color to 1 (white)
        # text strings preceeded with the TT command and are terminated with 0x00 or 0x0D
        # they will wrap to the next line if long enough
        # port.write("TTexample text" + "\x00") # another hex value example in text
        # port.write("TTexample text" + "\o00") # octal value could be inserted in text
        port.write("TTdefault font 0" + chr(0)) # decimal byte value converted to a character
        port.write("SF"+chr(6)) #set font 6
        port.write("TRT") #text return, y value determined by current font size
        exampleMessage = "next line font 6"
        port.write("TT" + exampleMessage + chr(0))
        port.write("SF"+chr(10)) #set font 10
        port.write("TRT") #text return, y value determined by current font size 
        exampleMessage = "next line font 10"
        port.write("TT" + exampleMessage + chr(0))
        
    def set_to_be_printed_file_names_and_paths(self,strFullSVGPath):
        "central location to set all to be printed file names and paths"
        global strPrint_File_SVG_noExt
        global strDirToMake
        global strLayerImageDir
        global strLayerImageName_Base
        global strLayerImage_PNG_Folder_Append
        
        print("set_to_be_printed_file_names_and_paths : strFullSVGPath=[",strFullSVGPath,"]")
        #Strip .svg Ext from file name  //
        strPrint_File_SVG_noExt1 = strFullSVGPath.strip(".svg")
        print("strPrint_File_SVG_noExt1=" + strPrint_File_SVG_noExt1)
        #strPrint_File_SVG_noExt1 = strFullSVGPath.replace(".svg")
        #print("strPrint_File_SVG_noExt1="+strPrint_File_SVG_noExt1);
        #strPrint_File_SVG_noExt2 = strPrint_File_SVG_noExt1.strip(".SVG")
        strPrint_File_SVG_noExt2 = strPrint_File_SVG_noExt1;
        print("strPrint_File_SVG_noExt2=" + strPrint_File_SVG_noExt2)
        #print("strPrint_File_SVG_noExt2="+strPrint_File_SVG_noExt2);

        #also remove directory root
        strPrint_File_SVG_noExt = strPrint_File_SVG_noExt2.replace('/home/pi/ibox/packages/compressed/_svg/',"") #changed .strip to .replace
        strPrint_File_SVG_noExt = strPrint_File_SVG_noExt.replace(strPrint_File_Dir,"") #changed .strip to .replace
        #.translate is different for Puthon 2.x and 3.x see: http://stackoverflow.com/questions/21038891/what-does-table-the-string-translate-function-mean
        #chars_to_remove = ['/home/pi/ibox/packages/compressed/_svg/',strPrint_File_Dir]
        #strPrint_File_SVG_noExt = strPrint_File_SVG_noExt2;
        print("strPrint_File_SVG_noExt=" + strPrint_File_SVG_noExt)
        #strPrint_File_SVG_noExt.translate({ord('/home/pi/ibox/packages/compressed/_svg/'): '', ord(strPrint_File_Dir): ''})
        #table = string.maketrans('/home/pi/ibox/packages/compressed/_svg/', strPrint_File_Dir)
        #strPrint_File_SVG_noExt.translate(table, 'b')
        #///strPrint_File_SVG_noExt.strip('/home/pi/ibox/packages/compressed/_svg/')
        #strPrint_File_SVG_noExt.strip(strPrint_File_Dir)


        #strPrint_File_SVG_noExt.translate(None, ''.join(chars_to_remove))

        #print("strPrint_File_SVG_noExt="+strPrint_File_SVG_noExt + " :: Stripped(chars_to_remove):[" + chars_to_remove + "]");
        
        #Create folder with file name  //
        #evrythig you ever need to know about file and dir creation: http://stackoverflow.com/questions/273192/check-if-a-directory-exists-and-create-it-if-necessary
        strDirToMake = strPrint_File_Dir + strLayerImage_PNG_Folder_Append + strPrint_File_SVG_noExt  #The /data/ DIR was added to keep the root of uploads clean
        print("strDirToMake=="+strDirToMake)
        strLayerImageDir = strDirToMake ## i.e. /home/pi/ibox/uploads/data/Bunny10
        strLayerImageName_Base = strPrint_File_SVG_noExt ## i.e. Bunny10
    
    
    def treat_input(self,linein):
        global iGlobal_Currently_Stepping
        global last_work_time
        global bSoundEnabled 
        global strPrint_File_SVG
        global strPrint_File_SVG_noExt
        global strDirToMake
        global strLayerImageDir
        global strLayerImageName_Base
        global strLayerImage_PNG_Folder_Append
        global bPrinting_State_Printing_Last
        global bPrinting_State_Printing
        global iGlobal_Calibration_Current_LED
        
        print("linein=["+linein+"]")
        strLineInTMP = linein.strip("\r\n ")
        #strLineInTMP = linein.strip(" ")
        #//  see if there are multiple chunks of data  //
        aryData = strLineInTMP.split(':');
        for i in range(len(aryData)):
            print( "aryData[",i,"]=(" + aryData[i] + ")" )
        
        strLineIn = str(aryData[0]).strip();
        strLineIn = strLineIn.replace(" ", ""); 
        #print(">> 1 >>strLineIn=["+strLineIn+"]");
        
        print("len(aryData)=", len(aryData));
        strLineIn_1 = "default.svg" #file temp to avoid crashing because strLineIn_1 might not exist
        if len(aryData) >= 2:
            strLineIn_1 = str(aryData[1]);
            strLineIn_1 = strLineIn_1.strip(" ");
            #print(">>s>>strLineIn_1=["+strLineIn_1+"]");
        strLineIn_2 = "new_file : existing_file"
        if len(aryData) >= 3:
            strLineIn_2 = str(aryData[2]);
            strLineIn_2 = strLineIn_2.strip(" ");
            print(">>s>>strLineIn_2=["+strLineIn_2+"]");
        
        #print("Process: StdIn Input from Node.js WebGUI Server:", strLineIn, end="")
        #sys.stdout.flush()
        #///  Handle StdIN Requests Please  //
        if strLineIn == '/button_print':  #////////////////////////////////   PRINT  //////---------------------------
            print(">> button_print >>> SVG File:[", strLineIn_1,"]")
            sys.stdout.flush() 
            #Reload config to make sure its up to date for this print:
            self.load_JSON_Config_Data();
            #Verify its a legit file
            if strLineIn_1 == "Download or Select 3D File": #from /ibox/iBoxWebGUI.js
                
                #Maybe use last file, if it exists
                if len(strPrint_File_SVG) == 0:
                    print("Not a legit image file, Exiting");
                    self.status_messages_to_GUI("Please Select a File");
                    return;
                else:
                    print("Not a legit image file, using last file:" + strPrint_File_SVG);
            
            #Step1: Set file to be printed
            strPrint_File_SVG = strLineIn_1; #Globally set file to print
            
            
            #if strPrint_File_SVG == "b": # DEBUG
            #    strPrint_File_SVG = "/home/pi/ibox/uploads/Penguin_001_fromBetaSlic3r.svg"
            #add path if its missing  //
            #strPrint_File_SVG.strip(strPrint_File_Dir)
            #strPrint_File_SVG.strip(strLayerImage_PNG_Folder_Append)
            #strPrint_File_SVG.strip("/")
            #strPrint_File_SVG = strPrint_File_Dir + strPrint_File_SVG
            self.set_to_be_printed_file_names_and_paths(strPrint_File_SVG)
            
            

            self.beep(1);
            #//  Check to see if the dir exists already, if not we must create all of the files, even though we were told it was an Existing_file
            bDirExists = False;
            bMust_Create_Files = False;
            if strLineIn_2 == "existing_file":
                bDirExists = os.path.isdir(strLayerImageDir)
                if bDirExists == False:
                    bMust_Create_Files = True
                    print("Dir does not Exist. We must create all of the files, even though we were told it was an existing_file")
            
            if strLineIn_2 == "new_file" or bMust_Create_Files == True: #"new_file : existing_file"
                #Convert master SVG to many PNGs and count them
                ##thread = threading.Thread(target=self.fcnParseXMLFromSVG, args=())
                ##e = threading.Event()
                ##thread.start()
                #Must wait for this to be completed, so ONE THREAD
                #68 sec for 126 images, not bad
                self.fcnParseXMLFromSVG(); #this spawns threads that create PNG Files. So print manager should not verify files, they may not exist.
                time.sleep(3.0); #wait do the first layer or so is converted from SVG to PNG
        
            #Step2: Start print process.
            #self.buttonEventHandler_print(strPrint_File_SVG);
            thread = threading.Thread(target=self.print_command_manager, args=())
            e = threading.Event()
            thread.start()
            #return;

        elif strLineIn == 'SVG_Convert_To_IBF':  #////////////////////////////////   Convert SVG to Array of PNG aka IBF  //////---------------------------
            print(">> SVG_Convert_To_IBF >>> SVG File:[", strLineIn_1,"]")
            sys.stdout.flush() 
            #Reload config to make sure its up to date for this print:
            self.load_JSON_Config_Data(); #to get layer thickness Info
            strPrint_File_SVG = strLineIn_1; #Globally set file to print
            self.set_to_be_printed_file_names_and_paths(strPrint_File_SVG);
            self.fcnParseXMLFromSVG();
            
        elif strLineIn == '/button_stop':
            print(">> button_stop")
            #self.fcnCancel_Print_Job();
            self.beep(1);
            thread = threading.Thread(target=self.fcnCancel_Print_Job, args=())
            e = threading.Event()
            thread.start()
            self.status_messages_to_GUI("Printing Stopped");

        elif strLineIn == '/button_fastz':
            print(">> button_fastz")
            self.beep(1);
            #todo
            
        elif strLineIn == '/button_check_for_updates':
            print(">> button_check_for_updates ::  Most likely doing this from Node.js instead...")
            self.beep(1);
            #Get current File versions from www.iboxprinters.com, or maybe sister/mirror site
            url = 'http://www.bahntech.com/wp-content/uploads/2014/11/iBox_Nano_Update.txt'
            response = urllib.request.urlopen(url)
            update_data = response.read()      # a `bytes` object
            #update_text = data.decode('utf-8') # a `str`; this step can't be used if data is binary
            print("UPDATE: ",update_data)
            #save file as json
            
            #load file as json so we can use the default json engine
            
            #check verses current file versions
            
            #replace files of newer files are available that support this hardware
            
            #restart software
            
            
        
            
        elif strLineIn == '/button_enable_leds':
            print(">> button_enable_leds")
            self.beep(1);
            #todo
            
        elif strLineIn == '/button_download_file':
            print(">> button_download_file")
            self.beep(1);
            #Nothing to do from here
            
        elif strLineIn == '/button_auto_zero_z':
            print(">> button_auto_zero_z")
            self.beep(1);
            #Set flag to trigger auto zeroing Z  => Done in Node.js
            #Since node.js is saving to the system.json RIGHT NOW, please wait a bit to try and access the file
            time.sleep(0.5)
            self.load_JSON_System_Data()
        elif strLineIn == '/button_sound':
            print(">> button_sound")
            self.beep(1);
            #the toggle happens in Node.js, so reload System.json
            #Since node.js is saving to the system.json RIGHT NOW, please wait a bit to try and access the file
            time.sleep(0.5)
            self.load_JSON_System_Data()
            if bSoundEnabled == TRUE:
            	self.beep(5);
            #if bSoundEnabled == TRUE:
            #    bSoundEnabled = FALSE;
            #else:
            #    bSoundEnabled = TRUE;
             #   self.beep(5);
            
        elif strLineIn == '/button_settings':
            print(">> button_settings")
            self.beep(1);
            
        elif strLineIn == '/button_power':
            print(">> button_power")
            self.beep(1);
            
        elif strLineIn == '/button_z_up':
            print(">> button_z_up")
            #Reload config to make sure its up to date for this activity i.e. stepper speed may have been changed:
            self.load_JSON_Config_Data();
            #self.buttonEventHandler_up(100); #confihured for push momentary or hold, not a good fit.
            self.led_button_B_blue(LED_ON);# turn the green LED on
            self.beep(1);
            #self.stepperStep(iGlobal_Z_Manual_Button_Speed_Up_Fast,UP,fGlobal_Speed_Up_Fast); 
            thread = threading.Thread(target=self.stepperStep, args=(iGlobal_Z_Manual_Button_Speed_Up_Fast,UP,fGlobal_Speed_Up_Fast))
            e = threading.Event()
            thread.start()
            
        elif strLineIn == '/button_z_down':
            print(">> button_z_down")
            #Reload config to make sure its up to date for this activity i.e. stepper speed may have been changed:
            self.load_JSON_Config_Data();
            #self.buttonEventHandler_down(100);
            #self.led_button_A_green(LED_ON);
            self.beep(1);
            if iGlobal_Z_Position_Current > 0:  #was 0, but at boot it could be in a high state
                thread = threading.Thread(target=self.stepperStep, args=(iGlobal_Z_Position_Current,DOWN,fGlobal_Speed_Down_Fast))
                e = threading.Event()
                thread.start()
            else:
                #Go down X Steps
                thread = threading.Thread(target=self.stepperStep, args=(iGlobal_Z_Manual_Button_Speed_Down_Fast,DOWN,fGlobal_Speed_Down_Fast))
                e = threading.Event()
                thread.start()
                #self.stepperStep(iGlobal_Z_Manual_Button_Speed_Down_Fast,DOWN,fGlobal_Speed_Down_Fast); 
            
        elif strLineIn == '/button_z_stop':
            print(">> button_z_stop")
            #was anyone stepping?
            self.beep(1);
            if iGlobal_Currently_Stepping == TRUE:
                print(">>We were stepping; so STOP");
                iGlobal_Currently_Stepping = FALSE;
            else:
                print(">>Z was already stopped. Do Nothing...");
                
        elif strLineIn == 'load_config': 
            print("Load Config File - DEPRECIATED 11/20/14")
            #turn an led on or something, maybe beep as well 
            self.led_green_B1(LED_ON); 
            self.beep(1); 
            self.led_green_B1(LED_OFF);  
            self.led_green_B1(OFF);  

            print("ERROR:: We have decided this command should NOT BE USED any more and is depreciated: Please see notes in Node.js function: function fsConfig_Save()")
            self.load_JSON_Config_Data();
            
        elif strLineIn == 'connected': 
            print("Connected iBoxWebGUI-Node.js <--> iBoxPrintManager.py-Python")
            #turn an led on or something, maybe beep as well 
            self.beep(1);
            self.led_blue_B1(LED_ON); 
            self.led_blue_B1(ON); 
            
        elif strLineIn == '/uploaded_file':
            print(">> uploaded_file")
            self.beep(3); #beep to let them know it was a success

        elif strLineIn == '/manufacturing_and_test_on':
            print(">> manufacturing_and_test ON ======================= ON")
            self.beep(5); #beep to let them know it was a success
            #Reload config to make sure its up to date for this print:
            self.load_JSON_Config_Data();
            # Clear Screen
            self.lcd_Tx_CMD("CLCL");
            #//  Set Power
            self.SPI_LED1642_Register_Configuration(fExposure_Power_mA); 
            #Set Brightness to Def Values in Array
            bCAL_PWR = False
            if bCAL_PWR:
                aryLED_Brightness_Chip_1_L = aryLED_Brightness_Chip_1
                aryLED_Brightness_Chip_2_L = aryLED_Brightness_Chip_2
            else:
                aryLED_Brightness_Chip_1_L = aryLED_Brightness_Chip_1_Full_PWR
                aryLED_Brightness_Chip_2_L = aryLED_Brightness_Chip_2_Full_PWR
            self.SPI_LED1642_Set_Brightness_PWM(101,aryLED_Brightness_Chip_1_L,aryLED_Brightness_Chip_2_L);
            #Set Brightness:
            #self.SPI_LED1642_Register_Brightness(SPI_ON);
            #  Turn on UV Leds at Config Power for X seconds
            self.controlLED_UV(UV_LED_ON);
            #Delay
            time.sleep(60);
            #Disable UV LED
            self.controlLED_UV(UV_LED_OFF);

        elif strLineIn == '/manufacturing_and_test_on_calpwr':
            print(">> manufacturing_and_test ON ======================= ON = Calibrated power")
            self.beep(5); #beep to let them know it was a success
            #Reload config to make sure its up to date for this print:
            self.load_JSON_Config_Data();
            # Clear Screen
            self.lcd_Tx_CMD("CLCL");
            #//  Set Power
            self.SPI_LED1642_Register_Configuration(fExposure_Power_mA); 
            #Set Brightness to Def Values in Array
            bCAL_PWR = True
            if bCAL_PWR:
                aryLED_Brightness_Chip_1_L = aryLED_Brightness_Chip_1
                aryLED_Brightness_Chip_2_L = aryLED_Brightness_Chip_2
            else:
                aryLED_Brightness_Chip_1_L = aryLED_Brightness_Chip_1_Full_PWR
                aryLED_Brightness_Chip_2_L = aryLED_Brightness_Chip_2_Full_PWR
            self.SPI_LED1642_Set_Brightness_PWM(101,aryLED_Brightness_Chip_1_L,aryLED_Brightness_Chip_2_L);
            #Set Brightness:
            #self.SPI_LED1642_Register_Brightness(SPI_ON);
            #  Turn on UV Leds at Config Power for X seconds
            self.controlLED_UV(UV_LED_ON);
            #Delay
            time.sleep(60);
            #Disable UV LED
            self.controlLED_UV(UV_LED_OFF);

        elif strLineIn == '/manufacturing_and_test_off':
            print(">> manufacturing_and_test  ======================= Off")
            self.beep(1); #beep to let them know it was a success
            #Disable UV LED
            self.controlLED_UV(UV_LED_OFF);


            
        elif strLineIn == '1':

            self.beep(1);
            #Contrast Test 
            self.lcd_Tx_CMD("CT" + chr(22));#cPM.cPM
            print("contrast 22")
            time.sleep(7)
            
            self.beep(2);
            self.lcd_Tx_CMD("CT" + chr(23));#cPM.cPM
            print("contrast 23")
            time.sleep(7)

            self.beep(2);
            self.lcd_Tx_CMD("CT" + chr(24));#cPM.cPM
            print("contrast 24")
            time.sleep(7)

            self.beep(2);
            self.lcd_Tx_CMD("CT" + chr(30));#cPM.cPM
            print("contrast 30")
            time.sleep(7)

            self.beep(1);
            #Contrast Test 
            self.lcd_Tx_CMD("CT" + chr(85));#cPM.cPM
            print("contrast 85")
            time.sleep(7)
            
            self.beep(2);
            self.lcd_Tx_CMD("CT" + chr(86));#cPM.cPM
            print("contrast 86")
            time.sleep(7)

            self.beep(2);
            self.lcd_Tx_CMD("87" + chr(87));#cPM.cPM
            print("contrast 24")
            time.sleep(7)


            return;

            for i in range(110):
              self.beep(1);
              print("contrast ",i)
              self.lcd_Tx_CMD("CT" + chr(i))
              time.sleep(3)

            self.beep(4)
            self.lcd_Tx_CMD("CT" + chr(30));#cPM.cPM
            print("contrast 30")
            time.sleep(4)

            return;

            self.beep(1);
            #Contrast Test 
            self.lcd_Tx_CMD("CT" + chr(1));#cPM.cPM
            print("contrast 1")
            time.sleep(4)
            
            self.beep(2);
            self.lcd_Tx_CMD("CT" + chr(5));#cPM.cPM
            print("contrast 5")
            time.sleep(4)
            
            self.beep(3);
            self.lcd_Tx_CMD("CT" + chr(10));#cPM.cPM
            print("contrast 10")
            time.sleep(4)
            
            self.beep(4)
            self.lcd_Tx_CMD("CT" + chr(30));#cPM.cPM
            print("contrast 30")
            time.sleep(4)
            
            self.beep(5)
            self.lcd_Tx_CMD("CT" + chr(80));#cPM.cPM
            print("contrast 80")
            time.sleep(4)
            
            self.beep(6)
            self.lcd_Tx_CMD("CT" + chr(90));#cPM.cPM
            print("contrast 90")
            time.sleep(4)

            self.beep(6)
            self.lcd_Tx_CMD("CT" + chr(99));#cPM.cPM
            print("contrast 99")
            time.sleep(4)

            self.beep(6)
            self.lcd_Tx_CMD("CT" + chr(100));#cPM.cPM
            print("contrast 100")
            time.sleep(4)
            
            self.beep(3)
            self.lcd_Tx_CMD("CT" + chr(30));#cPM.cPM
            print("contrast 30")
            time.sleep(4)
            
        elif strLineIn == '2':  #Black out screen, Max Contrast, Opaque
            self.status_blink(1)
            self.lcd_Tx_CMD("FR" + chr(0) + chr(0) + chr(1300) + chr(1300)) ##cPM.cPM
            
        elif strLineIn == '3':  # HALF Black out screen, Max Contrast, Opaque
            self.status_blink(1)
            self.lcd_Tx_CMD("FR" + chr(0) + chr(0) + chr(65) + chr(65)) ##cPM.cPM
            
        elif strLineIn == '33': #DEBUG
            #strPrint_File_SVG = "/home/pi/ibox/uploads/bunny-flatfoot_FormatedForNano.svg" #Bunny10.svg"
            #strPrint_File_SVG = "/home/pi/ibox/uploads/Bunny10.svg" 
            strPrint_File_SVG = "Groot.svg"
            self.fcnParseXMLFromSVG();
            
        elif strLineIn == '4': #DEBUG
            #strPrint_File_SVG = "/home/pi/ibox/uploads/Penguin_001_fromProdSlic3r.svg"
            #strPrint_File_SVG = "/home/pi/ibox/uploads/eyeless_smooth_octo_nobase.svg"
            #strPrint_File_SVG = "/home/pi/ibox/uploads/OwlReDo1_fixed_sc_28perc.svg"
            #strPrint_File_SVG = "/home/pi/ibox/uploads/pixel_over_led_test.svg"
            #strPrint_File_SVG = "/home/pi/ibox/uploads/bunny-flatfoot_40x20_prodSlic3R.svg"
            #strPrint_File_SVG = "/home/pi/ibox/uploads/C1.svg"
            strPrint_File_SVG = "Bunny_Flatfoot_Med"
            #self.fcnParseXMLFromSVG();
            self.set_to_be_printed_file_names_and_paths(strPrint_File_SVG)
            thread = threading.Thread(target=self.print_command_manager, args=())
            e = threading.Event()
            thread.start()
            
        elif strLineIn == '53': #blink test
            self.beep(7);
            #self.stepper_move_up_fullStep(200000, 0.004)#//  good torque, 4 = twice as fast as the Pololu at max speed.
            #self.load_JSON_System_Data();
            #GPIO.output(4,1)
            #time.sleep(10)
            #GPIO.output(4,0)
            self.controlLED_UV(UV_LED_ON)
            time.sleep(600)
            self.controlLED_UV(UV_LED_OFF)
            self.beep(7);
            
        elif strLineIn == '5': #Clear LCD
            self.beep(2);
            #lcd_clear();
            self.lcd_Tx_CMD("CLCL");

        elif strLineIn == '6': #Turn on 1 led every time pressed
            self.beep(1);
            
            if iGlobal_Calibration_Current_LED > 30:
              iGlobal_Calibration_Current_LED = 0;
            #Turn on just the UV Led in qurstion
            
            aryLED_All_Off = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            aryLED_Brgt_Active = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            #for i in range(32):
            i = iGlobal_Calibration_Current_LED
            if i < 16:
              aryLED_Brgt_Active[i] = 100
              self.SPI_LED1642_Set_Brightness_PWM(101,aryLED_Brgt_Active,aryLED_All_Off);
            else:
              aryLED_Brgt_Active[i-15] = 100
              self.SPI_LED1642_Set_Brightness_PWM(101,aryLED_All_Off,aryLED_Brgt_Active);
            print(i," : iGlobal_Calibration_Current_LED=",iGlobal_Calibration_Current_LED," : aryLED_Brgt_Active=[",aryLED_Brgt_Active,"]")
            iGlobal_Calibration_Current_LED = iGlobal_Calibration_Current_LED + 1
        elif strLineIn == '7': #SPI test
            self.beep(1);           
            #self.SPI_Setup();
            self.SPI_LED1642_Register_Switch(SPI_ON);
        elif strLineIn == '77': #SPI test
            self.beep(2);           
            #self.SPI_Setup();
            self.SPI_LED1642_Register_Switch(SPI_OFF);
            
        elif strLineIn == '8': #SPI test
            self.beep(1);           
            self.SPI_LED1642_Register_Brightness(SPI_ON);
        elif strLineIn == '88': #SPI test
            self.beep(2);           
            self.SPI_LED1642_Register_Brightness(SPI_OFF);
            
        elif strLineIn == '9': #PWM LED1642 test
            self.beep(1);           
            self.SPI_LED1642_Brightness_PWM();
            
        elif strLineIn == '11': #PWM LED1642 Set Brightness to 10%
            self.beep(1);           
            self.SPI_LED1642_Set_Brightness_PWM(10,aryLED_Brightness_Chip_1,aryLED_Brightness_Chip_2);
            
        elif strLineIn == '12': #PWM LED1642 Set Brightness to 20%
            self.beep(1);           
            self.SPI_LED1642_Set_Brightness_PWM(20,aryLED_Brightness_Chip_1,aryLED_Brightness_Chip_2);
            
        elif strLineIn == '13': #PWM LED1642 Set Brightness to 30%
            self.beep(1);           
            self.SPI_LED1642_Set_Brightness_PWM(30,aryLED_Brightness_Chip_1,aryLED_Brightness_Chip_2);
            
        elif strLineIn == '14': #PWM LED1642 Set Brightness to 40%
            self.beep(1);           
            self.SPI_LED1642_Set_Brightness_PWM(40,aryLED_Brightness_Chip_1,aryLED_Brightness_Chip_2);
            
        elif strLineIn == '15': #PWM LED1642 Set Brightness to 50%
            self.beep(1);           
            self.SPI_LED1642_Set_Brightness_PWM(50,aryLED_Brightness_Chip_1,aryLED_Brightness_Chip_2);
            
        elif strLineIn == '16': #PWM LED1642 Set Brightness to 60%
            self.beep(1);           
            self.SPI_LED1642_Set_Brightness_PWM(60,aryLED_Brightness_Chip_1,aryLED_Brightness_Chip_2);
            
        elif strLineIn == '17': #PWM LED1642 Set Brightness to 70%
            self.beep(1);           
            self.SPI_LED1642_Set_Brightness_PWM(70,aryLED_Brightness_Chip_1,aryLED_Brightness_Chip_2);
            
        elif strLineIn == '18': #PWM LED1642 Set Brightness to 80%
            self.beep(1);           
            self.SPI_LED1642_Set_Brightness_PWM(80,aryLED_Brightness_Chip_1,aryLED_Brightness_Chip_2);

        elif strLineIn == '19': #PWM LED1642 Set Brightness to 90%
            self.beep(1);           
            self.SPI_LED1642_Set_Brightness_PWM(90,aryLED_Brightness_Chip_1,aryLED_Brightness_Chip_2);
            
        elif strLineIn == '20': #PWM LED1642 Set Brightness to 100%
            self.beep(1);           
            self.SPI_LED1642_Set_Brightness_PWM(100,aryLED_Brightness_Chip_1,aryLED_Brightness_Chip_2);
            
        elif strLineIn == '21': #PWM LED1642 Set Brightness to use LED Brightness Arrays instead of global %
            self.beep(1);           
            self.SPI_LED1642_Set_Brightness_PWM(101,aryLED_Brightness_Chip_1,aryLED_Brightness_Chip_2);
            
        elif strLineIn == '655': #Configuration LED1642 test
            self.beep(2);           
            self.SPI_LED1642_Register_Configuration(5.5);
            
        elif strLineIn == '660': #Configuration LED1642 test
            self.beep(2);           
            self.SPI_LED1642_Register_Configuration(6.0);
            
        elif strLineIn == '670': #Configuration LED1642 test
            self.beep(2);           
            self.SPI_LED1642_Register_Configuration(7.0);
            
        elif strLineIn == '680': #Configuration LED1642 test
            self.beep(2);           
            self.SPI_LED1642_Register_Configuration(8.0);
            
        elif strLineIn == '690': #Configuration LED1642 test
            self.beep(2);           
            self.SPI_LED1642_Register_Configuration(9.0);
            
        elif strLineIn == '610': #Configuration LED1642 test
            self.beep(2);           
            self.SPI_LED1642_Register_Configuration(10.0);
            
        elif strLineIn == '611': #Configuration LED1642 test
            self.beep(2);           
            self.SPI_LED1642_Register_Configuration(11.0);
            
        elif strLineIn == '612': #Configuration LED1642 test
            self.beep(2);           
            self.SPI_LED1642_Register_Configuration(12.0);
            
        elif strLineIn == '613': #Configuration LED1642 test
            self.beep(2);           
            self.SPI_LED1642_Register_Configuration(13.0);
            
        elif strLineIn == '614': #Configuration LED1642 test
            self.beep(2);           
            self.SPI_LED1642_Register_Configuration(14.0);
            
        elif strLineIn == '614': #Configuration LED1642 test
            self.beep(2);           
            self.SPI_LED1642_Register_Configuration(14.0);
            
        elif strLineIn == '614': #Configuration LED1642 test
            self.beep(2);           
            self.SPI_LED1642_Register_Configuration(14.0);
            
        elif strLineIn == '615': #Configuration LED1642 test
            self.beep(2);           
            self.SPI_LED1642_Register_Configuration(15.0);
            
        elif strLineIn == '616': #Configuration LED1642 test
            self.beep(2);           
            self.SPI_LED1642_Register_Configuration(16.0);

        elif strLineIn == '617': #Configuration LED1642 test
            self.beep(2);           
            self.SPI_LED1642_Register_Configuration(17.0);
            
        elif strLineIn == '618': #Configuration LED1642 test
            self.beep(2);           
            self.SPI_LED1642_Register_Configuration(18.0);
            
        elif strLineIn == '619': #Configuration LED1642 test
            self.beep(2);           
            self.SPI_LED1642_Register_Configuration(19.0);
            
        elif strLineIn == '620': #Configuration LED1642 test
            self.beep(2);           
            self.SPI_LED1642_Register_Configuration(19.9);

        elif strLineIn == '69': #Configuration LED1642 test
            self.beep(4);           
            self.SPI_LED1642_Register_Configuration_Read();        
        elif strLineIn == 'beep': #Configuration LED1642 test
            self.beep(1);                 
            
        else:
            print("-------- ERROR: Unrecognized Command: [",strLineIn,"]")
            self.beep(7);
            
        sys.stdout.flush() 
        time.sleep(0.2) # working takes time
        #print('Complete:<<<<<<<')
        sys.stdout.flush()
        last_work_time = time.time()
    
    def idle_work(self):
      global last_work_time
      global bPrinting_State_Printing_Last
      global bPrinting_State_Printing
      global splash_screen_white_led_counter
      
      #//  DEBUG : NEVER INTERRUPT
      #return;
      
      now = time.time()
      # do some other stuff every 2 seconds of idleness
      if now - last_work_time > 2:
        #print('Idle for too long; doing some other stuff.')
        #sys.stdout.flush()
        last_work_time = now
        # Having a 100% CPU reported issue on RPi, might be this. Trying to add a sleep...
        time.sleep(0.01);
        if bPrinting_State_Printing == 0:
            self.led_blue_B1(LED_ON);
        else:
            self.led_blue_B1(LED_ON);
            self.led_green_B1(LED_ON);
            
        #self.led_green_B1(LED_ON); 
        #self.led_button_B_blue(LED_ON); 
        time.sleep(0.2)
        if bPrinting_State_Printing == 0:
            self.led_blue_B1(LED_OFF); 
        else:
            self.led_blue_B1(LED_OFF); 
            self.led_green_B1(LED_OFF); 
            
        #self.led_green_B1(LED_OFF); 
        #self.led_button_B_blue(LED_OFF); 
        #print(".");
        if bPrinting_State_Waiting_For_Platform_To_Reach_Bottom == 1:
          #Waiting for platform to reach bottom. Blink PRINT light 
          time.sleep(0.16)
          self.led_red_B1(LED_ON); 
          time.sleep(0.16)
          self.led_red_B1(LED_OFF); 
          time.sleep(0.16)
          self.led_red_B1(LED_ON); 
          time.sleep(0.16)
          self.led_red_B1(LED_OFF); 

        
        #  Update State "Printing" , "Ready" etc //  
        if bPrinting_State_Printing != bPrinting_State_Printing_Last:
            bPrinting_State_Printing_Last = bPrinting_State_Printing;
            if bPrinting_State_Printing == 0:
                self.status_messages_State_General("Ready");
            else:
                self.status_messages_State_General("Printing");

        #Turn OFF White LEDs
        if splash_screen_white_led_counter > 0:
          splash_screen_white_led_counter = splash_screen_white_led_counter - 1
          #refresh LCD
          
          if splash_screen_white_led_counter == 0:
            #Turn OFF White LEDs
            self.controlLED_UV(UV_LED_OFF);
          else:
          	if splash_screen_white_led_counter == 16:
          		self.load_splash_screen()
          	if splash_screen_white_led_counter == 12:
          		self.load_splash_screen()
          	if splash_screen_white_led_counter == 8:
          		self.load_splash_screen()
          	if splash_screen_white_led_counter == 3:
          		self.load_splash_screen()

    
    def fcnParseXMLFromSVG(self):
        "parse xml from svg file and create a directory full of PNG files." #Updated for Share/Browse/Create on 4/3/2015 TRC
        global strPrint_File_SVG
        global strPrint_File_SVG_noExt
        global strDirToMake
        global strLayerImageDir
        global strLayerImageName_Base
        global iNumber_Of_Layers
        global strDashBeforeNumbers

        print("Parse XML from SVG File : fcnParseXMLFromSVG:", strPrint_File_SVG);
        self.status_messages_to_GUI("Processing 3D Model");
        start_time_layer = time.time()
        elapsed_time_total = 0
        elapsed_time = 0
        self.status_blink(1);
        strPath_And_Filename_SVG_Source = '/home/pi/ibox/packages/compressed/_svg/' + strPrint_File_SVG
        #strPath_And_Filename_SVG_Source = '/home/pi/ibox/uploads/bunny-flatfoot_40x20_prodSlic3R_0000 2.svg'
        try:
            tree = ET.parse(strPath_And_Filename_SVG_Source)
            #tree = ET.parse(open(strPrint_File_SVG, "r"))
            root = tree.getroot()
        except:
            print("fcnParseXMLFromSVG : Unable to open and parse input definition file: " + strPath_And_Filename_SVG_Source)
            return
            pass
        
        self.set_to_be_printed_file_names_and_paths(strPrint_File_SVG);
        self.status_blink(1);
        iCounter = -1 #base 0
        aryLayer = [] #define array
        strLayer_Points = ""
        
        #Get Width and Geight from XML  i.e. <svg width="20.725936" height="16.063476" ...
        iSVG_Width = str(40)
        iSVG_Height = str(19) #to do grab from original Slic3r SVG or set to printer width + height
        
        #Get width and height from root of svg XML
        #iSVG_Width = root.tag('width')
        #iSVG_Height = child.get('height')
        iSVG_Width = str(root.get('width'))
        iSVG_Height = str(root.get('height'))
        #print("root.tag=",root.tag," :: root.attrib=",root.attrib) #Returns: width : 20 height : 16
        #for value in root.attrib:
        #    print("value=",value) #returns value-width value=height
            
            #print("root.attrib.value.tag=",value.tag)
        #for attrib in root:
            #print("child.tag=",child.tag," :::: child.attrib=",child.attrib) #returns z: 1.5e-07, id: layer1
            
        #print("iSVG_Width=",iSVG_Width," iSVG_Height=",iSVG_Height) #," :: child.find('width').text=",child.find('svg').text
        
        if not os.path.exists(strDirToMake):
            os.makedirs(strDirToMake)
            print("Created Directory for SVG parsed PNG Files:",strDirToMake)
        else:
            print("The directory: ",strDirToMake," already existed, so we will be overwriting the old files in the dir")
        
        #//////////////////////////////////////////////////////////////////
        #/////   New XML Copy - Parser  /////////////////////////////////// START
        #Output XML
        iCNT_Lines = 0
        #top.value
        strXML_Header = '<svg width="' + iSVG_Width + '" height="' + iSVG_Height + '">\n'
        strXML_Footer = '\n</svg>'
        strXML_Body = ""
        strXML_File = ""
        #newtree = ET.ElementTree()
        #top = ET.Element(strXML_TMP)
        #newtree._setroot(top)
        #This is to get slic3r:type namespace to be recognized by ElementTree XML tools
        namespaces = {'slic3r': 'http://slic3r.org/namespaces/slic3r/'} # add more as needed
        strLayerNumber = ""
        
        for child in root:
            self.status_blink(1);
            if iCNT_Lines > 0:
                #Write a file each pass  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> file write start ::
                strXML_File = strXML_Header + strXML_Body + strXML_Footer
                strLayerNumber = str(iCNT_Lines-1);
                #if len(strLayerNumber) == 1:
                #    strLayerNumber = "000" + strLayerNumber;
                #if len(strLayerNumber) == 2:
                #    strLayerNumber = "00" + strLayerNumber;
                #if len(strLayerNumber) == 3:
                #    strLayerNumber = "0" + strLayerNumber;  
                strFileAndPath_svg = strDirToMake + '/' + strPrint_File_SVG_noExt + strDashBeforeNumbers + strLayerNumber + ".svg"
                #Delete file if it exists:
                if os.path.exists(strFileAndPath_svg):
                    os.remove(strFileAndPath_svg) #delete file
                with open(strFileAndPath_svg, "w") as text_file:
                    print(strXML_File, file=text_file)
                text_file.close();
                strXML_Body = "" #clear body
                print("svg#",iCNT_Lines," @ ",strFileAndPath_svg);
                #Write a file each pass  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> file write END ::
            iCNT_Lines = iCNT_Lines + 1
            #print(child.tag, child.attrib) # Result : Prints all layer text : i.e. z: 5xe-7 id: layer0
            for child in child:
                self.status_blink(1);
                #print("child.tag=",child.tag," :: child.attrib=",child.attrib)
                strXML_Body = strXML_Body + "<polygon"
                #for elem in root.findall('g/{http://slic3r.org/namespaces/slic3r/}type'):
                #    print(elem.text)
                #print(child.tag, child.attrib) #result: Prints all polygon attribs ==> This is what we want.
                #print("type=",child.get('{http://slic3r.org/namespaces/slic3r}type'))
                strXML_Body = strXML_Body + ' type="' + child.get('{http://slic3r.org/namespaces/slic3r}type') + '"'
                #polygon = ET.SubElement(top, 'polygon')
                #resu5 = child.findall('slic3r:type',namespaces=namespaces)
                #print("resu5=",resu5)
                #for type_found in child.findall('slic3r:type',namespaces=namespaces):
                #    print("type_found=",type_found);
                    #strXML_Body = strXML_Body + type_found 
                #strXML_Body = strXML_Body +  #child.findall('slic3r:type',namespaces=namespaces)
                #get_name = child.get('points')
                strXML_Body = strXML_Body + ' points="' + child.get('points') + '"';
                #polygon.set('points', get_name)
                value_style = child.get('style')
                value_style = str(value_style).strip()
                # Need to overwrite FILL and invert it because it is using inverted colors
                #Not really, on the holes are black and countours are white, thats correct.
                if value_style == "white":
                    value_style = "black";
                if value_style == "black":
                    value_style = "white"
                    #if its not black or white, I suppose we leave it alone....
                strXML_Body = strXML_Body + ' style="' + value_style + '" />';
                #self.beep(1)


        
        #Write a file each pass  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> file write start :: Same as above, but this is the last one. CP and Paste any changes to BOTH sections
        strXML_File = strXML_Header + strXML_Body + strXML_Footer
        strLayerNumber = str(iCNT_Lines-1);
        #if len(strLayerNumber) == 1:
        #    strLayerNumber = "000" + strLayerNumber;
        #if len(strLayerNumber) == 2:
        #    strLayerNumber = "00" + strLayerNumber;
        #if len(strLayerNumber) == 3:
        #    strLayerNumber = "0" + strLayerNumber;  
        strFileAndPath_svg = strDirToMake + '/' + strPrint_File_SVG_noExt + strDashBeforeNumbers + strLayerNumber + ".svg"
        #Delete file if it exists:
        if os.path.exists(strFileAndPath_svg):
            os.remove(strFileAndPath_svg) #delete file
        with open(strFileAndPath_svg, "w") as text_file:
            print(strXML_File, file=text_file)
        text_file.close();
        strXML_Body = "" #clear body
        print("svg#",iCNT_Lines," @ ",strFileAndPath_svg);
        #Write a file each pass  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> file write END ::
        elapsed_time = time.time() - start_time_layer;
        print(">>>>Parse_XML: elapsed_time=" ,elapsed_time);
        start_time_layer = time.time()
        #for polygon in root.findall('polygon'):
        #            strXML_TMP = strXML_TMP + polygon + "1\n"
        
        #for elem in root:
        #    for source in elem:
        #        for zone in elem.findall('polygon'):    #scrap if source.find('polygon'):
        #            strXML_TMP = strXML_TMP + zone + "\n"
        #            #childpoly = ET.SubElement(zone)
                    #childpoly = SubElement(top, 'polygon')
                    #childpoly.set(
                    #add_items(etree.SubElement(root, 'Item'),
                    #elem.append(copy.deepcopy(source))
                    #Write New XML  

                    #return #DEBUG
        
        #strXML_TMP = strXML_TMP + "</svg>"
        #print("XML=" + strXML_TMP);
        #ET.dump(top)
        #newtree.write('/home/pi/ibox/scrap/output_7.xml', xml_declaration=True, encoding='utf-8')
        #iCNT_Lines = iCNT_Lines + 1;
        print("DONE----SVG_ORIG==> XML ==> file_0001.svg------------------------------------")

        #//////////////////////////////////////////////////////////////////
        #////////////////////////////////////////////////////////////////// END
        
        #for child in root:
        #    if iCounter >= 0:
        #        aryLayer.insert(iCounter,strLayer_Points);
        #        strLayer_Points = ""
                #root.tag = svg
                #root.attrib = width="18" height="45"

        #    iCounter = iCounter + 1;
            #print(child.tag, " : " , child.attrib);
        #    for child in child:
                #find_polygon = child.find('points')
        #        get_name = child.get('points')
                #print(iCounter," :: ", get_name)
        #        strLayer_Points = strLayer_Points + get_name;
                #print(child.tag, " : " , child.attrib);
        #records layer Last
        #aryLayer.insert(iCounter,strLayer_Points);
        
        #elapsed_time = time.time() - start_time_layer;
        #print(">>>>Parse_XML: elapsed_time=" ,elapsed_time);
                

        
        strLayerNumber = "0"
        iCounter = iCNT_Lines  #base 0
        for i in range(iCounter):
            self.status_blink(1);
            #print("L",i,"=",aryLayer[i]);
            strLayerNumber = str(i);
            #if len(strLayerNumber) == 1:
            #    strLayerNumber = "000" + strLayerNumber;
            
            #if len(strLayerNumber) == 2:
            #    strLayerNumber = "00" + strLayerNumber;
        
            #if len(strLayerNumber) == 3:
            #    strLayerNumber = "0" + strLayerNumber; 
                
            strFileAndPath_svg = strDirToMake + '/' + strPrint_File_SVG_noExt + strDashBeforeNumbers + strLayerNumber + ".svg"
            strFileAndPath_png = strDirToMake + '/' + strPrint_File_SVG_noExt + strDashBeforeNumbers + strLayerNumber + ".png"
            print("strFileAndPath(s):" + strFileAndPath_svg + " :: " + strFileAndPath_png)
            #Delete file if it exists:
            if os.path.exists(strFileAndPath_png):
                os.remove(strFileAndPath_png) #delete file
                
            #Format as XML
            #with open(strFileAndPath_svg, "w") as text_file: #"
            #    print('<svg width="'+ iSVG_Width + '" height="' + iSVG_Height + '"><polygon type="contour" points="' + aryLayer[i] + '" style="fill: white" /></svg>', file=text_file)
                #print('<svg width="'+iSVG_Width + '" height="' + iSVG_Height + '"><polygon points="' + aryLayer[i] + '" style="fill:lime;stroke:black;stroke-width:1"/></svg>', file=text_file)
            #text_file = open(strFileAndPath_svg, "w") 
            #strTextFile = str('<svg width="',iSVG_Width , '" height="' , iSVG_Height , '"><polygon points="' + aryLayer[i] + '" style="fill:lime;stroke:black;stroke-width:1"/></svg>')
            #text_file.write(strTextFile)
            #text_file.close()    
                
            #Save to file, mumbered as the list order base 0
            #time.sleep(0.11);
            #print(i," >>strFileAndPath(s):" + strFileAndPath_svg + " :: " + strFileAndPath_png)
            #///////////////////////////////////////////////////////////////////
            #///////    Now Convert the file from .svg to .png  
            #I know I can pipe it to console >convert file.svg file.png : http://stackoverflow.com/questions/89228/calling-an-external-command-in-python
            #subprocess.call(['ping', 'localhost'])   
            #error replace 40x20 with 128x64 params = ["-background", '#000000',"-gravity",'center',"-extent",'40x20'] #-background:black or -background "#000000"  -gravity center -extent 1920x1080
            #params = ["-background", '#000000',"-gravity",'center',"-extent",'128x64']
            params = ["-density",'236',"-extent",'128x64',"-gravity",'center',"-background", '#000000']
            #params_output = ["-scale",'128x64']
            params_output = ["-extent",'128x64']
            command_convert = ['convert'] + params + [strFileAndPath_svg] + params_output + [strFileAndPath_png] 
            print(str.join(' ', command_convert))
            #pid = subprocess.Popen([sys.executable, "convert ~" + strFileAndPath_svg + " ~" + strFileAndPath_png])
            pid = subprocess.Popen(command_convert)
            #//////////////////////////////////////////////////////////////////
            # http://www.imagemagick.org/script/convert.php
            # 10/21/14 testing with cookie_cutter_bat0000.svg
            #To try: -antialias
            #-brightness-contrast
            #-contrast
            #-interlace
            #All test output in ibox/scrap dir
            #convert -background "#000000" -gravity center -extent 40x20 cookie_cutter_bat0000.svg -scale 128x64 cookie_cutter_bat_1.png => pixely at 40x20, let the output engine do this
            # convert -background "#000000" -gravity center -extent 128x64 cookie_cutter_bat0000.svg -scale 128x64 cookie_cutter_bat_2.png => small in middle
            # convert cookie_cutter_bat0000.svg -background "#000000" -gravity center -extent 128x64 cookie_cutter_bat_3.png => small center white box
            # convert -density 72 -background "#000000" cookie_cutter_bat0000.svg cookie_cutter_bat_4.png => formatted at 39x20
            # convert -density 236 -background "#000000" cookie_cutter_bat0000.svg cookie_cutter_bat_5.png => Close, rendered 127x65 in 72dpi
            # convert -density 300 -background "#000000" cookie_cutter_bat0000.svg -extent 128x64 cookie_cutter_bat_6.png => overscaled, not fitting in final image
            # convert -density 72 -background "#000000" cookie_cutter_bat0000.svg -extent 128x64 cookie_cutter_bat_7.png => stange, bat in upper-left corner at 25% scale
            # convert -density 72 -extent 128x64 -background "#000000" cookie_cutter_bat0000.svg cookie_cutter_bat_8.png => same as last
            # convert -density 72 cookie_cutter_bat0000.svg -extent 128x64 -background "#000000" cookie_cutter_bat_9.png => same as last but all white bkround
            # convert -density 72 cookie_cutter_bat0000.svg -background "#000000" cookie_cutter_bat_10.png => just horrible
            # convert -density 236 -background "#000000" cookie_cutter_bat0000.svg -resize 128x64 cookie_cutter_bat_11.png => 125x64 pixels
            # convert -density 72 -background "#000000" cookie_cutter_bat0000.svg -extent 128x64 cookie_cutter_bat_12.png =>upper left corner
            # convert -density 72 -extent 128x64 -background "#000000" cookie_cutter_bat0000.svg cookie_cutter_bat_13.png => upper left corner
            # convert -density 236 -background "#000000" cookie_cutter_bat0000.svg -extent 128x64 cookie_cutter_bat_14.png => works great
            # convert -density 236 -extent 128x64 -background "#000000" cookie_cutter_bat0000.svg cookie_cutter_bat_15.png => works great
            #testing on small bat 50%  cookie_cutter_bat_sm50p0000.svg
            # convert -density 236 -extent 128x64 -background "#000000" cookie_cutter_bat_sm50p0000.svg cookie_cutter_bat_sm50p0001.png => worked - not centered - corner cut off
            # convert -gravity center -density 236 -extent 128x64 -background "#000000" cookie_cutter_bat_sm50p0000.svg cookie_cutter_bat_sm50p0002.png => worked - corner cut off
            # convert -gravity center -density 72 -extent 128x64 -background "#000000" cookie_cutter_bat_sm50p0000.svg cookie_cutter_bat_sm50p0003.png => bad res. 
            # convert -gravity center -extent 128x64 -background "#000000" cookie_cutter_bat_sm50p0000.svg cookie_cutter_bat_sm50p0004.png => small blurry mess
            # convert -density 236 -extent 128x64 -gravity center -background "#000000" cookie_cutter_bat_sm50p0000.svg cookie_cutter_bat_sm50p0005.png => good but clpped corner
            # convert -density 300 -extent 128x64 -gravity center -background "#000000" cookie_cutter_bat_sm50p0000.svg cookie_cutter_bat_sm50p0006.png => too large
            # convert -density 230.4 -extent 128x64 -gravity center -background "#000000" cookie_cutter_bat_sm50p0000.svg cookie_cutter_bat_sm50p0007.png => 230.4 = (128/40)*70dpi
            # convert -density 230 -extent 128x64 -gravity center -background "#000000" cookie_cutter_bat_sm50p0000.svg cookie_cutter_bat_sm50p0007.png
            # convert -density 230  -gravity center -background "#000000" cookie_cutter_bat_sm50p0000.svg cookie_cutter_bat_sm50p0008.png =>img 60x31 and cutt off
            # convert -gravity center -background "#000000" cookie_cutter_bat_sm50p0000.svg cookie_cutter_bat_sm50p0009.png =>microscopic blob
            # convert -density 280 -gravity center -background "#000000" cookie_cutter_bat_sm50p0000.svg cookie_cutter_bat_sm50p0010.png => 73x38 right edge cut off, should be 62px wide
            # convert -density 236 -extent 128x64 -gravity center -background "#000000" cookie_cutter_bat_sm50p0000.svg cookie_cutter_bat_sm50p0011.png
            # convert -density 236 -extent 128x64 -gravity center -background "#000000" cookie_cutter_bat0000edited.svg cookie_cutter_bat_sm50p0012.png
            # convert -density 236 -extent 128x64 -gravity center -background "#000000" cookie_cutter_bat_sm50p0000xml.svg cookie_cutter_bat_sm50p0013.png
            # convert -density 236 -extent 128x64 -gravity center -background "#000000" cookie_cutter_bat_sm50p0000.svg cookie_cutter_bat_sm50p0014.png => wing edge on right still cut off.
            # convert -density 150 -extent 128x64 -gravity center -background "#000000" cookie_cutter_bat_sm50p0000.svg cookie_cutter_bat_sm50p0015.png => right wing still cut off
            # convert -density 1200 -resize 128x64 -gravity center -background "#000000" cookie_cutter_bat_sm50p0000.svg cookie_cutter_bat_sm50p0016.png => resize fills screen (right corner still missing)
            # convert -density 236 -resize 128x64 -gravity center -background "#000000" cookie_cutter_bat_sm50p0000.svg cookie_cutter_bat_sm50p0017.png
            # convert -density 236 -extent 128x64 -gravity center -background "#000000" cookie_cutter_bat_sm50p0000.svg cookie_cutter_bat_sm50p0018.png
            elapsed_time = time.time() - start_time_layer;
            elapsed_time_total = (elapsed_time_total + elapsed_time);
            print(".svg to PNG : elapsed_time=" ,elapsed_time, "  ::  elapsed_time_total=" , elapsed_time_total);
            elapsed_time = 0;
            self.beep(1)

        iNumber_Of_Layers = iCounter - 1 #base 0 iNumber_Of_Layers = last number on file.
            
        print("fcnParseXMLFromSVG Exiting...................")
        #Delete SVG files  
        strScript_Full_Path = 'sudo rm ' + strDirToMake + '/*.svg'
        print("Deleting SVG Layer files using " + strScript_Full_Path)
        #Does not seem to work from here, moved to ibp_generate_thumbnails under a var eXcOut = execSync(strExec);
        try:
            pid = subprocess.Popen(strScript_Full_Path, stdout=subprocess.PIPE)
        except OSError:
            print ("Could not run the script: " + strScript_Full_Path)
            #exit(1) WHY EXIT?
        out, err = pid.communicate()
        print('pid out=[' + str(out) + '] : err=[' + str(err) + ']');
        # Tell Node.js to create Thumbnails and previews for newly created SVG->PNG Dir
        self.status_messages_to_GUI("SVG->IBP Complete")
        time.sleep(0.7);
        # This is done in iboxwebgui.js -> showConvert_SVG -> after calling this module.
        self.status_messages_State_General('Generate_Model_Images');

        self.beep(8)
        
    def load_JSON_System_Data(self):
        global strConfig_File_Name
        global strSystem_File_Name
        global strConfig_File_PathAndName
        global strPrint_File_SVG
        global iJSON_System_File_Load_Counter
        global iHardware_Version_Major
        global iHardware_Version_Minor
        global bStepper_Drive_ULN2003
        global bUse_Endstop
        global bPrinting_Option_Direct_Print_With_Z_Homing

        global iPrint_Counter
        global iPrint_Time
        global iPrint_UV_Time
        global iLoad_Counter_Python
        global bSoundEnabled
        
        "Load data from the mysystem.json file"
        #json_data=open('json_data')
        iJSON_System_File_Load_Counter = iJSON_System_File_Load_Counter + 1;
        print(">->load_JSON_System_Data: [" ,strRoot_Path + strSystem_File_Name,"] CNT=",iJSON_System_File_Load_Counter); 
    
        #We need to trap exceptions here; there is a chance that Node.js is accessing this .json right now and thus causing a blank json or failed I/O
        try:
            with open(strRoot_Path + strSystem_File_Name) as data_file:    
                data = json.load(data_file)
        except:
            print("File I/O ERROR ==== Trying to open System. => Abort Function")
            return;
            
        #Example: {"maps":[{"id":"blabla","iscategorical":"0"},{"id":"blabla","iscategorical":"0"}],"masks":{"id":"valore"},"om_points":"value","parameters":{"id":"valore"}}
        #data["maps"][0]["id"]  # will return 'blabla'
        #data["masks"]["id"]    # will return 'valore'
        #data["om_points"]      # will return 'value'  
        
        #we need the data matching Selected_Config_File from mysystem.json
        #print("data[Selected_Config_File]=",data["Selected_Config_File"])
        strConfig_File_Name = data["Selected_Config_File"] + ".json";
        strConfig_File_PathAndName = strRoot_Path + "print_config_files/" + strConfig_File_Name;
        print("strConfig_File_PathAndName=",strConfig_File_PathAndName);
        
        iHardware_Version_Major = int(data["Hardware_Version_Major"])
        iHardware_Version_Minor = int(data["Hardware_Version_Minor"])
        if(iHardware_Version_Major == 1 and iHardware_Version_Minor == 0):
            bStepper_Drive_ULN2003 = False;
        else:
            bStepper_Drive_ULN2003 = True;
            
        print("Hardware Version: ",iHardware_Version_Major,".",iHardware_Version_Minor," ULN2003=",bStepper_Drive_ULN2003)
        
        bUse_Endstop = data["bUse_Endstop"];
        bPrinting_Option_Direct_Print_With_Z_Homing = data["bPrinting_Option_Direct_Print_With_Z_Homing"]; #1=dont zero Z before printing : 0=Zero Z Before printing
        print("bPrinting_Option_Direct_Print_With_Z_Homing=",bPrinting_Option_Direct_Print_With_Z_Homing, " bUse_Endstop=",bUse_Endstop)
        
        #Load last file printed
        strPrint_File_SVG = data["lastFileName_FullPath"];
        print("data[lastFileName_FullPath]=[" , data["lastFileName_FullPath"],"]");

        # 3/15/2015 TRC adding Print time, UV Time, Python Loads etc
        iPrint_Counter = int(data["Print_Counter"])
        iPrint_Time = int(data["Print_Time"])
        iPrint_UV_Time = int(data["Print_UV_Time"])
        iLoad_Counter_Python = int(data["Load_Counter_Python"])

        bSoundEnabled = data["bSoundEnabled"]
        #print('bSoundEnabled=[' + )

        iLoad_Counter_Python = iLoad_Counter_Python + 1; # we just loaded ;)
        #Going to have Node.js save these params. by sending them to Node.js using self.status_messages_to_JSON(JSON_Name,JSON_Value)
        
        data_file.close()
        
        
        
    def load_JSON_Config_Data(self):   #########  CONFIG DATA #########
        global strConfig_File_Name
        global strSystem_File_Name
        global strConfig_File_PathAndName
        #Params
        global iGlobal_Z_Height_Peel_Stage_1
        global iGlobal_Z_Height_Peel_Stage_2
        global iSteps_Per_100_Microns
        global iGlobal_Z_Layer_Thickness
        global iGlobal_Z_Height_Position_For_Print
        global iExposure_Time
        global iExposure_Time_First_Layer
        global intNumber_Of_Base_Layers
        global fExposure_Power_mA
        global iGlobal_Z_Manual_Button_Speed_Up_Slow
        global iGlobal_Z_Manual_Button_Speed_Down_Slow
        global iGlobal_Z_Manual_Button_Speed_Up_Fast
        global iGlobal_Z_Manual_Button_Speed_Down_Fast
        global fDelay_Between_Rapid_Z_Botton_Events
        global bStepper_Acceleration_Enabled
        global bStepper_Deceleration_Enabled
        global iGlobal_Z_Stepper_Acceleration_Percentage_Per_Step
        global iGlobal_Z_Stepper_Acceleration_Steps
        global fGlobal_Stepper_Max_Pulse_Delay
        global fGlobal_Speed_Peel
        global fGlobal_Speed_Down_Fast
        global fGlobal_Speed_Up_Fast
        global fGlobal_Speed_Down_Slow
        global fGlobal_Speed_Up_Slow
        global fGlobal_Speed_Down_Print
        global fGlobal_Speed_Up_Print
        global iPixel_Over_LED_Mode
        global iOEM_Calibrated_UV_LED_PWM
        global iLCD_Contrast
        global iGlobal_Z_Height_Retract
        global iOne_Layer_Of_Steps

        #Get current Config file name:
        self.load_JSON_System_Data();
        
        "Load data from the mysystem.json file"
        #json_data=open('json_data')
    
        try:
            with open(strConfig_File_PathAndName) as data_file:    
                data = json.load(data_file)
        except:
            print("EXCEPYION : File Not Found : [" + strConfig_File_PathAndName + "]")
            self.status_messages_to_GUI_3("ERROR : File Not Found: " + strConfig_File_PathAndName)
            return;
            
        #Example: {"maps":[{"id":"blabla","iscategorical":"0"},{"id":"blabla","iscategorical":"0"}],"masks":{"id":"valore"},"om_points":"value","parameters":{"id":"valore"}}
        #data["maps"][0]["id"]  # will return 'blabla'
        #data["masks"]["id"]    # will return 'valore'
        #data["om_points"]      # will return 'value'  
        
        #ToDo : If a new parameter is added to the software that is stored in the config.json file, and it is not in the json file being read, it is added with the default values. Right now it just crashes because the value DNE.
        #In json + python, to check to see if a key is in a dectionary use the term "in". i.e. if 'variable_name' in dict
        
        #we need the data  from_Config_File : i.e. default.json
        config_name = data["config_name"]
        config_description = data["config_description"]
        
        iGlobal_Z_Height_Peel_Stage_1 = int(data["iGlobal_Z_Height_Peel_Stage_1"])
        iGlobal_Z_Height_Peel_Stage_2 = int(data["iGlobal_Z_Height_Peel_Stage_2"])

        iGlobal_Z_Layer_Thickness = int(data["iGlobal_Z_Layer_Thickness"])
        iSteps_Per_100_Microns = int(data["iSteps_Per_100_Microns"])
        iOne_Layer_Of_Steps = (iGlobal_Z_Layer_Thickness * iSteps_Per_100_Microns) / 100;

        
        iGlobal_Z_Height_Position_For_Print = int(data["iGlobal_Z_Height_Position_For_Print"])
        
        iExposure_Time = float(data["iExposure_Time"])
        iExposure_Time_First_Layer = float(data["iExposure_Time_First_Layer"])
        intNumber_Of_Base_Layers = int(data["intNumber_Of_Base_Layers"])
        fExposure_Power_mA = float(data["fExposure_Power_mA"])
        
        if 'iPixel_Over_LED_Mode' in data:
            iPixel_Over_LED_Mode = int(data["iPixel_Over_LED_Mode"]); #0=Off : 1=Under_Pixel_Only_Full_Power : 2=Under_Px_Only_QACalibrated_Pwr : 3=Under_Px_Pnly_Equalized_Pwr : 4=Adjacent_Pix_Also_QA_Cal_Pwr  : 5=Adjacent_Pix_Full_Power
            print("iPixel_Over_LED_Mode=",iPixel_Over_LED_Mode)
        else:
            print("ERROR ::: iPixel_Over_LED_Mode not in config.json");
            
        if 'iOEM_Calibrated_UV_LED_PWM' in data:
            strOEM_Calibrated_UV_LED_PWM = data["iOEM_Calibrated_UV_LED_PWM"]; #0=Off : 1=Under_Pixel_Only_Full_Power : 2=Under_Px_Only_QACalibrated_Pwr : 3=Under_Px_Pnly_Equalized_Pwr : 4=Adjacent_Pix_Also_QA_Cal_Pwr : 5=Adjacent_Pix_Full_Power
            print("strOEM_Calibrated_UV_LED_PWM=",strOEM_Calibrated_UV_LED_PWM)
            strReplacedCommasWithSpaces_No_Spaces = strOEM_Calibrated_UV_LED_PWM.replace(" ", ""); 
            #Remove Commas and replace them with spaces because .split needs spaces.
            strReplacedCommasWithSpaces = strReplacedCommasWithSpaces_No_Spaces.replace(",", " ")
            #strReplacedCommasWithSpaces = strOEM_Calibrated_UV_LED_PWM.replace(",", " "); 
            print("strReplacedCommasWithSpaces=",strReplacedCommasWithSpaces)
            iOEM_Calibrated_UV_LED_PWM = [ int(x) for x in strReplacedCommasWithSpaces.split(' ') ]
            #iOEM_Calibrated_UV_LED_PWM = map(int, strReplacedCommasWithSpaces.split());
            print("iOEM_Calibrated_UV_LED_PWM=",iOEM_Calibrated_UV_LED_PWM)
        else:
            print("ERROR ::: iOEM_Calibrated_UV_LED_PWM not in config.json");
        #Convert iOEM_Calibrated_UV_LED_PWM list to [ aryLED_Brightness_Chip_1 + aryLED_Brightness_Chip_2 ] using tables [aryLED_To_LED1642_Output_Chip1 + aryLED_To_LED1642_Output_Chip2] 
        #1. Convert string to list -> done above
        #2. Shift from LED 0-27 to LED1642_Port_Lists
        for i in range(16):
            aryLED_Brightness_Chip_1[i] = iOEM_Calibrated_UV_LED_PWM[aryLED_To_LED1642_Output_Chip1[i]-1] #iOEM_Calibrated_UV_LED_PWM is base 0, so LED 28 = 27 and LED1 = 0
            aryLED_Brightness_Chip_2[i] = iOEM_Calibrated_UV_LED_PWM[aryLED_To_LED1642_Output_Chip2[i]-1]
            print("i=",i," aryLED_To_LED1642_Output_Chip1[",i,"]= LED#:",aryLED_To_LED1642_Output_Chip1[i]," with value=[",aryLED_Brightness_Chip_1[i],"]")
            print("-i=",i," aryLED_To_LED1642_Output_Chip2[",i,"]= LED#:",aryLED_To_LED1642_Output_Chip2[i]," with value=[",aryLED_Brightness_Chip_2[i],"]")

        
        aryLED_Brightness_Chip_2[15] = 0   #Turn OFF White LEDs
        aryLED_Brightness_Chip_1[15] = 0   #Turn OFF White LEDs
        print("aryLED_Brightness_Chip_1=",aryLED_Brightness_Chip_1)
        print("aryLED_Brightness_Chip_2=",aryLED_Brightness_Chip_2)
        
        iGlobal_Z_Manual_Button_Speed_Up_Slow = int(data["iGlobal_Z_Manual_Button_Speed_Up_Slow"])
        iGlobal_Z_Manual_Button_Speed_Down_Slow = int(data["iGlobal_Z_Manual_Button_Speed_Down_Slow"])
        iGlobal_Z_Manual_Button_Speed_Up_Fast = int(data["iGlobal_Z_Manual_Button_Speed_Up_Fast"])
        iGlobal_Z_Manual_Button_Speed_Down_Fast = int(data["iGlobal_Z_Manual_Button_Speed_Down_Fast"])
        fDelay_Between_Rapid_Z_Botton_Events = float(data["fDelay_Between_Rapid_Z_Botton_Events"])
        
        bStepper_Acceleration_Enabled = data["bStepper_Acceleration_Enabled"]
        bStepper_Deceleration_Enabled = data["bStepper_Deceleration_Enabled"]
        iGlobal_Z_Stepper_Acceleration_Percentage_Per_Step = int(data["iGlobal_Z_Stepper_Acceleration_Percentage_Per_Step"])
        iGlobal_Z_Stepper_Acceleration_Steps = int(data["iGlobal_Z_Stepper_Acceleration_Steps"])
        fGlobal_Stepper_Max_Pulse_Delay = float(data["fGlobal_Stepper_Max_Pulse_Delay"])
        
        fGlobal_Speed_Peel = float(data["fGlobal_Speed_Peel"])
        fGlobal_Speed_Down_Fast = float(data["fGlobal_Speed_Down_Fast"])
        fGlobal_Speed_Up_Fast = float(data["fGlobal_Speed_Up_Fast"])
        fGlobal_Speed_Down_Slow = float(data["fGlobal_Speed_Down_Slow"])
        fGlobal_Speed_Up_Slow = float(data["fGlobal_Speed_Up_Slow"])
        fGlobal_Speed_Down_Print = float(data["fGlobal_Speed_Down_Print"])
        fGlobal_Speed_Up_Print = float(data["fGlobal_Speed_Up_Print"])

        iLCD_Contrast = int(data["iLCD_Contrast"])
        iGlobal_Z_Height_Retract = int(data["iGlobal_Z_Height_Retract"])
        
        #Verify current is within bounds
        if fExposure_Power_mA > 22.0:
            print("fExposure_Power_mA was above supported maximum current and has been limited");
            fExposure_Power_mA = 22.0; 

        print("config_name=",config_name);
        print("config_description=",config_description);
        print("iGlobal_Z_Height_Peel_Stage_1=",iGlobal_Z_Height_Peel_Stage_1);
        print("iGlobal_Z_Height_Peel_Stage_2=",iGlobal_Z_Height_Peel_Stage_2);
        print("iSteps_Per_100_Microns=",iSteps_Per_100_Microns);
        print("iExposure_Time=",iExposure_Time);
        print("iExposure_Time_First_Layer=",iExposure_Time_First_Layer);
        print("fExposure_Power_mA=",fExposure_Power_mA);
        print("iLCD_Contrast=",iLCD_Contrast)
        print("iGlobal_Z_Height_Retract=",iGlobal_Z_Height_Retract)
        
        data_file.close()
        
        #Init UV LED1642 Controllers : Moved here from system Init because we need to know the Power setting before we init.
        self.SPI_LED1642_Init();
        
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
            for i in range(16): #0-15
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
        
    def SPI_LED1642_Register_Configuration_Read(self):
        print("Configuration Register for LED1642");
        #Latch Switch
        GPIO.output(gpio_spi_sdi, SPI_OFF); 
        time.sleep(0.0001);
        for i in range(16): #0-15
            #print(i)
            
            if(i == 8):
                GPIO.output(gpio_spi_le, SPI_ON);
                time.sleep(0.00001);
                
            #if(i == 9):
            #    GPIO.output(gpio_spi_sdi, SPI_ON); #led full power
            
            GPIO.output(gpio_spi_clk, SPI_ON);
            time.sleep(0.0001); #Delay UP Settle "__|"
            
            #GPIO.output(gpio_spi_sdi, SPI_OFF); #leave this on the full 16 for 0xFF
            GPIO.output(gpio_spi_clk, SPI_OFF);

            time.sleep(0.0001); #Delay DOWN Settle "|__"
            
        GPIO.output(gpio_spi_le, SPI_OFF);
        GPIO.output(gpio_spi_sdi, SPI_OFF); 
        
    def SPI_LED1642_Init(self):
        print("Init LED1642");
        #Set Power
        # ! Must run twice, once for each Chip !
        #3=7.82mA/led per notes in testing from 12/17/14
        #4=9.92mA/led per notes in testing from 12/17/14
        #5=16.25mA/led per notes in testing from 12/17/14
        self.SPI_LED1642_Register_Configuration(fExposure_Power_mA); 

        
        #Set Brightness
        self.SPI_LED1642_Register_Brightness(SPI_ON);
        
        #Set Switch
        # ! Must run twice, once for each Chip !
        #do this when you turn on the UV LEDs
        
        #Start a MHz clock on GPIO4 (pin7) aka GCLK
        #Moved to before RPi.GPIO init to try and solve the issue where button GPIO interrupts stop working when I enable the 2.4MHz clock on GPIO 4 via wiringPis GPIO command.
        #self.SPI_LED1642_Set_Clock_On_GPIO4(2400000)
        
        
    def SPI_LED1642_UV_LEDs(self, State_LED):
        print("SPI_LED1642_UV_LEDs :: State_LED=",State_LED);
        # ! Must run twice, once for each Chip !
        self.SPI_LED1642_Register_Switch(State_LED);

    
# main function

def main(): 
  "Main Loop"
  global read_list
  iCounter_Line = 0;  
    
  print("main loop started @ iBoxPrintManager.py");

  
  sys.stdout.flush()

  #Set Vars
  bPrinting_Pause = 0;
    
    
  pm = cPM()
  
  #pm.beep(2)
  #time.sleep(0.2)
  #pm.beep(2)
  #time.sleep(0.2)
  pm.beep(1)
  
  #Send message to GUI letting them know we are 
  pm.status_messages_to_GUI("Nano Initializing...")
  pm.status_messages_State_Boot("Initializing")

  #was load splash screen location


  #Setup things inported from drlprintmanager
  #Setup Callbacks:
  #GPIO.add_event_detect(gpio_stepper_pin_button_up, GPIO.FALLING, callback=pm.buttonEventHandler_up, bouncetime=100) 
  GPIO.add_event_detect(gpio_stepper_pin_button_up, GPIO.BOTH, callback=pm.buttonEventHandler_up, bouncetime=50) 
  GPIO.add_event_detect(gpio_stepper_pin_button_down, GPIO.BOTH, callback=pm.buttonEventHandler_down, bouncetime=50) 
  #  re-enable for Beta2 with new PCB 
  GPIO.add_event_detect(gpio_stepper_pin_button_print, GPIO.BOTH, callback=pm.buttonEventHandler_print, bouncetime=70) 
  GPIO.add_event_detect(gpio_stepper_pin_button_endstop, GPIO.BOTH, callback=pm.buttonEventHandler_endstop_rising_or_falling, bouncetime=50) 
  #cant set two events for one GPIO >> use BOTH? GPIO.add_event_detect(gpio_stepper_pin_button_endstop, GPIO.FALLING, callback=pm.buttonEventHandler_endstop_falling, bouncetime=100)   

  print("__main__ Loaded <<<  READY >>>");
  
  #Load system data
  #pm.load_JSON_System_Data(); #Called from load_JSON_Config_Data
  pm.load_JSON_Config_Data();
  
  #Send message to GUI letting them know we are 
  pm.status_messages_to_GUI("Nano Ready")
  pm.status_messages_State_Boot("Ready")

  if bVideo_Output_NTSC:
    #Load Splash Screen:
    pm.load_splash_screen()
    time.sleep(0.2);

  if bVideo_Output_Digole_128x64:
    #pm.digole_serial_128x64_display_initialize()
    #pm.lcd_init() #This clears screen
    #Load Splash Screen
    pm.load_splash_screen()
    time.sleep(0.1);
  
  pm.beep(3);
  e = threading.Event() #12/4/14
  # loop
  #//  NEW StdIO Non Blocking code Added 9/26/2014 from : http://repolinux.wordpress.com/2012/10/09/non-blocking-read-from-stdin-in-python/ //                                                                                                                    
  # while still waiting for input on at least one file
  try: #12/4/14
      while read_list:
        ready = select.select(read_list, [], [], timeout)[0]
        if not ready:
          pm.idle_work()
        else:
          for file in ready:
            line = file.readline()
            if line:
                iCounter_Line = iCounter_Line + 1
                print("Line Rx #:",iCounter_Line," Data:",line)
                sys.stdout.flush()
            if not line: # EOF, remove file from input list
              read_list.remove(file)
            elif line.rstrip(): # optional: skipping empty lines
              pm.treat_input(line)
  except KeyboardInterrupt:
    #e.set() #set the flag that will kill the thread when it has finished
    #Set GPIOs to not current sinking state
    print("Set IDLE GPIO States");
    if(bStepper_Drive_ULN2003 == False):
        GPIO.output(gpio_stepper_pin_enable, 0)
    else: #ULN2003
        print("ULN2003 Cleanup");
        GPIO.output(gpio_stepper_pin_1, ULN2003_OFF)
        GPIO.output(gpio_stepper_pin_2, ULN2003_OFF)
        GPIO.output(gpio_stepper_pin_3, ULN2003_OFF)
        GPIO.output(gpio_stepper_pin_4, ULN2003_OFF)
    #Turn off LED1642 Chips
    pm.SPI_LED1642_Register_Switch(SPI_OFF)
    
    print('NowExiting...');
    time.sleep(0.2)
    print('NowExiting...end');
    #thread.join() #wait for the thread to finish
    pass
  finally:
    print("Finally...")
    GPIO.cleanup(); 
 
  try:
    #this section is no longer used... move loop code to pm.idle_work
    #DEBUG NEVER INTERRUPT
    return;
    
    if bBlink_LEDs == TRUE:
        print("blinking with return WTF")
        if bPrinting_State_Printing == 0:
          pm.led_internal_red_illumination(NPN_LED_ON);
          time.sleep(0.2)
          pm.led_internal_red_illumination(NPN_LED_OFF);
          time.sleep(0.2)
          pm.led_blue_B1(LED_ON);
          pm.led_button_B_blue(LED_ON); 
          time.sleep(0.2)
          pm.led_blue_B1(LED_OFF); 
          pm.led_button_B_blue(LED_OFF); 
          print(".");
        if bPrinting_State_Printing == 1:
          pm.led_red_B1(LED_ON); 
          time.sleep(0.9)
          pm.led_red_B1(LED_OFF); 
          time.sleep(0.9)
        if bPrinting_State_Waiting_For_Platform_To_Reach_Bottom == 1:
          #Waiting for platform to reach bottom. Blink PRINT light 
          pm.led_blue_B1(LED_ON); 
          time.sleep(0.2)
          pm.led_blue_B1(LED_OFF);  
          time.sleep(0.2)
    main_loop()
  except KeyboardInterrupt:
    e.set() #set the flag that will kill the thread when it has finished
    print('Exiting...');
    thread.join() #wait for the thread to finish
    pass
  finally:
    GPIO.cleanup();  


    


if __name__=="__main__": 
    main()
