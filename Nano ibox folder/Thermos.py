# -*- coding: utf-8 -*-

##################################################################################
#                                                                                #
#                Raspi Nest :- Raspberry PI Learning Thermostat                     #
#                Written by : Matt Inglis                                                                #
#                Version : 0.1 Pre Release                                       #
#                                                                                #
#                This code is issued for personal use only, no commercial use of this code is allowed without prior conset      #
##################################################################################
#                                                             #
#    This program is free software: you can redistribute it and/or modify        #
#    it under the terms of the GNU General Public License as published by        #
#    the Free Software Foundation, either version 3 of the License, or           #
#    (at your option) any later version.                                         #
#                                                                                #
#    This program is distributed in the hope that it will be useful,             #
#    but WITHOUT ANY WARRANTY; without even the implied warranty of              #
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the               #
#    GNU General Public License for more details.                                #
#                                                                                #
#    You should have received a copy of the GNU General Public License           #
#   along with this program.  If not, see <http://www.gnu.org/licenses/>         #
#                                                                                #
##################################################################################

from __future__ import division
import pygame
import time
import math 
import os
import datetime as DT
from datetime import datetime 
from pygame.locals import *
import Adafruit_DHT
import sys
import subprocess 
from time import sleep
import RPi.GPIO as GPIO
import pyodbc
from threading import Thread
from os.path import exists

interface = "wlan0"
os.putenv('SDL_VIDEODRIVER','fbcon') 
os.putenv('SDL_FBDEV','/dev/fb1')
os.putenv('SDL_MOUSEDRV','TSLIB') 
os.putenv('SDL_MOUSEDEV','/dev/input/touchscreen')
class pitft :
    screen = None;
    colourBlack = (0, 0, 0)
 
    def __init__(self):
        "Ininitializes a new pygame screen using the framebuffer"
        # Based on "Python GUI in Linux frame buffer" 
        # http://www.karoltomala.com/blog/?p=679
        disp_no = os.getenv("DISPLAY")
        if disp_no:
            print "I'm running under X display = {0}".format(disp_no)
 
        os.putenv('SDL_FBDEV', '/dev/fb1')
 
        # Select frame buffer driver Make sure that SDL_VIDEODRIVER is 
        # set
        driver = 'fbcon'
        if not os.getenv('SDL_VIDEODRIVER'):
            os.putenv('SDL_VIDEODRIVER', driver)
        try:
            pygame.display.init()
        except pygame.error:
            print 'Driver: {0} failed.'.format(driver)
            exit(0)
 
        size = (pygame.display.Info().current_w, pygame.display.Info().current_h)
        self.screen = pygame.display.set_mode(size, pygame.FULLSCREEN)
        # Clear the screen to start
        self.screen.fill((0, 0, 0))
        # Initialise font support
        pygame.font.init()
        # Render the screen
        pygame.display.update()
 
    def __del__(self):
        "Destructor to make sure pygame shuts down, etc."

def setupBacklight():
   backlightpath = "/sys/class/gpio/gpio252"
   if not exists(backlightpath):
      try:
         with open("/sys/class/gpio/export","w") as bfile:
            bfile.write("252")
      except:
         return False
   try:
      with open("/sys/class/gpio/gpio252/direction","w") as bfile:
         bfile.write("out")
   except:
      return False
   return True

def Backlight(light):
   try:
      with open("/sys/class/gpio/gpio252/value","w") as bfile:
         bfile.write("%d" % (bool(light)))
   except:
      pass

 
# Create an instance of the PyScope class
mytft = pitft()
class ScreenMode: Home, Control, HomeChange = range(3)
 
screen = pygame.display.set_mode((320,240),pygame.FULLSCREEN)
background = pygame.Surface(screen.get_size())
background = background.convert() 
background.fill(pygame.Color("black"))
screen.blit(background, (0,0)) 
pygame.display.flip()
MaxTemp = 30
MinTemp = 0
CurrentTemp = 0 
DesiredTemp = 30
CurrentHumid = 0
CurrentWIFI = 0
HeatingOn = False 
HotWaterOn = False
LastMovement = datetime.now()
LastCheck = datetime.now() - DT.timedelta(days=2)
LastChange = datetime.now()
CurrentScreen = ScreenMode.Home
running = True
MorningOn = DT.time(0,0)
MorningOff = DT.time(0,0)
AfternoonOn = DT.time(0,0)
AfternoonOff = DT.time(0,0)
WeekendOn = DT.time(0,0)
WeekendOff = DT.time(0,0)
WeekendAftOn = DT.time(0,0)
WeekendAftOff = DT.time(0,0)
HeatingChangeTime = DT.time(0,0)
HeatingAdvanceTime = DT.time(0,0)
HeatingAlwaysOn = False
TempVariance = 0.5
HeatingAdvance = False
TempDesiredManual = False

def DrawGauge(Change):
   global MaxTemp
   global MinTemp
   global CurrentTemp
   global DesiredTemp
   global CurrentHumid
   global CurrentWIFI
   global LastMovement
   temp_range = MaxTemp - MinTemp
   if(DesiredTemp > MaxTemp):
      DesiredTemp = MaxTemp
   if(DesiredTemp < MinTemp):
      DesiredTemp = MinTemp
   #print "Temp : "+`Temp`
   temp_perc = CurrentTemp / MaxTemp
   #print "Temp : "+`Temp`+" MaxTemp : "+`MaxTemp` print "Temp Per 
   #: "+`temp_perc`
   gauge_move = 270 * temp_perc
   #print "Gauge Move : "+`gauge_move`
   surface = pygame.Surface((300,200))
   pygame.draw.arc(surface,(94,94,94),(0,0,200,200),math.radians(0),math.radians(270),5)
   if(DesiredTemp == CurrentTemp):
      pygame.draw.arc(surface,(209,255,214),(0,0,200,200),math.radians(0),math.radians(gauge_move),5)
   else:
      des_temp_perc = DesiredTemp / MaxTemp
      des_gauge_move = 270 * des_temp_perc
      pygame.draw.arc(surface,(250,160,160),(0,0,200,200),math.radians(0),math.radians(des_gauge_move),5)
      pygame.draw.arc(surface,(255,244,244),(0,0,200,200),math.radians(0),math.radians(gauge_move),5)
   surface = pygame.transform.rotate(surface,-42)
   surface = pygame.transform.flip(surface,True,False)
   
   smallerfont = pygame.font.Font(None,25)
   
   if not Change:
      MovementDelta = LastMovement + DT.timedelta(0,60)
      if(datetime.now() < MovementDelta):
         pygame.draw.circle(surface,(255,255,255),(70,55),12,0)
         lettertext = smallerfont.render("M",1,(0,0,0))
      else:
         pygame.draw.circle(surface,(255,255,255),(70,55),12,1)
         lettertext = smallerfont.render("M",1,(255,255,255))
      surface.blit(lettertext,(63,47))
      if(HeatingOn):
         pygame.draw.circle(surface,(255,255,255),(70,200),12,0)
         lettertext = smallerfont.render("H",1,(0,0,0))
      else:
         pygame.draw.circle(surface,(255,255,255),(70,200),12,1)
         lettertext = smallerfont.render("H",1,(255,255,255))
      surface.blit(lettertext,(64,192))
      if(HotWaterOn):
         pygame.draw.circle(surface,(255,255,255),(70,240),12,0)
         lettertext = smallerfont.render("W",1,(0,0,0))
      else:
         pygame.draw.circle(surface,(255,255,255),(70,240),12,1)
         lettertext = smallerfont.render("W",1,(255,255,255))
      surface.blit(lettertext,(62,232))
      if(CurrentWIFI > 0):
         FirstColor = (255,255,255)
      else:
         FirstColor = (117,117,117)
      pygame.draw.line(surface, FirstColor, (55,140), (55, 135), 3)
      if(CurrentWIFI > 25):
         FirstColor = (255,255,255)
      else:
         FirstColor = (117,117,117)
      pygame.draw.line(surface, FirstColor, (62,140), (62, 130), 3)
      if(CurrentWIFI > 50):
         FirstColor = (255,255,255)
      else:
         FirstColor = (117,117,117)
      pygame.draw.line(surface, FirstColor, (69,140), (69, 125), 3)
      if(CurrentWIFI > 75):
         FirstColor = (255,255,255)
      else:
         FirstColor = (117,117,117)
      pygame.draw.line(surface, FirstColor, (76,140), (76, 120), 3)
   
   else:
      smallerfont = pygame.font.Font(None,45)
      pygame.draw.circle(surface,(255,255,255),(70,125),12,0)
      lettertext = smallerfont.render("-",1,(0,0,0))
      surface.blit(lettertext,(65,110))
      pygame.draw.circle(surface,(255,255,255),(340,125),12,0)
      lettertext = smallerfont.render("+",1,(0,0,0))
      surface.blit(lettertext,(332,109))
      smallerfont = pygame.font.Font(None,30)
      ChangedText = smallerfont.render("Desired",1,(255,0,0))
      surface.blit(ChangedText,(174,80))
   largefont = pygame.font.Font(None, 75)
   Spacer = ""
   if(DesiredTemp < 10):
      Spacer = " "
   else:
      Spacer = ""
   if(DesiredTemp == CurrentTemp):
      if(Change):
         TempTmp = DesiredTemp
         PrintColor = (255,0,0)
      else:
         TempTmp = CurrentTemp
         PrintColor = (255,255,255)
      if(TempTmp < 0):
         largetext = largefont.render("-- °",1,PrintColor)
      else: 
         largetext = largefont.render(Spacer+`int(TempTmp)`+"°",1,PrintColor)
   else:
      if(Change):
         TempTmp = DesiredTemp
         PrintColor = (255,0,0)
      else:
         TempTmp = CurrentTemp
         PrintColor = (255,255,255)
      if(TempTmp < 1):
         largetext = largefont.render("-- °",1,PrintColor)
      else:
         largetext =largefont.render(Spacer+`int(TempTmp)`+"°",1,PrintColor)
   surface.blit(largetext,(180,110))
   d = datetime.now()
   datestring = d.strftime("%d/%m/%Y")
   timestring = d.strftime("%I:%M %p")
   smallerfont = pygame.font.Font(None,25)
   if(CurrentHumid < 10):
      Spacer = " "
   else:
      Spacer = ""
   SmallerText = smallerfont.render(Spacer+`int(CurrentHumid)`+" %",1,(255,255,255))
   surface.blit(SmallerText,(195,170))
   SmallerText = smallerfont.render(datestring,1,(255,255,255))
   surface.blit(SmallerText,(170,200))
   SmallerText = smallerfont.render(timestring,1,(255,255,255))
   surface.blit(SmallerText,(175,220))
   return surface 


def DrawScreen(JustChanged):
   global background
   global CurrentScreen
   global CurrentTemp
   global DesiredTemp
   global ScreenMode
   global screen
   global HeatingAlwaysOn
   mainsurface = pygame.Surface((650,650))
   smallfont = pygame.font.Font(None, 50)
   #print "Current : "+`CurrentScreen`
   if(CurrentScreen == ScreenMode.Home):
      SmallMessage = "Home"
      SmallText = smallfont.render(SmallMessage,1, (255,0,0))
      #background.blit(SmallText,(10,445))
      screen.blit(background, (0,0))
      mainsurface.blit(DrawGauge(False),(-40,-20))
      mainsurface.blit(SmallText,(355,395))
   if(CurrentScreen == ScreenMode.HomeChange):
      mainsurface.blit(DrawGauge(True),(-40,-20))
   elif(CurrentScreen == ScreenMode.Control):
      SmallMessage = "Advance"
      SmallText = smallfont.render(SmallMessage,1, (255,255,255))
      mainsurface.blit(SmallText,(90,5))
      if(HeatingOn):
         pygame.draw.circle(mainsurface,(255,255,255),(60,95),20,0)
         lettertext = smallfont.render("H",1,(0,0,0))
         mainsurface.blit(lettertext,(48,80))
         lettertext = smallfont.render("HEATING",1,(255,255,255))
         mainsurface.blit(lettertext,(90,80))
      else:
         pygame.draw.circle(mainsurface,(255,255,255),(60,95),20,2)
         lettertext = smallfont.render("H",1,(255,255,255))
         mainsurface.blit(lettertext,(48,80))
         lettertext = smallfont.render("HEATING",1,(255,255,255))
         mainsurface.blit(lettertext,(90,80))
      if(HotWaterOn):
         pygame.draw.circle(mainsurface,(255,255,255),(60,165),20,0)
         lettertext = smallfont.render("W",1,(0,0,0))
         mainsurface.blit(lettertext,(45,150))
         lettertext = smallfont.render("HOT WATER",1,(255,255,255))
         mainsurface.blit(lettertext,(90,150))
      else:
         pygame.draw.circle(mainsurface,(255,255,255),(60,165),20,2)
         lettertext = smallfont.render("W",1,(255,255,255))
         mainsurface.blit(lettertext,(45,150))
         lettertext = smallfont.render("HOT WATER",1,(255,255,255))
         mainsurface.blit(lettertext,(90,150))
   
   #background.fill(pygame.Color("black")) smallerfont = 
   #pygame.font.Font(None,30) SmallerText = 
   #smallerfont.render("Heating Hot Water",1,(255,0,0)) 
   #mainsurface.blit(SmallerText,(305,435))
   screen.blit(mainsurface,(0,0))
   pygame.display.flip()
   JustChanged = False
   
def Sensor(threadname, *args):
   global running
   global GPIO
   global LastMovement
   global CurrentTemp
   global CurrentHumid
   global CurrentWIFI
   global MorningOn
   global MorningOff
   global AfternoonOn
   global AfternoonOff
   global WeekendOn
   global WeekendOff
   global WeekendAftOn
   global WeekendAftOff
   global HeatingOn
   global TempVariance
   global HeatingChangeTime
   global HeatingAdvanceTime
   global HeatingAlwaysOn
   global HeatingAdvance

   counter = 0
   
   GPIO.setmode(GPIO.BCM)
   GPIO.setup(17, GPIO.IN)
   DHT_TYPE = Adafruit_DHT.DHT22
   while running:

      if(counter > 30):
         try:
            humidity, temp = Adafruit_DHT.read(DHT_TYPE, 23)
         except:
            print "SENSOR READ ERROR!"
         if humidity is not None or temp is not None:
            CurrentTemp = temp - 1.0
            CurrentHumid = humidity
            #print 'Temperature : {0:0.1f} C'.format(temp)
            #print 'Humidity : {0:0.1f} %'.format(humidity)
      if GPIO.input(17):
         #print ("Movement")
         LastMovement = datetime.now()
      if(counter>60):
         try:
            proc = subprocess.Popen(["iwlist", interface, "scan"],stdout=subprocess.PIPE, universal_newlines=True)
            out, err = proc.communicate()
            WIFI = 0
            for line in out.split("\n"):
               if("Quality=" in line):
                  line = line.replace("Quality=","")
                  quality = line.split()[0].split('/')
                  WIFI = int(round(float(quality[0]) / float(quality[1]) * 100))
                  CurrentWIFI = WIFI
                  #print "WIFI : "+`WIFI`+" %"
         except:
            print "WIFI READOUT ERROR!"
      if(counter>60):
         counter = 0
      else:
         counter = counter+1
      
      #
      if(CurrentTemp > 0):
         try:
         #if(CurrentTemp > 1):
            CurrentTime = DT.datetime.now()
            MorningOnTime = CurrentTime.replace(hour=MorningOn.hour,minute=MorningOn.minute,second=MorningOn.second)
            MorningOffTime = CurrentTime.replace(hour=MorningOff.hour,minute=MorningOff.minute,second=MorningOff.second)
            AfternoonOnTime = CurrentTime.replace(hour=AfternoonOn.hour, minute=AfternoonOn.minute, second=AfternoonOn.second)
            AfternoonOffTime = CurrentTime.replace(hour=AfternoonOff.hour, minute=AfternoonOff.minute, second=AfternoonOff.second)      
            WeekendOnTime = CurrentTime.replace(hour=WeekendOn.hour, minute=WeekendOn.minute, second=WeekendOn.second)
            WeekendOffTime = CurrentTime.replace(hour=WeekendOff.hour, minute =WeekendOff.minute, second=WeekendOff.second)
            WeekendAftOnTime = CurrentTime.replace(hour=WeekendAftOn.hour, minute=WeekendAftOn.minute, second=WeekendAftOn.second)
            WeekendAftOffTime = CurrentTime.replace(hour=WeekendAftOff.hour, minute=WeekendAftOff.minute, second=WeekendAftOff.second)

            MovementDelta = LastMovement + DT.timedelta(0,1800)
            #OnChangeDelta = HeatingChangeTime + DT.timedelta(0,3600)
            if(CurrentTime.isoweekday() in range(1,6)):
               #print "Weekday loop"
               if(CurrentTime > MorningOnTime and CurrentTime < MorningOffTime):
                  #
                  MorningOnDelta = MorningOnTime + DT.timedelta(0,3600)
                  if(CurrentTime < MorningOnDelta):
                     if(CurrentTemp + TempVariance < DesiredTemp):
                        if(HeatingOn == False):
                           HeatingOn = True
                     elif(int(CurrentTemp) >= int(DesiredTemp)):
                        if(HeatingOn == True):
                           HeatingOn = False
                  elif(CurrentTime > MovementDelta):
                     if(HeatingOn == True):
                        HeatingOn = False
                  else:
                     if(CurrentTemp + TempVariance  < DesiredTemp):
                        if(HeatingOn == False):
                           HeatingOn = True
                     elif(int(CurrentTemp) >= int(DesiredTemp)):
                        if(HeatingOn == True):
                           HeatingOn = False
                  #
               elif(CurrentTime > AfternoonOnTime and CurrentTime < AfternoonOffTime):
                  #
                  #print "Afternoon loop"
                  AfternoonOnDelta = AfternoonOnTime + DT.timedelta(0,3600)
                  if(CurrentTime < AfternoonOnDelta):
                     if(CurrentTemp + TempVariance < DesiredTemp):
                        if(HeatingOn == False):
                           HeatingOn = True
                     elif(int(CurrentTemp) >= int(DesiredTemp)):
                        if(HeatingOn == True):
                           HeatingOn = False
                  elif(CurrentTime > MovementDelta):
                     #print "Movement Loop"
                     if(HeatingOn == True):
                        HeatingOn = False
                  else:
                     #print "No Movement"
                     if(CurrentTemp + TempVariance < DesiredTemp):
                        if(HeatingOn == False):
                           HeatingOn = True
                     elif(int(CurrentTemp) >= int(DesiredTemp)):
                        if(HeatingOn == True):
                           HeatingOn = False
               else:
                  if(HeatingOn == True):
                     HeatingOn = False
            #Else its the weekend
            else:
               if(CurrentTime > WeekendOnTime and CurrentTime < WeekendOffTime):
                  #
                  WeekendDelta = WeekendOnTime + DT.timedelta(0,3600)
                  if(CurrentTime < WeekendDelta):
                     if(CurrentTemp + TempVariance < DesiredTemp):
                        if(HeatingOn == False):
                           HeatingOn = True
                     elif(int(CurrentTemp) >= int(DesiredTemp)):
                        if(HeatingOn == True):
                           HeatingOn = False
                  elif(CurrentTime > MovementDelta):
                     if(HeatingOn == True):
                        HeatingOn = False
                  else:
                     if(CurrentTemp+TempVariance < DesiredTemp):
                        if(HeatingOn == False):
                           HeatingOn = True
                     elif(int(CurrentTemp) >= int(DesiredTemp)):
                        if(HeatingOn == True):
                           HeatingOn = False
               elif(CurrentTime > WeekendAftOnTime and CurrentTime < WeekendAftOffTime):
               #   #
                  WeekendAftDelta = WeekendAftOnTime + DT.timedelta(0,3600)
                  if(CurrentTime < WeekendAftDelta):
                     if(CurrentTemp + TempVariance < DesiredTemp):
                        if(HeatingOn == False):
                           HeatingOn = True
                     elif(int(CurrentTemp) >= int(DesiredTemp)):
                        if(HeatingOn == True):
                           HeatingOn = False
                  elif(CurrentTime > MovementDelta):
                     if(HeatingOn == True):
                        HeatingOn = False
                  else:
                     if(CurrentTemp + TempVariance < DesiredTemp):
                        if(HeatingOn == False):
                           HeatingOn = True
                     elif(int(CurrentTemp) >= int(DesiredTemp)):
                        if(HeatingOn == True):
                           HeatingOn = False
               else:
                  if(HeatingOn == True):
                     HeatingOn = False
         except:
            print "Time Calcs Error!" 
      

      if(HeatingAdvance):
         HeatingAdvanceDelta = HeatingAdvanceTime + DT.timedelta(0,1800)
         if(CurrentTime > HeatingAdvanceDelta):
            HeatingAdvance = False
         else:
            HeatingOn = True
      if(HeatingAlwaysOn):
         HeatingOn = True
      
      #   
      time.sleep(1)
   GPIO.cleanup()

def SQLSender(threadname, *args):
   global running
   global CurrentTemp
   global CurrentWIFI
   global CurrentHumid
   global DesiredTemp
   global HeatingOn
   global HotWaterOn
   global LastTemps
   global LastHumids
   global LastHeatings
   global LastCheck
   global MorningOn
   global MorningOff
   global AfternoonOn
   global AfternoonOff
   global TempVariance
   global WeekendOn
   global WeekendOff
   global WeekendAftOn
   global WeekendAftOff
   global HeatingAdvanceTime
   global HeatingAlwaysOn
   global HeatingAdvance
   global HeatingDesiredManual

   firstrun = True
   Heating = 0

   while(running):
      try:
         if(CurrentWIFI > 0):
            dsn = 'sqlserverdatasource'
            user = 'user'
            password = 'password'
            database = 'TDB'
            con_string = 'DSN=%s;UID=%s;PWD=%s;DATABASE=%s;' % (dsn,user,password,database)
                 print "SQL Trying to connect"
            cnxn = pyodbc.connect(con_string)
            cnxn.timeout = 120
            print "SQL Connected"
            cursor = cnxn.cursor()      
            
            if(firstrun):
               firstrun = False
               parameters = []
               parameters.append(datetime.now())
               cursor.execute("UPDATE CONFIGTABLE SET varData=? WHERE varName='LASTBOOT'",parameters)
               cnxn.commit()
            
            cursor.execute("SELECT varData FROM CONFIGTABLE WHERE varName='HEATINGADVANCE'")
            row = cursor.fetchone()
            if row:
               if(int(row[0]) > 0):
                  if(HeatingAdvance == False):
                     HeatingAdvance = True
                     HeatingAdvanceTime = DT.datetime.now()
               else:
                  HeatingAdvance = False
            cursor.execute("SELECT varData FROM CONFIGTABLE WHERE varName='HEATINGALWAYSON'")
            row = cursor.fetchone()
            if row:
               if(int(row[0]) > 0):
                  HeatingAlwaysOn = True
               else:
                  HeatingAlwaysOn = False
            LastCheckDelta = LastCheck + DT.timedelta(hours=2)
            if(datetime.now() > LastCheckDelta):
               if(TempDesiredManual == False):
                  cursor.execute("SELECT varData FROM CONFIGTABLE WHERE varName='DESIREDTEMP'")
                  row = cursor.fetchone()
                  if row:
                     DesiredTemp = int(row[0])
               else:
                  HeatingDesiredManual = False
                  parameters = []
                  parameters.append(DesiredTemp)                  
                  cursor.execute("UPDATE CONFIGTABLE SET varData = ? WHERE varName='DESIREDTEMP'",parameters)
                  cnxn.commit()
               cursor.execute("EXEC calcTimes")
               row = cursor.fetchone()
               if row:
                  MorningOn = row[0]
                  MorningOff = row[1]
                  AfternoonOn = row[2]
                  AfternoonOff = row[3]
                  WeekendOn = row[4]
                  WeekendOff = row[5]
                  WeekendAftOn = row[6]
                  WeekendAftOff = row[7]
                  LastCheck = datetime.now()
                  #print MorningOn
               cursor.execute("SELECT varData FROM CONFIGTABLE WHERE varName='TEMPVARIANCE'")
               row = cursor.fetchone()
               if row:
                  TempVariance = float(row[0])
         
            parameters = []
            parameters.append(datetime.now())
            parameters.append(CurrentWIFI)
            parameters.append(CurrentTemp)
            parameters.append(CurrentHumid)
            MovementDelta = LastMovement + DT.timedelta(0,300)
            if(datetime.now() > MovementDelta):
               parameters.append(0)
            else:
               parameters.append(1)
            parameters.append(DesiredTemp)
            parameters.append(HeatingOn)
            parameters.append(HotWaterOn)
            if(CurrentTemp > 0):
               print "Inserting"
               cursor.execute("INSERT INTO DATATABLE VALUES(?, ?, ?, ?,?,?,?,?)",parameters)
               cnxn.commit()
               print "Complete"

            cursor.execute("SELECT varData FROM CONFIGTABLE WHERE varName = 'REBOOTDEVICE'")
            if row:
               row = cursor.fetchone()
               SQLReboot = int(row[0])
               if(SQLReboot > 0):
                  cursor.execute("UPDATE CONFIGTABLE SET varData='0' WHERE varName='REBOOTDEVICE'")
                  cnxn.commit()
                  comand = "/usr/bin/sudo /sbin/reboot"
                  process = subprocess.Popen(comand.split(), stdout=subprocess.PIPE)
                  output = process.communicate()[0]

            cursor.close()
            cnxn.close()
         
      except:
         print "SQL THREAD ERROR"
      time.sleep((60*5))
   
   
def main(threadname, *args):
   global running
   global CurrentScreen
   global pygame
   global CurrentTemp
   global DesiredTemp
   global CurrentWIFI
   global LastMovement
   global CurrentScreen
   setupBacklight()
   Backlight(False)
   mousedown = False
   DrawScreen(True)
   while running:
      try:
         DrawScreen(False)
         sx,sy=screen.get_size()
         x,y=pygame.mouse.get_pos()
         b=pygame.mouse.get_pressed()
         for evnt in pygame.event.get():
            if evnt.type == pygame.QUIT:
               running = False
            if evnt.type == pygame.KEYDOWN:
               if evnt.key == pygame.K_Q:
                  running = False
            if evnt.type == MOUSEBUTTONDOWN:
               timedown = datetime.now()
               pygame.mouse.get_rel()
            #if(mousedown == False):
            #   initial_x = x
            #   initial_y = y
            #   mousedown = True
            if evnt.type == MOUSEBUTTONUP:
               #if(mousedown):
               #   mousedown = False
               MouseDelta = timedown + DT.timedelta(0,0.5)
            
               swipex, swipey = pygame.mouse.get_rel()
            
               if(abs(swipex) > 150):
                  print "swipex : "+`swipex`
                  if(swipex > 150):
                     print "swiped left"
                     if(CurrentScreen == 0):
                        CurrentScreen = 2
                     else:
                        CurrentScreen = CurrentScreen - 1
                     DrawScreen(True)
                     continue
                  if(swipex < -150):
                     print "swiped right"
                     if(CurrentScreen == 2):
                        CurrentScreen = 0
                     else:
                        CurrentScreen = CurrentScreen + 1
                     DrawScreen(True)
                     continue
               else:
                  if(CurrentScreen == ScreenMode.HomeChange):
                     if(x<150):
                        DesiredTemp = DesiredTemp - 2
                     if(x > (sx-150)):
                        DesiredTemp = DesiredTemp+2
                      DrawScreen(True)
         MovementDelta = LastMovement + DT.timedelta(0,300)
         if(datetime.now() > MovementDelta):
            Backlight(False)
            #print "Backlight Off"
         else:
            Backlight(True)
            #print "Backlight On"
      except:
         print "MAIN THREAD ERROR!"
      time.sleep(0.2)
   Backlight(True)
   time.sleep(10)
   
      
Thread(target=main, args=('Main',1)).start()
#launch the pulse thread
Thread(target=Sensor, args=('Sensor',1)).start()

Thread(target=SQLSender, args=('SQL',1)).start()
