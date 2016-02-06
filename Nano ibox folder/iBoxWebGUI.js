// ============================= ibox ===================================
// Author       : Trent Carter
// Description  : Web GUI for iBox Nano

// Last Updated: 
// 3/11/15 Adding "Browse" Support via extrnal export in browse.js where browse will take the response object so the .js can send data to the client
//  4/17/2015 added Load File Sync for mySystem, myCalibration
//  5/4/2015 addressing Message_JSON in System.json error, 
//  5/14/15 Adding find my nanos
//  5/20-22/2015 Adding many Production release features
//  7/8/15

var ibp_production = require("./ibp_production")
var ibp_browse = require("./ibp_browse")
var ibp_share = require("./ibp_share")
var ibp_help = require("./ibp_help")
var ibp_about = require("./ibp_about")
var ibp_settings = require("./ibp_settings")
var ibp_generate_thumbnails = require("./ibp_generate_thumbnails")
var ibp_manufacturing_and_test = require("./ibp_manufacturing_and_test")
var ibp_create_model = require("./ibp_create_model")
var ibp_friends = require("./ibp_friends")

var execSync = require('exec-sync'); //  4/7/2015 so I can nest a Imagemagick shell loop

//var fcnString = require('string');
//  ///////////////////////
///  Node.js Documentation ::   http://nodejs.org/api/http.html
// /////////////////////////
var strSoftwareVersion = ('0.0'); //  real software vesion populated during the Software Update process and stored in mySystem aka mysystem.json
var strNodeJS_Software_Version_Hard_Coded = "1.2"
var strNodeJS_Software_Version = "0.0"
var strPython_Software_Version = "0.0"
var strSystem_logs_All = "Instead of this, we will just read the log from forever in showSystemLogs. System Logs Started : HC_Ver:" + strNodeJS_Software_Version_Hard_Coded
//  Moved to Beta 4p1 on 9/28/14
//  Added imagemajick to Python as well as parsing SVG files into small svg then converting them to png.
//  9.30.14 => Adding Select File to Print
//  10.22.2014 => working on json config save crash line 229 , 1261
//  12/18/14 Adding fExposure_Power_mA

var port = 80;  //8080

var formidable = require('formidable'); //file uploads + forms are easy with formidable
//var express = require('express'); // TRC 9/25/2014 **would not install , might now that I fixed NPM (9/29/14) installed 10/1/14
//var socket = require('socket.io')
//var mount = st({ path: ss__dirname + '/static', url: '/static' }) //  TRC 9/25/14 a way to handle static files: **Not what I need for image filesvar vvvvvaass
var url = require('url'); //  TRC

var diskspace = require('diskspace'); //  for getting disk space available and used, etc
var strFree_HD = "wait"
var os = require('os');
var bFirst_HomePage_Load = true;
/////////////////////////////// Socket.IO TEST  //////////////////////
////
/*
var express = require("express");
var app = express();
var socket = require('socket.io');
var server = app.listen(4000);
var io = socket.listen(server);
*/

//////////////////////////////////////////////////////////////////////

var bReLaunch_NodeJs_Next_Home_Page_Load = false;
var path = require('path');
var http = require('http');             //the http server
//var sys = require("sys");   //for system calls 
var util = require('util');   //replaces sys

var fs = require('fs'); //moving files

var menu_items = ['home', 'printer', 'files', 'about'];
var command_output = ''; //this will contain output of commands that we're run with runCommand fuction...
var files = []; //array of files uploaded

//we need to just to interface with iBoxPrintManager.py that works perfectly !
var spawn = require('child_process').spawn;

var mimeTypes = {'html': 'text/html', 'png': 'image/png',
    'js': 'text/javascript', 'css': 'text/css'};

// Trents test code to wrap hands around stdin/out in Python //
//var iBoxPrintManager = spawn('python3', ['/usr/share/adafruit/webide/repositories/my-pi-projects/iBox_Nano/iBoxPrintManager.py','']);  //   /home/pi/ibox/pythontest.py','']);
////var iBoxPrintManager = spawn('python3', ['/home/pi/ibox/iBoxPrintManager.py','']); //  2/8/2015 (SRR)CHANGE THIS PATH TO THE .PYC
///var iBoxPrintManager = spawn('python3', ['/home/pi/ibox/iBoxPrintManager.pyc','']); //  2/8/2015 (SRR)CHANGE THIS PATH TO THE .PYC //  moved to end of file on 5/18/15
//  Clean stdio test  (blocking)  //
//var iBoxPrintManager = spawn('python3', ['/home/pi/ibox/pythontest.py','']);
//  Test non blocking stdin.readline()  //ýý
//var iBoxPrintManager = spawn('python3', ['/home/pi/ibox/nonblockingstdin.py','']);
//  Production Location  //
//var iBoxPrintManager = spawn('python3', ['/home/piý/ibox/iBoxPrintManager.py','']);

var strText_LCD_Line_1 = ('Nano Initializing');
var strText_LCD_Line_1_Default = ('Nano Initializing');
  var strText_LCD_Line_2 = ('Browse Model > Press Print');
//var strText_LCD_Line_2 = ('Download 3D File then press Print');
var strText_LCD_Line_3 = ('IP Address: 0.0.0.0');
var strPrinter_State_3 = ('');
var strText_LCD_Line_4 = ('');
var strText_LCD_Line_Print_ETA = ('');
var strPrinter_State_Sm_2 = ('Est Print Time'); //strSoftwareVersion; // Sert software version in ETA Time box : set in mySystem LOAD
var strUploadPath_SVG = '/home/pi/ibox/www/packages/compressed/_svg/';
var strUploadPath_IMG_DATA = '/home/pi/ibox/www/packages/expanded/';
var strUploadPath_CONFIG_FILES = '/home/pi/ibox/print_config_files/';
var strHomeDirectory = '/home/pi/ibox/';
var strConfigDirectory = '/home/pi/ibox/print_config_files/';
var strConfigDirectory_WebDownload = '/ibox/print_config_files/';
var strPrinter_State_3_Last = "";
var iMeta_Refresh_Seconds = 30; //(SRR)MIGHT WANT TO CHECK IF THIS DEFAULT IS GOOD
var strText_LCD_Print_Percentage_Completed = '0'
var strLCD_Print_Percentage_Completed = '0'

var strSystem_File_Name = 'mysystem';
var strCalibration_File_Name = 'mycalibration';
var strConfig_File_Name = 'default';
var strUpdates_File_Name = 'updates';
var strUpdate_File_List_File_Name = "file_update_list";
var strSettingsFile_Ext = '.json';

var srrIP_MnT_default = 'Select MnT Unit'
var bRecommend_Update = false;

var strIPAddress = "127.0.0.1"
var strFullPath = "";
var strApacheRootLink = "";
var strPrinter_State = ('Nano Initializing');
var strPrinter_State_Sm_1 = ("---");

var iContrastAdjusted = 123;  //  its 100 + contrast for .py : Global for increment function in MnT

var strKey_GCS_Management = '/home/pi/ibox/keys/IBF_API_Download_Read_Write_Mgnt_07024746373d.json'
var biBoxTeam = false;
//  Fonts  // Global  // 
//  Resource: http://www.cssfontstack.com
//var strFontStyle = ('font-family: arial black, arial bold, gadget, sans-serif;'); // ==> TOO BIG AND BUBBLY
//var strFontStyle = ('font-family: arial, helvetica, sans-serif;'); //  not bad
//var strFontStyle = ('font-family: impact, charcoal, sans-serif;'); /// pretty good
//var strFontStyle = ('font-family: courier, courier new, monospace;'); /// fixed width font ==> Pretty good
//var strFontStyle = ('font-family: courier new, courier, monospace;'); /// fixed width font ==> ok
//var strFontStyle = ('font-family: andele mono, courier, monospace;'); /// fixed width font ==> Too LONG
//var strFontStyle = ('font-family: avant garde, courier, monospace;'); //  ok
var strFontStyle = ('font-family: lucida sans typewriter, courier new, monospace;');
var strFont_White = 'c6c6c6';

//  File IO  //
var lastFileName_FileName = 'Download or Select 3D File';  //  Must also change in /button_print function in Python to verify its a legit file
var lastFileName_FileNameTruncated = 'Download or Select 3D File';
var lastFileName_FullPath  = 'Download or Select 3D File';
var lastFileName_Default  = 'Download or Select 3D File'; //  to use to see if there is a "real" file name, or we could just look for a trailing .svg or .SVG
var lastFileName_tmpPath = "tmp";
var strFileExistingOrNew = "new_file"; //#"new_file : existing_file"

var strRPi_Serial_Number = "0000000000000000"

var fileiBoxSettings = "iBoxSettings.txt";
var iCounter = 0; //  general counter

var iBox_Printer_State_Boot = "" ; // "Ready" "Initializing" //  just for Boot time
var iBox_Printer_State_General = "" ; // "Printing" "Stoped", "Ready" etc //  

var True = true;
var False = false;

//T1 var settings = require('./settings.js'); //  for settings test from: http://stackoverflow.com/questions/5869216/how-to-store-node-js-deployment-settings-configuration-files
//var data = JSON.stringify(mySystem); //  T2 for data store
var data = null; //fs.readFileSync('/home/pi/ibox/config.json') //  T2
var myObj; //  T2

var myCalibration = {  //  Removed from mysystem because it is written once and very important data, mySystem gets read and written often and can be crashed.
  //  Calibrtion PWN Data : Used by python
  iOEM_Calibrated_UV_LED_PWM: "100,100,100,100,100,100,100,100,9,27,27,27,9,100,100,1,30,15,30,1,100,100,100,100,85,100,100,100", //  Duty Cycle of LEDs : Post Cal :  SAME AS IN myConfig, HARD COPY
  //  M&T Raw Data  //
  iOEM_Calibrated_UV_LED_uV_at_9mA_Pre_Cal: "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1", //  Raw uV @ 9mA before calibration :  uV * 100 trim to integer. 0.12v * 100 = 120
  iOEM_Calibrated_UV_LED_uV_at_9mA_Post_Cal: "2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2", //  Raw uV @ 9mA after calibration : Calibration uV * 100 trim to integer. 0.12v * 100 = 120
  iOEM_Calibrated_UV_LED_uV_at_9mA_Pre_Individual: "3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3",
  iOEM_Calibrated_UV_LED_PWM_Measured_Individualy: "5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5",
  iOEM_Calibrated_UV_LED_PWM_LCD_Mask: "100,100,100,100,100,100,100,100,9,27,27,27,9,100,100,1,30,15,30,1,100,100,100,100,85,100,100,100",
  //  Calibration Data  // UV LED Output power in uW/cm^2 LED1->28 //  Data collected POST calibration
  uW_at_6: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28",
  uW_at_7: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28",
  uW_at_8: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28",
  uW_at_9: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28",
  uW_at_10: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28",
  uW_at_11: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28",
  uW_at_12: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28",
  uW_at_13: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28",
  uW_at_14: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28",
  uW_at_15: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28",
  uW_at_16: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28",
  uW_at_17: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28",
  uW_at_18: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28",
  uW_at_19: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28",
  uW_at_20: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28"

};

var mySystem = { // T2 : They will be dynamically appended to the end of the file. This list helps facilitate quick reference and autocomplete
    Serial_Number: '000000',
    RPi_Serial_Number: '0000000000000000',
    Print_Counter: 0,
    Print_Time: 0,
    Print_UV_Time: 0,
    Print_UV_Time_Per_LED: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    Prints_Started: 0,
    Prints_Finished: 0,
    Load_Counter_NodeJS: 0,
    Load_Counter_Python: 0,

    bSoundEnabled: true,
    bPrinting_Option_Direct_Print_With_Z_Homing: false,
    bUse_Endstop: false,
    bLEDs_Enabled: true,
    bFast_Z: true,
    
    //  No Default Parameters  //
    lastFileName_FullPath: " ",
    lastFileName_FileName: " ",
    Selected_Config_File: "default",
    
    //  Updates  //
    Hardware_Version_Major: 1,
    Hardware_Version_Minor: 2,
    Version_NodeJS_Major: 1,
    Version_NodeJS_Minor: 0,
    Version_Python_Major: 1,
    Version_Python_Minor: 0,
    Last_Update_Date: "4/9/2015",



  };
  
  var myConfig = { // T2 : They will be dynamically appended to the end of the file. This list helps facilitate quick reference and autocomplete

    config_name: "default",
    config_description: "Default Config File : Recreated from Node.js",
    
    iGlobal_Z_Layer_Thickness: 100,
    iExposure_Time: 15,
    fExposure_Time_Initial_Model_Layers: 18,
    iModel_Layers_To_Overexpose: 3,
    fExposure_Power_mA: 5.5,
    iPixel_Over_LED_Mode: 0,
    iFoundation_Layer_Count: 0,
    iFoundation_Layer_Type: 0,
    fFoundation_Layer_Current: 11,
    fFoundation_Layer_Duration: 30,
    iGlobal_Z_Height_Retract: 30,
    iGlobal_Z_Height_Peel_Stage_1: 500,
    iGlobal_Z_Height_Peel_Stage_2: 500,
    iSteps_Per_100_Microns: 52,
    iPixel_Over_LED_Mode: 0, //0=Off : 1=Under_Pixel_Only_Full_Power : 2=Under_Px_Only_QACalibrated_Pwr : 3=Under_Px_Pnly_Equalized_Pwr : 4=Adjacent_Pix_Also_QA_Cal_Pwr
    iPixel_Over_LED_Power: 0, // 0=default PWM, 1=Full 100% PWM, 2=averaged PWM from Calibrated PWM
    //iOEM_Calibrated_UV_LED_PWM: [100,100,100,100,100,100,100,80,60,60,60,60,60,80,80,60,60,60,60,60,80,100,100,100,100,100,100,100],   //  LED numbers as they are on the PCB 0-27 (base0)    
    iOEM_Calibrated_UV_LED_PWM: [100,100,70,70,70,100,100,80,60,60,60,60,60,80,80,30,81,90,81,30,50,100,100,100,100,100,100,100],
    iGlobal_Z_Height_Position_For_Print: 45,
    iGlobal_Z_Manual_Button_Speed_Up_Slow: 100,
    iGlobal_Z_Manual_Button_Speed_Down_Slow: 100,
    iGlobal_Z_Manual_Button_Speed_Up_Fast: 20000,
    iGlobal_Z_Manual_Button_Speed_Down_Fast: 20000,
    fDelay_Between_Rapid_Z_Botton_Events: 0.003,
    bStepper_Acceleration_Enabled: true,
    bStepper_Deceleration_Enabled: true,
    iGlobal_Z_Stepper_Acceleration_Percentage_Per_Step: 5,
    iGlobal_Z_Stepper_Acceleration_Steps: 20,
    fGlobal_Stepper_Max_Pulse_Delay: 0.03,
    fGlobal_Speed_Peel: 0.004,
    fGlobal_Speed_Down_Fast:0.004,
    fGlobal_Speed_Up_Fast: 0.004,
    fGlobal_Speed_Down_Slow: 0.01,
    fGlobal_Speed_Up_Slow: 0.01,
    fGlobal_Speed_Down_Print: 0.004,
    fGlobal_Speed_Up_Print: 0.004,
    iLCD_Contrast: 23,
    
  };
  
  var myUpdates = { // For showCheckForUpdatesForm

    Serial_Number: "default",
    CRC32: "default",
    Hardware_Version_Major: 1,
    Hardware_Version_Minor: 0,
    Version_NodeJS_Major: 0,
    Version_NodeJS_Minor: 0,
    Version_Python_Major: 0,
    Version_Python_Minor: 0,
    Creation_Date: "11/20/2014",
    Description: "default"
    
  };
  
  var myFileUpdateList = {

    File_Count: 1,
    File_Source_1: "",
    File_Destination_1: "",
    EOL: "EOL"
    
  }
  
function fcnDeleteMyLogs () {
      console.log('Deleting Logs...');
    try {  
      //  Delete Logs  // Maybe should be its own thing  //
      var exec = require('child_process').exec;
      exec('sudo rm /home/pi/ibox/www/logs/iBoxWebGUI_Forever_StdOut.log', function (error, stdout, stderr) {
      });
      var exec = require('child_process').exec;
      exec('sudo rm /home/pi/ibox/www/logs/iBoxWebGUI_Forever_Err.log', function (error, stdout, stderr) {
      });
      var exec = require('child_process').exec;
      exec('sudo rm /home/pi/ibox/www/logs/iBoxWebGUI_Forever_Log.log', function (error, stdout, stderr) {
      });
      
      
      // Recreate a blacnk file because forever is set to "append" and if the file is missing no logs will be created (maybe)
      var exec = require('child_process').exec;
      exec('sudo touch /home/pi/ibox/www/logs/iBoxWebGUI_Forever_StdOut.log', function (error, stdout, stderr) {
      });
      var exec = require('child_process').exec;
      exec('sudo touch /home/pi/ibox/www/logs/iBoxWebGUI_Forever_Err.log', function (error, stdout, stderr) {
      });
      var exec = require('child_process').exec;
      exec('sudo touch /home/pi/ibox/www/logs/iBoxWebGUI_Forever_Log.log', function (error, stdout, stderr) {
      });
    }
    catch (err) {
      console.log('There has been an error Deleting Logs')
      console.log(err);
    }
}


///////////////////////////////////////////// Settings  //////////////////////////////////////////////////////////

function fsCalibration_Load() {
  //  Load Calibration FILE
  try {  
    data = fs.readFileSync(strHomeDirectory + strCalibration_File_Name + strSettingsFile_Ext) //  T2
    console.log("fsCalibration_Load : readFileSync=",strHomeDirectory + strCalibration_File_Name + strSettingsFile_Ext)
    myCalibration = JSON.parse(data);
    //fs.closeSync(data)
    console.log(myCalibration);
  }
  catch (err) {
    console.log('There has been an error [' + err + '] parsing your JSON. : myCalibration')
    //  Create a new one with defaults
    ///console.log("Creating a new one with defaults"); #could wipe out valuable data
    ///fsSystem_Save();
    //  Restore from a saved copy  //
    //onsole.log('=== ERROR === : Restoring from a saved version of myCalibration');
    //copyFileSync(strHomeDirectory + strCalibration_File_Name + strSettingsFile_Ext + '_backup', strHomeDirectory + strCalibration_File_Name + strSettingsFile_Ext)
  }
}
function fsCalibration_Save() {
  //  Save Calibration FILE  //
  data = JSON.stringify(myCalibration,null,2);
  try {
  fs.writeFileSync((strHomeDirectory + strCalibration_File_Name + strSettingsFile_Ext), data, 'utf8')
    }
  catch (err) {
    console.log('There has been an error [' + err + '] parsing your JSON. : myCalibration')
    return;
  }
    console.log('myCalibration : Configuration saved successfully.')
    //strTarget = strHomeDirectory + strCalibration_File_Name + strSettingsFile_Ext + '_backup'
    //if ( !fs.existsSync( strTarget ) ) {
    //  console.log('Making a backup copy of myCalibration ONLY IF IT DOES NOT EXIST') // ==> Make a backup ONLY AFTER CAL WRITTEN! at M&T time
    //  copyFileSync(strHomeDirectory + strCalibration_File_Name + strSettingsFile_Ext, strHomeDirectory + strCalibration_File_Name + strSettingsFile_Ext + '_backup')
    //}
  
  // Have printer reload System and Config files:
  //iBoxPrintManager.stdin.write('load_config\n');  #see notes in fsConfig_Save why we dont force Python to acces these files until needed
}


function fsSystem_Load() {
  //  Load Settings FILE
  try {  //  T2
    data = fs.readFileSync(strHomeDirectory + strSystem_File_Name + strSettingsFile_Ext) //  T2
    
    console.log("fsSystem_Load : readFileSync=",strHomeDirectory + strSystem_File_Name + strSettingsFile_Ext)
    mySystem = JSON.parse(data);
    //fs.closeSync(data)
    console.log(mySystem);
  }
  catch (err) {
    console.log('There has been an error [' + err + '] parsing your JSON. : mySystem')
    //  Create a new one with defaults
    ///console.log("Creating a new one with defaults"); #could wipe out valuable data
    ///fsSystem_Save();
    //  Restore from a saved copy  //
    console.log('=== ERROR === : Restoring from a saved version of mySystem');
    copyFileSync(strHomeDirectory + strSystem_File_Name + strSettingsFile_Ext + '_backup', strHomeDirectory + strSystem_File_Name + strSettingsFile_Ext)
  }
}

function fsSystem_Save() {
  //  Save Settings FILE  //
  //  T2
  data = JSON.stringify(mySystem,null,2);
  try {
    fs.writeFileSync((strHomeDirectory + strSystem_File_Name + strSettingsFile_Ext), data, 'utf8') 
    console.log('Making a backup copy of mySystem')
    //  Only backup if it is a valid JSON, if it was not it would have ended up in the CATCH
    copyFileSync(strHomeDirectory + strSystem_File_Name + strSettingsFile_Ext, strHomeDirectory + strSystem_File_Name + strSettingsFile_Ext + '_backup')
    }
  catch (err) {
    console.log('There has been an error [' + err + '] parsing your JSON. : mySystem')
    return;
  }
  console.log('mySystem : Configuration saved successfully.')

}

function fsConfig_Load() {
  //  Load Settings FILE
  try {  //  T2
    //console.log('(strConfigDirectory + mySystem.Selected_Config_File + strSettingsFile_Ext)=' + (strConfigDirectory + mySystem.Selected_Config_File + strSettingsFile_Ext))
    var strTmp_Config_File_Name = mySystem.Selected_Config_File;
    strTmp_Config_File_Name = strTmp_Config_File_Name.replace('.json','');  //  so we dont end up with .json.json
    data = fs.readFileSync(strConfigDirectory + strTmp_Config_File_Name + strSettingsFile_Ext) //  T2
    myConfig = JSON.parse(data);
    console.log(myConfig);
  }
  catch (err) {
    console.log('There has been an error [' + err + '] parsing your JSON. : myConfig')
    //  Create a new one with defaults
    ///console.log("Creating a new one with defaults : This is SERIOUS, you lose everything");
    ////fsConfig_Save(); #too risky
  }
}
function fsConfig_Save() {
  //  Save Settings FILE  //
  //  T2
  data = JSON.stringify(myConfig,null,2);
  console.log('fsConfig_Save : [' + strConfigDirectory + mySystem.Selected_Config_File + strSettingsFile_Ext + '] : data[' + data + ']')
  try {
    fs.writeFileSync((strConfigDirectory + mySystem.Selected_Config_File + strSettingsFile_Ext), data, 'utf8');
  }
  catch (err) {
    console.log('There has been an error [' + err + '] parsing your JSON. : myConfig')
    return;
  }
  console.log('myConfig : Configuration saved successfully.')
  
    // Have printer reload System and Config files:  /however the printer does this before it actually prints.
  //console.log('myConfig : stdin.write(load_config\n) : START');
  //iBoxPrintManager.stdin.write('load_config\n'); //  Might be causing a crash  when a user saves a setting change from the WebGUI; the crash seems to be in Python3 because of a Config JSON Load called immediatly after a Config.Json save.
  //The theory is that Node.js still has a file handle or is writing and Python tries to open and read it. This is causing a crash in Python loading the System JSON, which is always loaded at the beginning of a Config JSON load request in Python (to make sure it loads the correct Config.JSON file)
  //Recap: In mode.js we call a Config.JSON and System.JSON config saves sequentally. The Config.JSON save function tells Python to reload the Config.JSON. But Python needs to know which one first
  //So it loads the System.JSON. All the while Node.JS is saving the System.json, causing a collision in fila access.
  //Solution: 1. Delay the call to Python to load the updated Config/System
  //Solution: 2 Dont auto load  and auto save both files.
  //Solution: 3. Only have Python update (aka reload) System and Configs at PRINT command. What good is the updated config info when you are not printing? Scenerio: Motor UP carrage; if you change the config of the stepper speed, this will need to be reloaded. Fine, have Python reload on any command that requires that updated info; i.e. Carrage UP/Down + Print + ?
  
  //console.log('myConfig : stdin.write(load_config\n) : END');
}

function fsUpdates_Load() {  /////////////////////////////////////// UPDATES ////////////////////////////////////////
  //  Load Updates FILE
  try {  
    console.log('(strConfigDirectory + mySystem.Selected_Config_File + strSettingsFile_Ext)=' + (strHomeDirectory + strUpdates_File_Name + strSettingsFile_Ext))
    data = fs.readFileSync(strHomeDirectory + strUpdates_File_Name + strSettingsFile_Ext) //  
    myUpdates = JSON.parse(data);
    console.log(myUpdates);
  }
  catch (err) {
    console.log('There has been an error [' + err + '] parsing your JSON. : myUpdates')
  }
}

function fsFileList_Load() {  /////////////////////////////////////// File List ////////////////////////////////////////
  //  Load File List
  try {  
    console.log('(strConfigDirectory + strUpdate_File_List_File_Name + strSettingsFile_Ext)=' + (strHomeDirectory + strUpdate_File_List_File_Name + strSettingsFile_Ext))
    data = fs.readFileSync(strHomeDirectory + strUpdate_File_List_File_Name + strSettingsFile_Ext) //  
    myFileUpdateList = JSON.parse(data);
    console.log(myUpdates);
  }
  catch (err) {
    console.log('There has been an error [' + err + '] parsing your JSON. : myFileUpdateList')
  }
}

function int(value) {
  //  Int Like Function : Trent
  return parseInt(value, 10);
}
function functionTestSettingsLoadSave() {
  //  JSON Test Function
  //fsSystem_Save();  // If you save before you load; it restores to factory defaults at Var declaration 
  //fsSystem_Load(); //  access directly, just do once
  console.log(mySystem);
  //console.log("mySystem.Print_Counter=",mySystem.Print_Counter);
  //console.log("mySystem.Serial_Number=",mySystem.Serial_Number);
  
  mySystem.Print_Counter = int(mySystem.Print_Counter) + 1;
  
  fsSystem_Save(); //  Just do once and a while
  fsConfig_Save();

}

function showSettings( req, res ) {
  //  Pull header from ibp_settings.main(req, res);
  diskspace.check('/', function (err, total, free, status)
  {
    strFree_HD = String(free/1000000).substring(0,7);   
  });
  //header( res );
  res.write('<!-- showSettings Started -->');

  Check_Log_Size();

  var strFullPath = "http://" + strIPAddress + ':8000/images/' ; 
  var strFontStyle = ('font-family: lucida sans typewriter, courier new, monospace;');    

  res.write('<html><body bgcolor="#1B1B1B">');
  res.write('<center><table class="layout" border="0" width="960" bgcolor="#000000">');
  res.write('<head>');
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#c6c6c6">');
  //res.write('<title>iBox Nano - Settings</title>');
  res.write('<title>iBox Nano - Settings - ' + strZeroConfigName + '</title>');
  res.write('<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />');
  res.write('<link rel="icon" href="' + strApacheRootLink + 'favicon-32.png" sizes="32x32">');
  res.write('<link rel="shortcut icon" type="image/x-icon" href="' + strApacheRootLink + 'favicon.ico"/>');
  res.write('</head><p>');

  res.write('<body bgcolor="#FFFFFF">');

  ///  Tab Bar with CSS : Start  ////////////////////////////////////
    header_css( res, "button_settings");
    /////////// Tab Br with CSS : End  ////////////////////////////////////

/*
  res.write('<!-- Save for Web Slices (NanoHID_Header_960x72.psd) -->');
  res.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0">');
  res.write('  <tr>');
  res.write('    <td colspan="11">');
  res.write('      <img id="NanoHID_Header_960x72_01" src="' + strFullPath + 'NanoHID_Header_960x72_01.png" width="960" height="8" alt="" /></td>');
  res.write('  </tr>');
  res.write('  <tr>');
  res.write('    <td rowspan="2">');
  res.write('      <img id="NanoHID_Header_960x72_02" src="' + strFullPath + 'NanoHID_Header_960x72_02.png" width="601" height="64" alt="" /></td>');
  res.write('    <td>');
  res.write('      <a href="button_settings">');
  res.write('        <img id="Button_Refresh_Header" src="' + strFullPath + 'Button_Refresh_Header.png" width="54" height="38" border="0" alt="Refresh" /></a></td>');
  res.write('    <td rowspan="2">');
  res.write('      <img id="NanoHID_Header_960x72_04" src="' + strFullPath + 'NanoHID_Header_960x72_04.png" width="46" height="64" alt="" /></td>');
  res.write('    <td>');
  res.write('      <a href="button_home">');
  res.write('        <img id="Button_Home" src="' + strFullPath + 'Button_Home.png" width="54" height="38" border="0" alt="Home" /></a></td>');
  res.write('    <td rowspan="2">');
  res.write('      <img id="NanoHID_Header_960x72_06" src="' + strFullPath + 'NanoHID_Header_960x72_06.png" width="6" height="64" alt="" /></td>');
  res.write('    <td>');
  res.write('      <a href="button_help">');
  res.write('        <img id="Button_Help_Header" src="' + strFullPath + 'Button_Help_Header.png" width="54" height="38" border="0" alt="Help" /></a></td>');
  res.write('    <td rowspan="2">');
  res.write('      <img id="NanoHID_Header_960x72_08" src="' + strFullPath + 'NanoHID_Header_960x72_08.png" width="6" height="64" alt="" /></td>');
  res.write('    <td>');
  res.write('      <a href="button_settings">');
  res.write('        <img id="Button_Settings_Header" src="' + strFullPath + 'Button_Settings_Header.png" width="54" height="38" border="0" alt="Settings" /></a></td>');
  res.write('    <td rowspan="2">');
  res.write('      <img id="NanoHID_Header_960x72_10" src="' + strFullPath + 'NanoHID_Header_960x72_10.png" width="6" height="64" alt="" /></td>');
  res.write('    <td>');
  res.write('      <a href="button_about">');
  res.write('        <img id="Button_About_Header" src="' + strFullPath + 'Button_About_Header.png" width="54" height="38" border="0" alt="About" /></a></td>');
  res.write('    <td rowspan="2">');
  res.write('      <img id="NanoHID_Header_960x72_12" src="' + strFullPath + 'NanoHID_Header_960x72_12.png" width="25" height="64" alt="" /></td>');
  res.write('  </tr>');
  res.write('  <tr>');
  res.write('    <td>');
  res.write('      <img id="NanoHID_Header_960x72_13" src="' + strFullPath + 'NanoHID_Header_960x72_13.png" width="54" height="26" alt="" /></td>');
  res.write('    <td>');
  res.write('      <img id="NanoHID_Header_960x72_14" src="' + strFullPath + 'NanoHID_Header_960x72_14.png" width="54" height="26" alt="" /></td>');
  res.write('    <td>');
  res.write('      <img id="NanoHID_Header_960x72_15" src="' + strFullPath + 'NanoHID_Header_960x72_15.png" width="54" height="26" alt="" /></td>');
  res.write('    <td>');
  res.write('      <img id="NanoHID_Header_960x72_16" src="' + strFullPath + 'NanoHID_Header_960x72_16.png" width="54" height="26" alt="" /></td>');
  res.write('    <td>');
  res.write('      <img id="NanoHID_Header_960x72_17" src="' + strFullPath + 'NanoHID_Header_960x72_17.png" width="54" height="26" alt="" /></td>');
  res.write('  </tr>');
  res.write('</table>');
  res.write('<!-- End Save for Web Slices -->');

*/

////   NEW on 5/18/2015  ///////  Hover_Buttons : Start
 res.write('<!-- Save for Web Slices (NanoHID_Tabs_960x88.psd) -->');
 res.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0">');
 res.write('  <tr>');
 res.write('    <td>');
 res.write('      <img id="NanoHID_Tabs_960x88_01" src="' + strFullPath + 'NanoHID_Tabs_960x88_01.png" width="31" height="88" alt="" /></td>');
 res.write('<td>');
 res.write('<table class="tabs2" border="0" cellpadding="0" cellspacing="0">');
 res.write('<tr>');
 res.write('    <td>');
  res.write('      <a href="button_network_setup" target="">');
  res.write('        <img id="Button_Network_Setup" src="' + strFullPath + 'Button_Network_Setup.png" width="150" height="88" border="0" alt="User Guide" /></a></td>');
 res.write('    <td>');
  res.write('      <a href="https://www.youtube.com/channel/UCfHkl7-As8ycrRVbJ3I7Zvg" target="_blank">');
  res.write('        <img id="Button_YouTube" src="' + strFullPath + 'Button_YouTube.png" width="149" height="88" border="0" alt="YouTube" /></a></td>');
 res.write('    <td>');
  res.write('      <a href="button_updates" target="">');
  res.write('        <img id="Button_Updates" src="' + strFullPath + 'Button_Updates.png" width="150" height="88" border="0" alt="Check for software updates" /></a></td>');
 res.write('    <td>');
  res.write('      <a href="http://support.iboxprinters.com" target="_blank">');
  res.write('        <img id="Button_Forums" src="' + strFullPath + 'Button_Forums.png" width="151" height="88" border="0" alt="Forums" /></a></td>');
 res.write('    <td>');
  res.write('      <a href="button_manufandtest" target="">');
  res.write('        <img id="Button_Wiki" src="' + strFullPath + 'Button_ManufAndTest.png" width="149" height="88" border="0" alt="Manufacturing and Test" /></a></td>');
 res.write('    <td>');
  res.write('      <a href="button_settings_advanced" target="">');
  res.write('        <img id="Button_Settings_Advanced" src="' + strFullPath + 'Button_Settings_Advanced.png" width="150" height="88" border="0" alt="Advanced Settings" /></a></td>');
 res.write('</tr>');
 res.write('</table>');
 res.write('</td>');
 res.write('    <td>');
 res.write('      <img id="NanoHID_Tabs_960x88_08" src="' + strFullPath + 'NanoHID_Tabs_960x88_08.png" width="30" height="88" alt="" /></td>');
 res.write('  </tr>');
 res.write('</table>');
 res.write('<!-- End Save for Web Slices -->');

////   END NEW 5/18/2015  /////    Hover_Buttons : End

  // TABS  ///////////////////////////////////////////////
/*
  res.write('<!-- Save for Web Slices (NanoHID_Tabs_960x88.psd) -->');
  res.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0">');
  res.write('  <tr>');
  res.write('    <td>');
  res.write('      <img id="NanoHID_Tabs_960x88_01" src="' + strFullPath + 'NanoHID_Tabs_960x88_01.png" width="31" height="88" alt="" /></td>');
  res.write('    <td>');
  res.write('      <a href="button_network_setup" target="">');
  res.write('        <img id="Button_Network_Setup" src="' + strFullPath + 'Button_Network_Setup.png" width="150" height="88" border="0" alt="User Guide" /></a></td>');
  res.write('    <td>');
  res.write('      <a href="https://www.youtube.com/channel/UCfHkl7-As8ycrRVbJ3I7Zvg" target="_blank">');
  res.write('        <img id="Button_YouTube" src="' + strFullPath + 'Button_YouTube.png" width="149" height="88" border="0" alt="YouTube" /></a></td>');
  res.write('    <td>');
  res.write('      <a href="button_updates" target="">');
  res.write('        <img id="Button_Updates" src="' + strFullPath + 'Button_Updates.png" width="150" height="88" border="0" alt="Check for software updates" /></a></td>');
  res.write('    <td>');
  res.write('      <a href="http://support.iboxprinters.com" target="_blank">');
  res.write('        <img id="Button_Forums" src="' + strFullPath + 'Button_Forums.png" width="151" height="88" border="0" alt="Forums" /></a></td>');
  res.write('    <td>');
  res.write('      <a href="button_manufandtest" target="">');
  res.write('        <img id="Button_Wiki" src="' + strFullPath + 'Button_ManufAndTest.png" width="149" height="88" border="0" alt="Manufacturing and Test" /></a></td>');
  res.write('    <td>');
  res.write('      <a href="button_settings_advanced" target="">');
  res.write('        <img id="Button_Settings_Advanced" src="' + strFullPath + 'Button_Settings_Advanced.png" width="150" height="88" border="0" alt="Advanced Settings" /></a></td>');
  res.write('    <td>');
  res.write('      <img id="NanoHID_Tabs_960x88_08" src="' + strFullPath + 'NanoHID_Tabs_960x88_08.png" width="30" height="88" alt="" /></td>');
  res.write('  </tr>');
  res.write('</table>');
  res.write('<!-- End Save for Web Slices -->');
*/
  /// BODY - Home/Main : INFINITY //////////////////////////////////////////////

res.write('<!-- Save for Web Slices (NanoHID_Body_Infinity_960xInfinity.psd) -->');
res.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0">');
res.write(' <tr>');
res.write('   <td width="23" height="" bgcolor="#242424">');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="23" height="" alt="" /></td>');
//res.write('   <td width="907" height="608" bgcolor="#1B1B1B">INFINITY TEXT BODY</td>');
res.write('   <td width="907" height="" bgcolor="#1B1B1B" >');

res.write('<table id="Table_01" width="907" border="0" cellpadding="20" cellspacing="0">');
res.write(' <tr>');
res.write('   <td width="23" height="" bgcolor="#242424">');

////////// SPLIT : START  ////////////////////////////////////





  //res = ibp_settings.main(req, res);
  //res.write('<!-- Just got back from ibp_settings -->');
  
  res.write('<p style="color:#00ceef">');
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="+1" COLOR="#00ceef">');
  
  
  res.write('<div id="header" align="center"><FONT STYLE="' + strFontStyle + '" SIZE="+2" COLOR="#c6c6c6"><h2>Nano Settings</h2></FONT></div>');
  //res.write('<br><br>');
  /*
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Back Button to Home ////
  ///////////////////////////////////////////////////
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<input type="submit" value="Back">');
  res.write('</form>');
  //res.write('<br>');
  */

  strFree_RAM = String(os.freemem()/1000000).substring(0,6);
  var strRaw = String(os.loadavg())
  var aryCPU = strRaw.split(',');
  //strCPU = aryCPU[1].substring(0,3);
  strCPU = String(aryCPU[2]*100).substring(0,3) + "%"; //  1 , 5 , 15min lookback/avg of CPU i.e. [2] = 5min avg lookback of CPU
  
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  //  Load current Config DATA//////////////////  //
  // Reload config in case it just changed or was modified:
  fsSystem_Load();
  fsConfig_Load();
  res.write('<div id="nav">');
  res.write("</FONT>");
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">');
  strURL_Config_Submit = 'http://' + strIPAddress + '/submit_config';
  res.write('<form name="input" action="' + strURL_Config_Submit + '" method="get">');
  Object.keys(myConfig).forEach(function (key) {
    
    if (key == "config_name") {
      res.write('Configuration Name: <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
      //  Save as new Form  //
      //res.write('<br>' + key + ': <input type="text" name="' + key + '" value="Change Form">');
      res.write('&nbsp;<input type="submit" value="Save As New Config File">&nbsp;Enter new name then [Save as]');
      res.write('<br>');
    }else if(key == "config_description") {
      res.write('Configuration Description: <input size="80" type="text" name="' + key + '" value="' + myConfig[key] + '">');
      res.write('');
      res.write('<br>');
    }else if(key == "iGlobal_Z_Layer_Thickness") {
      res.write('Layer Thickness: <input type="text" name="' + key + '" value="' + int(myConfig[key]) + '">');
      res.write(' microns');
      res.write('<br>');
    }else if(key == "iExposure_Time") {
      res.write('All Layers : Exposure Time: <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
      res.write(' sec');
      res.write('<br>');
    }else if(key == "fExposure_Time_Initial_Model_Layers") {
      res.write('First Layers : Over-Exposure Time: <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
      res.write(' sec');
      res.write('<br>');
    }else if(key == "iModel_Layers_To_Overexpose") { //  Overexposed First Layers
      //res.write('Number of Base Layers: <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
      res.write('First Layers : Over-Exposure Layer Count: <select name="' + key + '">');
      for(var i=0; i<30 ;i++){
        iKeyVal = int(myConfig[key]);
        if(iKeyVal == i) {
          res.write('  <option value="' + i + '" selected>' + i + '</option>');
        }else{
          res.write('  <option value="' + i + '">' + i + '</option>');
        }
      }
      res.write('</select>');
      res.write(' Layers [For better build plate stick]');
      res.write('<br>');
      //res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#ffff00"> <br>'); //  <p>  ---- Advanced Settings ----
     }else if(key == "fExposure_Power_mA") {
      res.write('UV-LED Drive Current: <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
      res.write(' mA');
      res.write('<br>');

}else if(key == "iPixel_Over_LED_Mode") { 
      res.write('<br>');
      //res.write('Pixel Over UV-LED Mode : <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
      res.write('<br>Pixel Over UV-LED Mode : <select name="' + key + '">');

      if(myConfig[key] == '0') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="0"' + strSelected + '>Off : 0</option>');

      if(myConfig[key] == '1') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="1"' + strSelected + '>UAP Future Mode : 1</option>'); //  was UAP@Full_PWR

      if(myConfig[key] == '2') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="2"' + strSelected + '>UAP Basic : 2</option>');

      if(myConfig[key] == '3') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="3"' + strSelected + '>UAP+Min_LED_Count : 3</option>');

      if(myConfig[key] == '4') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="4"' + strSelected + '>UAP+Adjacent_LED : 4</option>');

      if(myConfig[key] == '5') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="5"' + strSelected + '>UAP Future Mode : 5</option>'); //  was UAP+AdjacentLED@Full_PWR
      res.write('</select>');
      res.write(' Under Active Pixel (UAP) LED Control');
      //res.write('<br> 0=Off : 1= UAP@Full_PWR : 2=UAP@OEM Cal PWR : 3=UAP@Equalized PWR : 4=UAP+AdjacentLED@OEM Cal PWR : 5=UAP+AdjacentLED@Full_PWR :: Key: UAP=Under Active Pixel'); 
      //res.write('<br>');
    }else if(key == "iPixel_Over_LED_Power") { 
      ////////// START  Pixel over LED Power  /////////////////////////////////////////////////
      res.write('<br>Pixel Over UV-LED Power : <select name="' + key + '">');

      if(myConfig[key] == '0') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="0"' + strSelected + '>Default : Calibrated PWM from current profile</option>');

      if(myConfig[key] == '1') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="1"' + strSelected + '>Full PWM : 100% PWM</option>');

      if(myConfig[key] == '2') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="2"' + strSelected + '>Dynamically averaged PWM : Averaged from Calibrated PWM</option>');

      res.write('</select>');
      res.write(' UV-LED PWM');
      res.write('<br>'); ////////// END Pixel over LED Power  /////////////////////////////////////////////////

    }else if(key == "iFoundation_Layer_Count") { 
      //res.write('Number of base layers before model starts : <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
      res.write('<br>Foundation Layer Count: <select name="' + key + '">');
      for(var i=0; i<41 ;i++){
        iKeyVal = int(myConfig[key]);
        if(iKeyVal == i) {
          res.write('  <option value="' + i + '" selected>' + i + '</option>');
        }else{
          res.write('  <option value="' + i + '">' + i + '</option>');
        }
      }
      res.write('</select>');
      res.write(' Base Layers');
      res.write('<br>');
    }else if(key == "iFoundation_Layer_Type") { 
      //res.write('Base Layer Type : <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
      //res.write(' 0=Model Footprint 1=20x20mm Square 3=20mm Circle 5=40x20mm Rectangle');
      res.write('Foundation Layer Type: <select name="' + key + '">');
      if(myConfig[key] == '0') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="0"' + strSelected + '>Model Footprint</option>');
      if(myConfig[key] == '1') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="1"' + strSelected + '>20x20mm Square</option>');
      if(myConfig[key] == '2') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="2"' + strSelected + '>20mm Circle</option>');
      if(myConfig[key] == '3') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="3"' + strSelected + '>40x20mm Rectangle</option>');
      ///  Option Start  ///
      if(myConfig[key] == '4') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="4"' + strSelected + '>40x20mm Square Blocks</option>');
      /// Option End ////
      ///  Option Start  ///
      if(myConfig[key] == '5') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="5"' + strSelected + '>40x20mm Square with 9mm Holes</option>');
      /// Option End ////
      ///  Option Start  ///
      if(myConfig[key] == '6') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="6"' + strSelected + '>40x20 Oval</option>');
      /// Option End ////
      res.write('</select>');
      //res.write(' Layers')
      res.write('<br>');    
     }else if(key == "fFoundation_Layer_Current") {
      res.write('Foundation UV-LED Current: <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
      res.write(' mA');
      res.write('<br>');
     }else if(key == "fFoundation_Layer_Duration") {
      res.write('Foundation Exposure Time: <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
      res.write(' sec');
      res.write('<br>');

    }else{
      res.write('<input type="hidden" name="' + key + '" value="' + myConfig[key] + '">');
    }  //  End basic settings
      /*
     }else if(key == "iLCD_Contrast") {
      res.write('<p>LCD Contrast Setting: <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
      res.write(' Contrast. (*Expert Setting with 23 and 86 being peaks)');
    
    }else if(key == "iOEM_Calibrated_UV_LED_PWM") {
      res.write('OEM Calibrated UV LED PWM Values : [0=Off : 100=Full Brightness]<br><input size="118" type="text" name="' + key + '" value="' + myConfig[key] + '">');
      res.write('<br>Use the table below to visualize the LEDs. LED 1=bottom right. LED 28=top left');     
          
    ////////////////// --- Table for calibration values for array: Notes:
    //  1. Center Pixels will be brighter than outer ones due to 15degree spread combination, thus coresponding inner LEDs ones will need to be "dimmed", reducing power on overexposed pixels
    //  2. Pixels at the rear of the screen are more transmissive than at the front due to LCD angle vs transmissiveness. Rear = 100% : center = 90% : front = 50% in refrence to radiation received at 45deg to pixel. See notes E7 in notebook 70s show
    //  1. Split iOEM_Calibrated_UV_LED_PWM to array/list
    res.write('<br>---  Top View of LED array i.e. The closest row to this text is the back of the machine ---')
    var arrayOEM_Calibrated_UV_LED_PWM = String(myConfig[key]).split(',');
        res.write('<table border="1" style="background-color:#000000;border-collapse:collapse;border:1px solid #0000FF;color:#FFFFFF;width:800" cellpadding="3" cellspacing="3" >')
	// 1  //
        res.write('<tr>')
        for (var i = 27; i >27-7; i--) {
            res.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
            //res.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
        }
	res.write('</tr>')
        //  2  //
        res.write('<tr>')
        for (var i = 27-7; i >27-7-7; i--) {
            res.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
            //res.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
        }
	res.write('</tr>')
        //  3  //
        	res.write('<tr>')
        for (var i = 27-7-7; i >27-7-7-7; i--) {
            res.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
            //res.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
        }
	res.write('</tr>')
        //  4  //
        res.write('<tr>')
        for (var i = 27-7-7-7; i >27-7-7-7-7; i--) {
            res.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
            //res.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
        }
	res.write('</tr>')
        //  Three more copies here
        res.write('</table>')
    res.write('--------------------  Front of machine --------------------')
    }else if(key == "iGlobal_Z_Height_Retract") {
      res.write('Build Plate Extraction Height [Stage 1]: <input type="text" name="' + key + '" value="' + int(myConfig[key]) + '">');
      res.write(' Millimeters to move build plate up after print');

    }else if(key == "iGlobal_Z_Height_Position_For_Print") {
      res.write('First Print Z Down Distance : If using Auto Zero Z: <input type="text" name="' + key + '" value="' + int(myConfig[key]) + '">');
      res.write(' Millimeters to move build plate udown searching for First Layer Height');
    }else if(key == "iGlobal_Z_Height_Peel_Stage_1") {
      res.write('Peel Height [Stage 1]: <input type="text" name="' + key + '" value="' + int(myConfig[key]) + '">');
      res.write(' microns');
    }else if(key == "iGlobal_Z_Height_Peel_Stage_2") {
      res.write('Peel Height [Stage 2]: <input type="text" name="' + key + '" value="' + int(myConfig[key]) + '">');
      res.write(' microns');
    }else if(key == "iSteps_Per_100_Microns") {
      res.write('Stepper Motor : Steps Per 100 Microns: <input type="text" name="' + key + '" value="' + int(myConfig[key]) + '">');
      res.write(' Steps/100 Microns');
    }else{
      res.write( key + ': <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
    }
    */
    
    //console.log;
    //console.log(key);
    //console.log(myConfig[key]);
  });
  res.write('<input type="submit" value="Save Config">');


  
  res.write('</form>');
  res.write('</div>');
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">');
  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  //  CHANGE Config File   /////////////////////////////////////
  res.write('<div id="change_config"">');
  //  Offer to load OTHER config file  //
  //  Step 1 : Make a list by parsing DIR or reading some file

  var files = fs.readdirSync(strConfigDirectory);
  var jsonAry = [];
  for(var i in files) {
     if(path.extname(files[i]) == ".json") {
        var fileName = files[i];
         // Add to list  //
         //if(fileName != (strSystem_File_Name + strSettingsFile_Ext)) {
            var strFilenameNoExt = fileName;
            jsonAry.push(strFilenameNoExt.replace(".json",""));
         //}
         //console.log("fileName[",i,"]=",fileName);
         
         
     }
     
  }
  //  Step 2 : Present list in drop down box
  //console.log("jsonAry=",jsonAry);
  res.write('Load Config File');  //&nbsp;&nbsp;&nbsp;
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/change_config';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<select name="config_name">');
  for (var i = 0; i < jsonAry.length; i++) {
    var strFileCleaned = jsonAry[i];
    strFileCleaned = strFileCleaned.replace("+"," ");
    res.write('<option value="' + strFileCleaned + '">' + strFileCleaned + '</option>');
    
  }
  res.write('</select>');
  //  Step 3 : Add new Submit button, and look for it, or use a seperate form-> maybe best idea. Maybe a Table layout with two Horiz
  //  Nested Form?
  res.write('<input type="submit" value="Load Config File">');
  res.write('</form>');
  res.write('</div>');
  
  
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  DElete  Config  ////
  ///////////////////////////////////////////////////
    //  Bottom HTML  /////////////////////////////////////
  res.write('<div id="delete_config"">');
  //  Offer to load OTHER config file  //
  //  Step 1 : Make a list by parsing DIR or reading some file

  var files = fs.readdirSync(strConfigDirectory);
  var jsonAry = [];
  for(var i in files) {
     if(path.extname(files[i]) == ".json") {
        var fileName = files[i];
         // Add to list  //
         if(fileName != (strSystem_File_Name + strSettingsFile_Ext)) {
            var strFilenameNoExt = fileName;
            jsonAry.push(strFilenameNoExt.replace(".json",""));
         }
         //console.log("fileName[",i,"]=",fileName);
     } 
  }
  //  Step 2 : Present list in drop down box
  //console.log("jsonAry=",jsonAry);
  res.write('Delete Config File');  //&nbsp;&nbsp;&nbsp;
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/delete_config';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<select name="config_name">');
  for (var i = 0; i < jsonAry.length; i++) {
    var strFileCleaned = jsonAry[i];
    strFileCleaned = strFileCleaned.replace("+"," ");
    //console.log("(strConfig_File_Name + strSettingsFile_Ext)"+(strConfig_File_Name + strSettingsFile_Ext)+" != strFileCleaned:" + strFileCleaned)
    if((strConfig_File_Name) != strFileCleaned) {
      res.write('<option value="' + strFileCleaned + '">' + strFileCleaned + '</option>');
      }
  }
  res.write('</select>');
  //  Step 3 : Add new Submit button, and look for it, or use a seperate form-> maybe best idea. Maybe a Table layout with two Horiz
  //  Nested Form?
  res.write('<input type="submit" value="Delete Config File">');
  res.write('</form>');
  res.write('</div>');
  
  ////  Download a Profile config from Host  //
  res.write('<br>');
  /*
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Upload a Config file; CHOOSE FILE then press the UPLOAD button</FONT>');
  res.write(
    '<form action="/upload_config_files" enctype="multipart/form-data" method="post">'+
    '<input type="file" name="upload" multiple="multiple"><br>'+
    '<input type="submit" value="UPLOAD">'+
    '</form>'
  );
  res.write('<br>');
  
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Download Config File ////
  ///////////////////////////////////////////////////
  res.write('Download Config Files'); 
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/download_config';
  //res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  //res.write('<form onsubmit="this.action = document.getElementById("filename").value">');
  //res.write('<select name="config_name">');
  //res.write('<select id="filename">');
  //res.write('<select id="dwl">');
  for (var i = 0; i < jsonAry.length; i++) {
    var strFileCleaned = jsonAry[i];
    res.write('<br>');
    strFileCleaned = strFileCleaned.replace("+"," ");
    //res.write('<option value="' + strConfigDirectory_WebDownload + strFileCleaned + '.json">' + strFileCleaned + '</option>');
    res.write('<a href="' + strConfigDirectory_WebDownload + strFileCleaned + '.json" download="' + strFileCleaned + '.json">' + strFileCleaned + '</a>');
    
    //<a href="/images/myw3schoolsimage.jpg" download>
  }
  res.write('<br>');
  //res.write('</select>');
  //res.write('<input type="submit" value="Download Config File">');
  //res.write('<input type="submit" value="Download" class="grey-btn" />');
  //res.write('<input type="button" onclick="window.location.href=document.getElementById("dwl").value" value="Download" class="grey-btn" />');
  res.write('</form>');
  res.write('</div>');
  
  res.write('<br>');
  res.write('System Configuration');
  //res.write('<br>');
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  System Config ////
  ///////////////////////////////////////////////////
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/edit_system_config';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<input type="submit" value="Edit System Config">');
  res.write('</form>');
  
  res.write('<br>');
  res.write('System Logs');
  //res.write('<br>');
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  System Logs ////
  ///////////////////////////////////////////////////
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/show_logs';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<input type="submit" value="System Logs">');
  res.write('</form>');
  
  res.write('<br>');
  
    //  Delete Log Files Button
  res.write('You should delete your system logs periodically so they do not consume too much system resources.');
   //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Delete Logs ////
  ///////////////////////////////////////////////////
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/delete_logs';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<input type="submit" value="Delete Logs">');
  res.write('</form>');
  
  res.write('<br>');
  


//////////////////////////////////////////////////////////////////////////////////////////////////////
////  Create Preview images for currently selected Model ////
///////////////////////////////////////////////////
strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/gen_thumb';
res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
res.write('<input type="submit" value="Generate Model Preview Images">&nbsp&nbsp This will take a few minutes to complete'); 
res.write('</form>');

res.write('<br>');

//////////////////////////////////////////////////////////////////////////////////////////////////////
////  VIEW Preview images for currently selected Model ////
///////////////////////////////////////////////////
strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/show_thumb';
res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
res.write('<input type="submit" value="View Model Preview Images">');
res.write('</form>');

res.write('<br>');


//////////////////////////////////////////////////////////////////////////////////////////////////////
////  Manufacturing and Test ////
///////////////////////////////////////////////////
strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_on';
res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
res.write('<input type="submit" value="Manufacturing and Test Mode - ON">');
res.write('</form>');
res.write('&nbsp');
strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_on_calpwr';
res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
res.write('<input type="submit" value="Manufacturing and Test Mode - ON - Cal PWR">');
res.write('</form>');
res.write('&nbsp');
strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_calibrate';
res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
res.write('<input type="submit" value="Manufacturing and Test Mode - CALIBRATE">');
res.write('</form>');
res.write('&nbsp');


strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/fix_permissions_directory_packages';
res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
res.write('<input type="submit" value="Reset Permissions on IBF Packages Directory">');
res.write('</form>');
res.write('<br>');



*/
res.write(' </tr>');
res.write('</table>');
////////// SPLIT : END  ////////////////////////////////////
res.write('   </td>');
res.write('   <td width="30" height="" bgcolor="#242424">');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="30" height="" alt="" /></td>');
res.write(' </tr>');
res.write('</table>');
res.write('<!-- End Save for Web Slices -->');

  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Back Button to Home ////
  ///////////////////////////////////////////////////
  
  res.write('<br>');
  res.write('<form name="input" action="http://' + strIPAddress + '" method="get">');
  res.write('<input type="submit" value=" Home ">');
  res.write('</form>');

  //res.write('<br>');
  res.write('<form name="input" action="http://' + strIPAddress + '/button_settings_advanced" method="get">');
  res.write('<input type="submit" value=" Advanced Settings ">');
  res.write('</form>');
  

  //response.write('<br>Request Object:' + request.url)

  /*
  res.write('</table></center></body></html>');
  res.write('</FONT>');

  res.write('</body>');
  res.write('</html>');
  */

  footer (res);
  res.end();


  //footer (res);  ////  END ShowSettings
}


function showNetworkSetup( req, res ) {
  //  Pull header from ibp_settings.main(req, res);    // showNetworkSetup START   // showNetworkSetup START
  diskspace.check('/', function (err, total, free, status)
  {
    strFree_HD = String(free/1000000).substring(0,7);   
  });
  //header( res );
  res.write('<!-- showNetworkSetup Started -->');

  var strFullPath = "http://" + strIPAddress + ':8000/images/' ; 
  var strFontStyle = ('font-family: lucida sans typewriter, courier new, monospace;');    

  res.write('<html><body bgcolor="#1B1B1B">');
  res.write('<center><table class="layout" border="0" width="960" bgcolor="#000000">');
  res.write('<head>');
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#c6c6c6">');
  res.write('<title>iBox Nano - Network Setup</title>');
  res.write('<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />');
  res.write('<link rel="icon" href="' + strApacheRootLink + 'favicon-32.png" sizes="32x32">');
  res.write('<link rel="shortcut icon" type="image/x-icon" href="' + strApacheRootLink + 'favicon.ico"/>');
  res.write('</head><p>');

  res.write('<body bgcolor="#FFFFFF">');

    ///  Tab Bar with CSS : Start  ////////////////////////////////////
  header_css( res, "button_network_setup");
  /////////// Tab Br with CSS : End  ////////////////////////////////////

  /*

  res.write('<!-- Save for Web Slices (NanoHID_Header_960x72.psd) -->');
  res.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0">');
  res.write('  <tr>');
  res.write('    <td colspan="11">');
  res.write('      <img id="NanoHID_Header_960x72_01" src="' + strFullPath + 'NanoHID_Header_960x72_01.png" width="960" height="8" alt="" /></td>');
  res.write('  </tr>');
  res.write('  <tr>');
  res.write('    <td rowspan="2">');
  res.write('      <img id="NanoHID_Header_960x72_02" src="' + strFullPath + 'NanoHID_Header_960x72_02.png" width="601" height="64" alt="" /></td>');
  res.write('    <td>');
  res.write('      <a href="button_settings">');
  res.write('        <img id="Button_Refresh_Header" src="' + strFullPath + 'Button_Refresh_Header.png" width="54" height="38" border="0" alt="Refresh" /></a></td>');
  res.write('    <td rowspan="2">');
  res.write('      <img id="NanoHID_Header_960x72_04" src="' + strFullPath + 'NanoHID_Header_960x72_04.png" width="46" height="64" alt="" /></td>');
  res.write('    <td>');
  res.write('      <a href="button_home">');
  res.write('        <img id="Button_Home" src="' + strFullPath + 'Button_Home.png" width="54" height="38" border="0" alt="Home" /></a></td>');
  res.write('    <td rowspan="2">');
  res.write('      <img id="NanoHID_Header_960x72_06" src="' + strFullPath + 'NanoHID_Header_960x72_06.png" width="6" height="64" alt="" /></td>');
  res.write('    <td>');
  res.write('      <a href="button_help">');
  res.write('        <img id="Button_Help_Header" src="' + strFullPath + 'Button_Help_Header.png" width="54" height="38" border="0" alt="Help" /></a></td>');
  res.write('    <td rowspan="2">');
  res.write('      <img id="NanoHID_Header_960x72_08" src="' + strFullPath + 'NanoHID_Header_960x72_08.png" width="6" height="64" alt="" /></td>');
  res.write('    <td>');
  res.write('      <a href="button_settings">');
  res.write('        <img id="Button_Settings_Header" src="' + strFullPath + 'Button_Settings_Header.png" width="54" height="38" border="0" alt="Settings" /></a></td>');
  res.write('    <td rowspan="2">');
  res.write('      <img id="NanoHID_Header_960x72_10" src="' + strFullPath + 'NanoHID_Header_960x72_10.png" width="6" height="64" alt="" /></td>');
  res.write('    <td>');
  res.write('      <a href="button_about">');
  res.write('        <img id="Button_About_Header" src="' + strFullPath + 'Button_About_Header.png" width="54" height="38" border="0" alt="About" /></a></td>');
  res.write('    <td rowspan="2">');
  res.write('      <img id="NanoHID_Header_960x72_12" src="' + strFullPath + 'NanoHID_Header_960x72_12.png" width="25" height="64" alt="" /></td>');
  res.write('  </tr>');
  res.write('  <tr>');
  res.write('    <td>');
  res.write('      <img id="NanoHID_Header_960x72_13" src="' + strFullPath + 'NanoHID_Header_960x72_13.png" width="54" height="26" alt="" /></td>');
  res.write('    <td>');
  res.write('      <img id="NanoHID_Header_960x72_14" src="' + strFullPath + 'NanoHID_Header_960x72_14.png" width="54" height="26" alt="" /></td>');
  res.write('    <td>');
  res.write('      <img id="NanoHID_Header_960x72_15" src="' + strFullPath + 'NanoHID_Header_960x72_15.png" width="54" height="26" alt="" /></td>');
  res.write('    <td>');
  res.write('      <img id="NanoHID_Header_960x72_16" src="' + strFullPath + 'NanoHID_Header_960x72_16.png" width="54" height="26" alt="" /></td>');
  res.write('    <td>');
  res.write('      <img id="NanoHID_Header_960x72_17" src="' + strFullPath + 'NanoHID_Header_960x72_17.png" width="54" height="26" alt="" /></td>');
  res.write('  </tr>');
  res.write('</table>');
  res.write('<!-- End Save for Web Slices -->');

*/

////   NEW on 5/18/2015  ///////  Hover_Buttons : Start
 res.write('<!-- Save for Web Slices (NanoHID_Tabs_960x88.psd) -->');
 res.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0">');
 res.write('  <tr>');
 res.write('    <td>');
 res.write('      <img id="NanoHID_Tabs_960x88_01" src="' + strFullPath + 'NanoHID_Tabs_960x88_01.png" width="31" height="88" alt="" /></td>');
 res.write('<td>');
 res.write('<table class="tabs2" border="0" cellpadding="0" cellspacing="0">');
 res.write('<tr>');
 res.write('    <td>');
  res.write('      <a href="button_network_setup" target="">');
  res.write('        <img id="Button_Network_Setup" src="' + strFullPath + 'Button_Network_Setup.png" width="150" height="88" border="0" alt="User Guide" /></a></td>');
 res.write('    <td>');
  res.write('      <a href="https://www.youtube.com/channel/UCfHkl7-As8ycrRVbJ3I7Zvg" target="_blank">');
  res.write('        <img id="Button_YouTube" src="' + strFullPath + 'Button_YouTube.png" width="149" height="88" border="0" alt="YouTube" /></a></td>');
 res.write('    <td>');
  res.write('      <a href="button_updates" target="">');
  res.write('        <img id="Button_Updates" src="' + strFullPath + 'Button_Updates.png" width="150" height="88" border="0" alt="Check for software updates" /></a></td>');
 res.write('    <td>');
  res.write('      <a href="http://support.iboxprinters.com" target="_blank">');
  res.write('        <img id="Button_Forums" src="' + strFullPath + 'Button_Forums.png" width="151" height="88" border="0" alt="Forums" /></a></td>');
 res.write('    <td>');
  res.write('      <a href="button_manufandtest" target="">');
  res.write('        <img id="Button_Wiki" src="' + strFullPath + 'Button_ManufAndTest.png" width="149" height="88" border="0" alt="Manufacturing and Test" /></a></td>');
 res.write('    <td>');
  res.write('      <a href="button_settings_advanced" target="">');
  res.write('        <img id="Button_Settings_Advanced" src="' + strFullPath + 'Button_Settings_Advanced.png" width="150" height="88" border="0" alt="Advanced Settings" /></a></td>');
 res.write('</tr>');
 res.write('</table>');
 res.write('</td>');
 res.write('    <td>');
 res.write('      <img id="NanoHID_Tabs_960x88_08" src="' + strFullPath + 'NanoHID_Tabs_960x88_08.png" width="30" height="88" alt="" /></td>');
 res.write('  </tr>');
 res.write('</table>');
 res.write('<!-- End Save for Web Slices -->');

////   END NEW 5/18/2015  /////    Hover_Buttons : End
/*
  // TABS  ///////////////////////////////////////////////

  res.write('<!-- Save for Web Slices (NanoHID_Tabs_960x88.psd) -->');
  res.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0">');
  res.write('  <tr>');
  res.write('    <td>');
  res.write('      <img id="NanoHID_Tabs_960x88_01" src="' + strFullPath + 'NanoHID_Tabs_960x88_01.png" width="31" height="88" alt="" /></td>');
  res.write('    <td>');
  res.write('      <a href="button_network_setup" target="">');
  res.write('        <img id="Button_Network_Setup" src="' + strFullPath + 'Button_Network_Setup.png" width="150" height="88" border="0" alt="User Guide" /></a></td>');
  res.write('    <td>');
  res.write('      <a href="https://www.youtube.com/channel/UCfHkl7-As8ycrRVbJ3I7Zvg" target="_blank">');
  res.write('        <img id="Button_YouTube" src="' + strFullPath + 'Button_YouTube.png" width="149" height="88" border="0" alt="YouTube" /></a></td>');
  res.write('    <td>');
  res.write('      <a href="button_updates" target="">');
  res.write('        <img id="Button_Updates" src="' + strFullPath + 'Button_Updates.png" width="150" height="88" border="0" alt="Check for software updates" /></a></td>');
  res.write('    <td>');
  res.write('      <a href="http://support.iboxprinters.com" target="_blank">');
  res.write('        <img id="Button_Forums" src="' + strFullPath + 'Button_Forums.png" width="151" height="88" border="0" alt="Forums" /></a></td>');
  res.write('    <td>');
  res.write('      <a href="button_manufandtest" target="">');
  res.write('        <img id="Button_Wiki" src="' + strFullPath + 'Button_ManufAndTest.png" width="149" height="88" border="0" alt="Manufacturing and Test" /></a></td>');
  res.write('    <td>');
  res.write('      <a href="button_settings_advanced" target="">');
  res.write('        <img id="Button_Settings_Advanced" src="' + strFullPath + 'Button_Settings_Advanced.png" width="150" height="88" border="0" alt="Advanced Settings" /></a></td>');
  res.write('    <td>');
  res.write('      <img id="NanoHID_Tabs_960x88_08" src="' + strFullPath + 'NanoHID_Tabs_960x88_08.png" width="30" height="88" alt="" /></td>');
  res.write('  </tr>');
  res.write('</table>');
  res.write('<!-- End Save for Web Slices -->');
*/
  /// BODY - Home/Main : INFINITY //////////////////////////////////////////////

res.write('<!-- Save for Web Slices (NanoHID_Body_Infinity_960xInfinity.psd) -->');
res.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0">');
res.write(' <tr>');
res.write('   <td width="23" height="" bgcolor="#242424">');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="23" height="" alt="" /></td>');
//res.write('   <td width="907" height="608" bgcolor="#1B1B1B">INFINITY TEXT BODY</td>');
res.write('   <td width="907" height="" bgcolor="#1B1B1B" >');

res.write('<table id="Table_01" width="907" border="0" cellpadding="20" cellspacing="0">');
res.write(' <tr>');
res.write('   <td width="23" height="" bgcolor="#242424">');

////////// SPLIT : START  ////////////////////////////////////





  //res = ibp_settings.main(req, res);
  //res.write('<!-- Just got back from ibp_settings -->');
  
  res.write('<p style="color:#00ceef">');
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="+1" COLOR="#ffff00">');
  
  //<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#ffff00">
  res.write('<div id="header" align="center"><FONT STYLE="' + strFontStyle + '" SIZE="+2" COLOR="#c6c6c6"><h2>Advanced Settings</h2></FONT></div>');
  //res.write('<br><br>');
  /*
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Back Button to Home ////
  ///////////////////////////////////////////////////
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<input type="submit" value="Back">');
  res.write('</form>');
  //res.write('<br>');
  */

  strFree_RAM = String(os.freemem()/1000000).substring(0,6);
  var strRaw = String(os.loadavg())
  var aryCPU = strRaw.split(',');
  //strCPU = aryCPU[1].substring(0,3);
  strCPU = String(aryCPU[2]*100).substring(0,3) + "%"; //  1 , 5 , 15min lookback/avg of CPU i.e. [2] = 5min avg lookback of CPU
  
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  //  Load current Config DATA//////////////////  //
  // Reload config in case it just changed or was modified:
  fsSystem_Load();
  fsConfig_Load();
  res.write('<div id="nav">');
  res.write("</FONT>");
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">');
  strURL_Submit = 'http://' + strIPAddress + '/update_hostname';
  res.write('<form name="input" action="' + strURL_Submit + '" method="get">');


  res.write('<input type="submit" value="Change Network Name">');

  strNetworkName = os.hostname();

  res.write('Network Name: <input size="80" type="text" name="Hostname" value="' + strNetworkName + '">');
  res.write('<br>*You can only use alphanumeric characters in your network name. Spaces and most other characters are not allowed including / . < > } { [ ] , ) ( + - _ = ! @ # $ % ^ & *');

  res.write('<br><br>You can access this device from the network by:<br>-IP address: ' + strIPAddress + '<br>-Network Name: ' + strNetworkName + '.local');
  res.write('<br>');
    res.write('</form>');

  res.write('<br>');
  res.write('<br>');
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Back Button to Home ////
  ///////////////////////////////////////////////////
  
  res.write('<br>');
  res.write('<form name="input" action="http://' + strIPAddress + '" method="get">');
  res.write('<input type="submit" value=" Home ">');
  res.write('</form>');

  //res.write('<br>');
  res.write('<form name="input" action="http://' + strIPAddress + '/button_settings" method="get">');
  res.write('<input type="submit" value=" Back to Settings ">');
  res.write('</form>');
  

  //response.write('<br>Request Object:' + request.url)

  res.write('</table></center></body></html>');
  res.write('</FONT>');

  res.write('</body>');
  res.write('</html>');
  res.end();


  // showNetworkSetup END
}

function showAdvancedSettings( req, res ) {
  //  Pull header from ibp_settings.main(req, res);    // showAdvancedSettings START   // showAdvancedSettings START
  diskspace.check('/', function (err, total, free, status)
  {
    strFree_HD = String(free/1000000).substring(0,7);   
  });
  //header( res );
  res.write('<!-- showAdvancedSettings Started -->');

  var strFullPath = "http://" + strIPAddress + ':8000/images/' ; 
  var strFontStyle = ('font-family: lucida sans typewriter, courier new, monospace;');    

  res.write('<html><body bgcolor="#1B1B1B">');
  res.write('<center><table class="layout" border="0" width="960" bgcolor="#000000">');
  res.write('<head>');
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#c6c6c6">');
  //res.write('<title>iBox Nano - Advanced Settings</title>');
  res.write('<title>iBox Nano - Advanced Settings - ' + strZeroConfigName + '</title>');
  res.write('<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />');
  res.write('<link rel="icon" href="' + strApacheRootLink + 'favicon-32.png" sizes="32x32">');
  res.write('<link rel="shortcut icon" type="image/x-icon" href="' + strApacheRootLink + 'favicon.ico"/>');
  res.write('</head><p>');

  res.write('<body bgcolor="#FFFFFF">');

    ///  Tab Bar with CSS : Start  ////////////////////////////////////
    header_css( res, "button_settings_advanced");
    /////////// Tab Br with CSS : End  ////////////////////////////////////
    /*
  res.write('<!-- Save for Web Slices (NanoHID_Header_960x72.psd) -->');
  res.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0">');
  res.write('  <tr>');
  res.write('    <td colspan="11">');
  res.write('      <img id="NanoHID_Header_960x72_01" src="' + strFullPath + 'NanoHID_Header_960x72_01.png" width="960" height="8" alt="" /></td>');
  res.write('  </tr>');
  res.write('  <tr>');
  res.write('    <td rowspan="2">');
  res.write('      <img id="NanoHID_Header_960x72_02" src="' + strFullPath + 'NanoHID_Header_960x72_02.png" width="601" height="64" alt="" /></td>');
  res.write('    <td>');
  res.write('      <a href="button_settings">');
  res.write('        <img id="Button_Refresh_Header" src="' + strFullPath + 'Button_Refresh_Header.png" width="54" height="38" border="0" alt="Refresh" /></a></td>');
  res.write('    <td rowspan="2">');
  res.write('      <img id="NanoHID_Header_960x72_04" src="' + strFullPath + 'NanoHID_Header_960x72_04.png" width="46" height="64" alt="" /></td>');
  res.write('    <td>');
  res.write('      <a href="button_home">');
  res.write('        <img id="Button_Home" src="' + strFullPath + 'Button_Home.png" width="54" height="38" border="0" alt="Home" /></a></td>');
  res.write('    <td rowspan="2">');
  res.write('      <img id="NanoHID_Header_960x72_06" src="' + strFullPath + 'NanoHID_Header_960x72_06.png" width="6" height="64" alt="" /></td>');
  res.write('    <td>');
  res.write('      <a href="button_help">');
  res.write('        <img id="Button_Help_Header" src="' + strFullPath + 'Button_Help_Header.png" width="54" height="38" border="0" alt="Help" /></a></td>');
  res.write('    <td rowspan="2">');
  res.write('      <img id="NanoHID_Header_960x72_08" src="' + strFullPath + 'NanoHID_Header_960x72_08.png" width="6" height="64" alt="" /></td>');
  res.write('    <td>');
  res.write('      <a href="button_settings">');
  res.write('        <img id="Button_Settings_Header" src="' + strFullPath + 'Button_Settings_Header.png" width="54" height="38" border="0" alt="Settings" /></a></td>');
  res.write('    <td rowspan="2">');
  res.write('      <img id="NanoHID_Header_960x72_10" src="' + strFullPath + 'NanoHID_Header_960x72_10.png" width="6" height="64" alt="" /></td>');
  res.write('    <td>');
  res.write('      <a href="button_about">');
  res.write('        <img id="Button_About_Header" src="' + strFullPath + 'Button_About_Header.png" width="54" height="38" border="0" alt="About" /></a></td>');
  res.write('    <td rowspan="2">');
  res.write('      <img id="NanoHID_Header_960x72_12" src="' + strFullPath + 'NanoHID_Header_960x72_12.png" width="25" height="64" alt="" /></td>');
  res.write('  </tr>');
  res.write('  <tr>');
  res.write('    <td>');
  res.write('      <img id="NanoHID_Header_960x72_13" src="' + strFullPath + 'NanoHID_Header_960x72_13.png" width="54" height="26" alt="" /></td>');
  res.write('    <td>');
  res.write('      <img id="NanoHID_Header_960x72_14" src="' + strFullPath + 'NanoHID_Header_960x72_14.png" width="54" height="26" alt="" /></td>');
  res.write('    <td>');
  res.write('      <img id="NanoHID_Header_960x72_15" src="' + strFullPath + 'NanoHID_Header_960x72_15.png" width="54" height="26" alt="" /></td>');
  res.write('    <td>');
  res.write('      <img id="NanoHID_Header_960x72_16" src="' + strFullPath + 'NanoHID_Header_960x72_16.png" width="54" height="26" alt="" /></td>');
  res.write('    <td>');
  res.write('      <img id="NanoHID_Header_960x72_17" src="' + strFullPath + 'NanoHID_Header_960x72_17.png" width="54" height="26" alt="" /></td>');
  res.write('  </tr>');
  res.write('</table>');
  res.write('<!-- End Save for Web Slices -->');
*/
////   NEW on 5/18/2015  ///////  Hover_Buttons : Start
 res.write('<!-- Save for Web Slices (NanoHID_Tabs_960x88.psd) -->');
 res.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0">');
 res.write('  <tr>');
 res.write('    <td>');
 res.write('      <img id="NanoHID_Tabs_960x88_01" src="' + strFullPath + 'NanoHID_Tabs_960x88_01.png" width="31" height="88" alt="" /></td>');
 res.write('<td>');
 res.write('<table class="tabs2" border="0" cellpadding="0" cellspacing="0">');
 res.write('<tr>');
 res.write('    <td>');
  res.write('      <a href="button_network_setup" target="">');
  res.write('        <img id="Button_Network_Setup" src="' + strFullPath + 'Button_Network_Setup.png" width="150" height="88" border="0" alt="User Guide" /></a></td>');
 res.write('    <td>');
  res.write('      <a href="https://www.youtube.com/channel/UCfHkl7-As8ycrRVbJ3I7Zvg" target="_blank">');
  res.write('        <img id="Button_YouTube" src="' + strFullPath + 'Button_YouTube.png" width="149" height="88" border="0" alt="YouTube" /></a></td>');
 res.write('    <td>');
  res.write('      <a href="button_updates" target="">');
  res.write('        <img id="Button_Updates" src="' + strFullPath + 'Button_Updates.png" width="150" height="88" border="0" alt="Check for software updates" /></a></td>');
 res.write('    <td>');
  res.write('      <a href="http://support.iboxprinters.com" target="_blank">');
  res.write('        <img id="Button_Forums" src="' + strFullPath + 'Button_Forums.png" width="151" height="88" border="0" alt="Forums" /></a></td>');
 res.write('    <td>');
  res.write('      <a href="button_manufandtest" target="">');
  res.write('        <img id="Button_Wiki" src="' + strFullPath + 'Button_ManufAndTest.png" width="149" height="88" border="0" alt="Manufacturing and Test" /></a></td>');
 res.write('    <td>');
  res.write('      <a href="button_settings_advanced" target="">');
  res.write('        <img id="Button_Settings_Advanced" src="' + strFullPath + 'Button_Settings_Advanced.png" width="150" height="88" border="0" alt="Advanced Settings" /></a></td>');
 res.write('</tr>');
 res.write('</table>');
 res.write('</td>');
 res.write('    <td>');
 res.write('      <img id="NanoHID_Tabs_960x88_08" src="' + strFullPath + 'NanoHID_Tabs_960x88_08.png" width="30" height="88" alt="" /></td>');
 res.write('  </tr>');
 res.write('</table>');
 res.write('<!-- End Save for Web Slices -->');

////   END NEW 5/18/2015  /////    Hover_Buttons : End

/*
  // TABS  ///////////////////////////////////////////////

  res.write('<!-- Save for Web Slices (NanoHID_Tabs_960x88.psd) -->');
  res.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0">');
  res.write('  <tr>');
  res.write('    <td>');
  res.write('      <img id="NanoHID_Tabs_960x88_01" src="' + strFullPath + 'NanoHID_Tabs_960x88_01.png" width="31" height="88" alt="" /></td>');
  res.write('    <td>');
  res.write('      <a href="button_network_setup" target="">');
  res.write('        <img id="Button_Network_Setup" src="' + strFullPath + 'Button_Network_Setup.png" width="150" height="88" border="0" alt="User Guide" /></a></td>');
  res.write('    <td>');
  res.write('      <a href="https://www.youtube.com/channel/UCfHkl7-As8ycrRVbJ3I7Zvg" target="_blank">');
  res.write('        <img id="Button_YouTube" src="' + strFullPath + 'Button_YouTube.png" width="149" height="88" border="0" alt="YouTube" /></a></td>');
  res.write('    <td>');
  res.write('      <a href="button_updates" target="">');
  res.write('        <img id="Button_Updates" src="' + strFullPath + 'Button_Updates.png" width="150" height="88" border="0" alt="Check for software updates" /></a></td>');
  res.write('    <td>');
  res.write('      <a href="http://support.iboxprinters.com" target="_blank">');
  res.write('        <img id="Button_Forums" src="' + strFullPath + 'Button_Forums.png" width="151" height="88" border="0" alt="Forums" /></a></td>');
  res.write('    <td>');
  res.write('      <a href="button_manufandtest" target="">');
  res.write('        <img id="Button_Wiki" src="' + strFullPath + 'Button_ManufAndTest.png" width="149" height="88" border="0" alt="Manufacturing and Test" /></a></td>');
  res.write('    <td>');
  res.write('      <a href="button_settings_advanced" target="">');
  res.write('        <img id="Button_Settings_Advanced" src="' + strFullPath + 'Button_Settings_Advanced.png" width="150" height="88" border="0" alt="Advanced Settings" /></a></td>');
  res.write('    <td>');
  res.write('      <img id="NanoHID_Tabs_960x88_08" src="' + strFullPath + 'NanoHID_Tabs_960x88_08.png" width="30" height="88" alt="" /></td>');
  res.write('  </tr>');
  res.write('</table>');
  res.write('<!-- End Save for Web Slices -->');
*/
  /// BODY - Home/Main : INFINITY //////////////////////////////////////////////

res.write('<!-- Save for Web Slices (NanoHID_Body_Infinity_960xInfinity.psd) -->');
res.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0">');
res.write(' <tr>');
res.write('   <td width="23" height="" bgcolor="#242424">');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="23" height="" alt="" /></td>');
//res.write('   <td width="907" height="608" bgcolor="#1B1B1B">INFINITY TEXT BODY</td>');
res.write('   <td width="907" height="" bgcolor="#1B1B1B" >');

res.write('<table id="Table_01" width="907" border="0" cellpadding="20" cellspacing="0">');
res.write(' <tr>');
res.write('   <td width="23" height="" bgcolor="#242424">');

////////// SPLIT : START  ////////////////////////////////////



  //res = ibp_settings.main(req, res);
  //res.write('<!-- Just got back from ibp_settings -->');
  
  res.write('<p style="color:#00ceef">');
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="+1" COLOR="#ffff00">');
  
  //<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#ffff00">
  res.write('<div id="header" align="center"><FONT STYLE="' + strFontStyle + '" SIZE="+2" COLOR="#c6c6c6"><h2>Advanced Settings</h2></FONT></div>');
  //res.write('<br><br>');
  /*
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Back Button to Home ////
  ///////////////////////////////////////////////////
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<input type="submit" value="Back">');
  res.write('</form>');
  //res.write('<br>');
  */

  strFree_RAM = String(os.freemem()/1000000).substring(0,6);
  var strRaw = String(os.loadavg())
  var aryCPU = strRaw.split(',');
  //strCPU = aryCPU[1].substring(0,3);
  strCPU = String(aryCPU[2]*100).substring(0,3) + "%"; //  1 , 5 , 15min lookback/avg of CPU i.e. [2] = 5min avg lookback of CPU
  
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  //  Load current Config DATA//////////////////  //
  // Reload config in case it just changed or was modified:
  fsSystem_Load();
  fsConfig_Load();
  res.write('<div id="nav">');
  res.write("</FONT>");
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">');
  strURL_Config_Submit = 'http://' + strIPAddress + '/submit_config';
  res.write('<form name="input" action="' + strURL_Config_Submit + '" method="get">');
  Object.keys(myConfig).forEach(function (key) {

    // ----------------- Pasted from showSettings --- BASIC ----- >>  START
    
   if (key == "config_name") {
      res.write('Configuration Name: <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
      //  Save as new Form  //
      //res.write('<br>' + key + ': <input type="text" name="' + key + '" value="Change Form">');
      res.write('&nbsp;<input type="submit" value="Save As New Config File">&nbsp;Enter new name then [Save as]');
      res.write('<br>');
    }else if(key == "config_description") {
      res.write('Configuration Description: <input size="80" type="text" name="' + key + '" value="' + myConfig[key] + '">');
      res.write('');
      res.write('<br>');
    }else if(key == "iGlobal_Z_Layer_Thickness") {
      res.write('Layer Thickness: <input type="text" name="' + key + '" value="' + int(myConfig[key]) + '">');
      res.write(' microns');
      res.write('<br>');
    }else if(key == "iExposure_Time") {
      res.write('All Layers : Exposure Time: <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
      res.write(' sec');
      res.write('<br>');
    }else if(key == "fExposure_Time_Initial_Model_Layers") {
      res.write('First Layers : Over-Exposure Time: <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
      res.write(' sec');
      res.write('<br>');
    }else if(key == "iModel_Layers_To_Overexpose") { //  Overexposed First Layers
      //res.write('Number of Base Layers: <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
      res.write('First Layers : Over-Exposure Layer Count: <select name="' + key + '">');
      for(var i=0; i<30 ;i++){
        iKeyVal = int(myConfig[key]);
        if(iKeyVal == i) {
          res.write('  <option value="' + i + '" selected>' + i + '</option>');
        }else{
          res.write('  <option value="' + i + '">' + i + '</option>');
        }
      }
      res.write('</select>');
      res.write(' Layers [For better build plate stick]');
      res.write('<br>');
      
     }else if(key == "fExposure_Power_mA") {
      res.write('UV-LED Drive Current: <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
      res.write(' mA');
      res.write('<br>');
    }else if(key == "iPixel_Over_LED_Mode") { 
      res.write('<br>');
      //res.write('Pixel Over UV-LED Mode : <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
      res.write('<br>Pixel Over UV-LED Mode : <select name="' + key + '">');

      if(myConfig[key] == '0') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="0"' + strSelected + '>Off : 0</option>');

      if(myConfig[key] == '1') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="1"' + strSelected + '>UAP Future Mode : 1</option>'); //  was UAP@Full_PWR

      if(myConfig[key] == '2') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="2"' + strSelected + '>UAP Basic : 2</option>');

      if(myConfig[key] == '3') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="3"' + strSelected + '>UAP+Min_LED_Count : 3</option>');

      if(myConfig[key] == '4') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="4"' + strSelected + '>UAP+Adjacent_LED : 4</option>');

      if(myConfig[key] == '5') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="5"' + strSelected + '>UAP Future Mode : 5</option>'); //  was UAP+AdjacentLED@Full_PWR
      res.write('</select>');
      res.write(' Under Active Pixel (UAP) LED Control');
      //res.write('<br> 0=Off : 1= UAP@Full_PWR : 2=UAP@OEM Cal PWR : 3=UAP@Equalized PWR : 4=UAP+AdjacentLED@OEM Cal PWR : 5=UAP+AdjacentLED@Full_PWR :: Key: UAP=Under Active Pixel'); 
      //res.write('<br>');
    }else if(key == "iPixel_Over_LED_Power") { 
      ////////// START  Pixel over LED Power  /////////////////////////////////////////////////
      res.write('<br>Pixel Over UV-LED Power : <select name="' + key + '">');

      if(myConfig[key] == '0') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="0"' + strSelected + '>Default : Calibrated PWM from current profile</option>');

      if(myConfig[key] == '1') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="1"' + strSelected + '>Full PWM : 100% PWM</option>');

      if(myConfig[key] == '2') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="2"' + strSelected + '>Dynamically averaged PWM : Averaged from Calibrated PWM</option>');

      res.write('</select>');
      res.write(' UV-LED PWM');
      res.write('<br>'); ////////// END Pixel over LED Power  /////////////////////////////////////////////////

    }else if(key == "iFoundation_Layer_Count") { 
      //res.write('Number of base layers before model starts : <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
      res.write('<br>Foundation Layer Count: <select name="' + key + '">');
      for(var i=0; i<41 ;i++){
        iKeyVal = int(myConfig[key]);
        if(iKeyVal == i) {
          res.write('  <option value="' + i + '" selected>' + i + '</option>');
        }else{
          res.write('  <option value="' + i + '">' + i + '</option>');
        }
      }
      res.write('</select>');
      res.write(' Base Layers');
      res.write('<br>');
    }else if(key == "iFoundation_Layer_Type") { 
      //res.write('Base Layer Type : <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
      //res.write(' 0=Model Footprint 1=20x20mm Square 3=20mm Circle 5=40x20mm Rectangle');
      res.write('Foundation Layer Type: <select name="' + key + '">');
      if(myConfig[key] == '0') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="0"' + strSelected + '>Model Footprint</option>');
      if(myConfig[key] == '1') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="1"' + strSelected + '>20x20mm Square</option>');
      if(myConfig[key] == '2') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="2"' + strSelected + '>20mm Circle</option>');
      if(myConfig[key] == '3') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="3"' + strSelected + '>40x20mm Rectangle</option>');
      ///  Option Start  ///
      if(myConfig[key] == '4') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="4"' + strSelected + '>40x20mm Square Blocks</option>');
      /// Option End ////
      ///  Option Start  ///
      if(myConfig[key] == '5') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="5"' + strSelected + '>40x20mm Square with 9mm Holes</option>');
      /// Option End ////
      ///  Option Start  ///
      if(myConfig[key] == '6') {
        strSelected = " selected"
      }else{
        strSelected = ""
      }
      res.write('  <option value="6"' + strSelected + '>Test Object</option>');
      /// Option End ////
      res.write('</select>');
      //res.write(' Layers')
      res.write('<br>');    
     }else if(key == "fFoundation_Layer_Current") {
      res.write('Foundation UV-LED Current: <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
      res.write(' mA');
      res.write('<br>');
     }else if(key == "fFoundation_Layer_Duration") {
      res.write('Foundation Exposure Time: <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
      res.write(' sec');
      res.write('<br>');

      // ----------------- Pasted from showSettings --- BASIC ----- >>  END

     }else if(key == "iLCD_Contrast") {
      
      res.write('<p>LCD Contrast Setting: <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
      res.write(' Contrast');//(*Expert Setting with 23 and 86 being peaks)');
      res.write('<br>');
    //}else if(key == "iPixel_Over_LED_Mode") { 
    //  res.write('Pixel Over UV-LED Mode : <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
    //  res.write('<br> 0=Off : 1= UAP@Full_PWR : 2=UAP@OEM Cal PWR : 3=UAP@Equalized PWR : 4=UAP+AdjacentLED@OEM Cal PWR : 5=UAP+AdjacentLED@Full_PWR :: Key: UAP=Under Active Pixel');     
    //  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#ffff00"> <br>');  //<p>  ---- Advanced Settings ----
    }else if(key == "iOEM_Calibrated_UV_LED_PWM") {
      res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#ffff00"> <br>'); //  <p>  ---- Advanced Settings ----
      res.write('<br>');
      res.write('OEM Calibrated UV LED PWM Values : [0=Off : 100=Full Brightness]<br><input size="118" type="text" name="' + key + '" value="' + myConfig[key] + '">');
      res.write('<br>Use the table below to visualize the LEDs. LED 1=bottom right. LED 28=top left');        
          
    ////////////////// --- Table for calibration values for array: Notes:
    //  1. Center Pixels will be brighter than outer ones due to 15degree spread combination, thus coresponding inner LEDs ones will need to be "dimmed", reducing power on overexposed pixels
    //  2. Pixels at the rear of the screen are more transmissive than at the front due to LCD angle vs transmissiveness. Rear = 100% : center = 90% : front = 50% in refrence to radiation received at 45deg to pixel. See notes E7 in notebook 70s show
    //  1. Split iOEM_Calibrated_UV_LED_PWM to array/list
    res.write('<br>---  Top View of LED array i.e. The closest row to this text is the back of the machine ---')
    var arrayOEM_Calibrated_UV_LED_PWM = String(myConfig[key]).split(',');
        res.write('<table border="1" style="background-color:#000000;border-collapse:collapse;border:1px solid #0000FF;color:#FFFFFF;width:800" cellpadding="3" cellspacing="3" >')
  // 1  //
        res.write('<tr>')
        for (var i = 27; i >27-7; i--) {
            res.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
            //res.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
        }
  res.write('</tr>')
        //  2  //
        res.write('<tr>')
        for (var i = 27-7; i >27-7-7; i--) {
            res.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
            //res.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
        }
  res.write('</tr>')
        //  3  //
          res.write('<tr>')
        for (var i = 27-7-7; i >27-7-7-7; i--) {
            res.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
            //res.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
        }
  res.write('</tr>')
        //  4  //
        res.write('<tr>')
        for (var i = 27-7-7-7; i >27-7-7-7-7; i--) {
            res.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
            //res.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
        }
        res.write('</tr>')
        //  Three more copies here
        res.write('</table>')
        res.write('<br>');
      res.write('     --------------------  Front of machine --------------------')
      res.write('<br>');
      
    }else if(key == "iGlobal_Z_Height_Retract") {
      res.write('Build Plate Extraction Height [Stage 1]: <input type="text" name="' + key + '" value="' + int(myConfig[key]) + '">');
      res.write(' Millimeters to move build plate up after print');
      res.write('<br>');
    }else if(key == "iGlobal_Z_Height_Position_For_Print") {
      res.write('First Print Z Down Distance : If using Auto Zero Z: <input type="text" name="' + key + '" value="' + int(myConfig[key]) + '">');
      res.write(' Millimeters to move build plate udown searching for First Layer Height');
      res.write('<br>');
    }else if(key == "iGlobal_Z_Height_Peel_Stage_1") {
      res.write('Peel Height [Stage 1]: <input type="text" name="' + key + '" value="' + int(myConfig[key]) + '">');
      res.write(' microns');
      res.write('<br>');
    }else if(key == "iGlobal_Z_Height_Peel_Stage_2") {
      res.write('Peel Height [Stage 2]: <input type="text" name="' + key + '" value="' + int(myConfig[key]) + '">');
      res.write(' microns');
      res.write('<br>');
    }else if(key == "iSteps_Per_100_Microns") {
      res.write('Stepper Motor : Steps Per 100 Microns: <input type="text" name="' + key + '" value="' + int(myConfig[key]) + '">');
      res.write(' Steps/100 Microns');
      res.write('<br>');
    }else{
      res.write( key + ': <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
      res.write('<br>');
    }
    
    //console.log;
    //console.log(key);
    //console.log(myConfig[key]);
  });
  res.write('<input type="submit" value="Save Config">');


  
  res.write('</form>');
  res.write('</div>');
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">');
  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  //  CHANGE Config File   /////////////////////////////////////
  res.write('<div id="change_config"">');
  //  Offer to load OTHER config file  //
  //  Step 1 : Make a list by parsing DIR or reading some file

  var files = fs.readdirSync(strConfigDirectory);
  var jsonAry = [];
  for(var i in files) {
     if(path.extname(files[i]) == ".json") {
        var fileName = files[i];
         // Add to list  //
         //if(fileName != (strSystem_File_Name + strSettingsFile_Ext)) {
            var strFilenameNoExt = fileName;
            jsonAry.push(strFilenameNoExt.replace(".json",""));
         //}
         //console.log("fileName[",i,"]=",fileName);
         
         
     }
     
  }
  //  Step 2 : Present list in drop down box
  //console.log("jsonAry=",jsonAry);
  res.write('Load Config File');  //&nbsp;&nbsp;&nbsp;
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/change_config';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<select name="config_name">');
  for (var i = 0; i < jsonAry.length; i++) {
    var strFileCleaned = jsonAry[i];
    strFileCleaned = strFileCleaned.replace("+"," ");
    res.write('<option value="' + strFileCleaned + '">' + strFileCleaned + '</option>');
    
  }
  res.write('</select>');
  //  Step 3 : Add new Submit button, and look for it, or use a seperate form-> maybe best idea. Maybe a Table layout with two Horiz
  //  Nested Form?
  res.write('<input type="submit" value="Load Config File">');
  res.write('</form>');
  res.write('</div>');
  
  
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  DElete  Config  ////
  ///////////////////////////////////////////////////
    //  Bottom HTML  /////////////////////////////////////
  res.write('<div id="delete_config"">');
  //  Offer to load OTHER config file  //
  //  Step 1 : Make a list by parsing DIR or reading some file

  var files = fs.readdirSync(strConfigDirectory);
  var jsonAry = [];
  for(var i in files) {
     if(path.extname(files[i]) == ".json") {
        var fileName = files[i];
         // Add to list  //
         if(fileName != (strSystem_File_Name + strSettingsFile_Ext)) {
            var strFilenameNoExt = fileName;
            jsonAry.push(strFilenameNoExt.replace(".json",""));
         }
         //console.log("fileName[",i,"]=",fileName);
     } 
  }
  //  Step 2 : Present list in drop down box
  //console.log("jsonAry=",jsonAry);
  res.write('Delete Config File');  //&nbsp;&nbsp;&nbsp;
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/delete_config';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<select name="config_name">');
  for (var i = 0; i < jsonAry.length; i++) {
    var strFileCleaned = jsonAry[i];
    strFileCleaned = strFileCleaned.replace("+"," ");
    //console.log("(strConfig_File_Name + strSettingsFile_Ext)"+(strConfig_File_Name + strSettingsFile_Ext)+" != strFileCleaned:" + strFileCleaned)
    if((strConfig_File_Name) != strFileCleaned) {
      res.write('<option value="' + strFileCleaned + '">' + strFileCleaned + '</option>');
      }
  }
  res.write('</select>');
  //  Step 3 : Add new Submit button, and look for it, or use a seperate form-> maybe best idea. Maybe a Table layout with two Horiz
  //  Nested Form?
  res.write('<input type="submit" value="Delete Config File">');
  res.write('</form>');
  res.write('</div>');
  
  ////  Download a Profile config from Host  //
  res.write('<br>');
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Upload a Config file; CHOOSE FILE then press the UPLOAD button</FONT>');
  res.write(
    '<form action="/upload_config_files" enctype="multipart/form-data" method="post">'+
    '<input type="file" name="upload" multiple="multiple"><br>'+
    '<input type="submit" value="UPLOAD">'+
    '</form>'
  );
  res.write('<br>');
  
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Download Config File ////
  ///////////////////////////////////////////////////
  res.write('Download Config Files'); 
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/download_config';
  //res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  //res.write('<form onsubmit="this.action = document.getElementById("filename").value">');
  //res.write('<select name="config_name">');
  //res.write('<select id="filename">');
  //res.write('<select id="dwl">');
  for (var i = 0; i < jsonAry.length; i++) {
    var strFileCleaned = jsonAry[i];
    res.write('<br>');
    strFileCleaned = strFileCleaned.replace("+"," ");
    //res.write('<option value="' + strConfigDirectory_WebDownload + strFileCleaned + '.json">' + strFileCleaned + '</option>');
    res.write('<a href="' + strConfigDirectory_WebDownload + strFileCleaned + '.json" download="' + strFileCleaned + '.json">' + strFileCleaned + '</a>');
    
    //<a href="/images/myw3schoolsimage.jpg" download>
  }
  res.write('<br>');
  //res.write('</select>');
  //res.write('<input type="submit" value="Download Config File">');
  //res.write('<input type="submit" value="Download" class="grey-btn" />');
  //res.write('<input type="button" onclick="window.location.href=document.getElementById("dwl").value" value="Download" class="grey-btn" />');
  res.write('</form>');
  res.write('</div>');
  
  res.write('<br>');
  res.write('System Configuration');
  //res.write('<br>');
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  System Config ////
  ///////////////////////////////////////////////////
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/edit_system_config';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<input type="submit" value="Edit System Config">');
  res.write('</form>');
  
  res.write('<br>');
  res.write('System Logs : Log Management Page - Download / Archine and Delete logs');
  //res.write('<br>');
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  System Logs ////
  ///////////////////////////////////////////////////
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/show_logs';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<input type="submit" value="System Logs">');
  res.write('</form>');
  
  res.write('<br>');
  
    //  Delete Log Files Button
  res.write('<b>You should Archive or Delete your system logs periodically so they do not consume too much system resources:</b>');
     //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Archive Logs ////
  ///////////////////////////////////////////////////
  strURL = 'http://' + strIPAddress + '/archive_logs';
  res.write('<form name="input" action="' + strURL + '" method="get">');
  res.write('<input type="submit" value="Archive Logs + restart">');
  res.write(' Archiving compresses and stores your logs where they take up almost no space but can still be accessed if needed. This process will restart your GUI after it completes. This will terminate any current print job.');
  res.write('</form>');
  res.write('');

   //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Delete Logs ////
  ///////////////////////////////////////////////////
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/delete_logs';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<input type="submit" value="Delete Logs">');
  res.write(' Deleting your logs will remove them from your device.');
  res.write('</form>');
  
  
  res.write('<br><br>');
  
  /*
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Back Button to Home ////
  ///////////////////////////////////////////////////
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<input type="submit" value="Back">');
  res.write('</form>');
  
  res.write("</FONT>");

  //  from ibp_settings.js
  res.write('</table></center></body></html>');
  res.write('</FONT>');

  res.write('</body>');
  res.write('</html>');
  //  end from ibp_settings.js
  //res.end();
  */



//res.write('<br>');

/*
//////////////////////////////////////////////////////////////////////////////////////////////////////
////  Manufacturing and Test ////
///////////////////////////////////////////////////
strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_on';
res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
res.write('<input type="submit" value="Manufacturing and Test Mode - ON">');
res.write('</form>');
res.write('&nbsp');
strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_on_calpwr';
res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
res.write('<input type="submit" value="Manufacturing and Test Mode - ON - Cal PWR">');
res.write('</form>');
res.write('&nbsp');
strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_calibrate_long';
res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
res.write('<input type="submit" value="Manufacturing and Test Mode - CALIBRATE: Long">');
res.write('</form>');
res.write('&nbsp');
strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_calibrate_quick';
res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
res.write('<input type="submit" value="Manufacturing and Test Mode - CALIBRATE: Quick">');
res.write('</form>');
res.write('&nbsp');
strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_calibrate_individual';
res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
res.write('<input type="submit" value="Manufacturing and Test Mode - CALIBRATE: Individual Method">');
res.write('</form>');
res.write('&nbsp');
strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_calibrate_converge';
res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
res.write('<input type="submit" value="Manufacturing and Test Mode - CALIBRATE: Converge">');
res.write('</form>');
res.write('&nbsp');
strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_generate_table';
res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
res.write('<input type="submit" value="Manufacturing and Test Mode - Generate All Tables">');
res.write('</form>');
res.write('&nbsp');
strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_generate_Power';
res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
res.write('<input type="submit" value="Manufacturing and Test Mode - Generate Power Tables">');
res.write('</form>');
res.write('&nbsp')
*/
/*
strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_off';
res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
res.write('<input type="submit" value="Manufacturing and Test Mode - OFF">');
res.write('</form>');
res.write('<br>');
*/

res.write('<br><b>Create Restore Point:</b>');
res.write('<br>Only do this if you have a known working Nano without issues.');
strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/create_restore_point';
res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
res.write('<input type="submit" value="Create Restore Point">');
res.write('<br>*Note: THIS IS VERY SLOW and the page does not refresh until the task is complete, so please wait. A restore point was created before your Nano was shipped to you, doing it now will create a new restore point with the current software version, models, settings etc, but is not nessessary.');

res.write('</form>');
res.write('<br>');


strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/fix_permissions_directory_packages';
res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
res.write('<input type="submit" value="Reset Permissions on iBox Packages Directory">');
res.write('</form>');
res.write('<br>');

strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/fix_permissions_directory_config';
res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
res.write('<input type="submit" value="Reset Permissions on Config File Directory">');
res.write('</form>');
res.write('<br>');

strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/fix_permissions_directory_www';
res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
res.write('<input type="submit" value="Reset Permissions on WWW directory">');
res.write('</form>');
res.write('<br>');

strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/fix_execute_permissions_directory_ibox';
res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
res.write('<input type="submit" value="Reset Execute Permissions on iBox directory">');
res.write('</form>');
res.write('<br>');

strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/delete_browse_json';
res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
res.write('<input type="submit" value="Reset Browse List">');
res.write('</form>');
res.write('<br>');

//fsCalibration_Save(); //Debug : Create Calibration File




//  5/17/2015 TRC //  Add a Input box with lots of debug stuff  //
strCRLF = '\r\n\r\n' //  double LF
 strDebug = 'General Debug Information:' + strCRLF +  strIPAddress + ' : ' + strZeroConfigName
 //strDebug = strDebug + Date + strCRLF
//  Log Memory usage
  strCMD = 'free -m'
  try { 
  eXcOut = execSync(strCMD);
    console.log(eXcOut);
    strDebug = strDebug + strCMD + ": " + eXcOut + strCRLF
  }catch (err) {
    console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
  }
  //  Log free diskspace
  diskspace.check('/', function (err, total, free, status)
  {
    strFree_HD = String(free/1000000).substring(0,7);   
    console.log('diskspace:' + strFree_HD)
    strDebug = strDebug + strFree_HD + strCRLF
  });



  strCMD = 'lsusb'
  try { 
  eXcOut = execSync(strCMD);
    console.log(eXcOut);
    strDebug = strDebug + strCMD + ": " + eXcOut + strCRLF
  }catch (err) {
    console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
  }

    strCMD = 'uname -a'
  try { 
  eXcOut = execSync(strCMD);
    console.log(eXcOut);
    strDebug = strDebug + strCMD + ": " + eXcOut + strCRLF
  }catch (err) {
    console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
  }

    strCMD = 'cat /proc/cpuinfo'
  try { 
  eXcOut = execSync(strCMD);
    console.log(eXcOut);
    strDebug = strDebug + strCMD + ": " + eXcOut + strCRLF
  }catch (err) {
    console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
  }

    strCMD = 'cat /proc/meminfo'
  try { 
  eXcOut = execSync(strCMD);
    console.log(eXcOut);
    strDebug = strDebug + strCMD + ": " + eXcOut + strCRLF
  }catch (err) {
    console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
  }
/*
    strCMD = 'sudo tail -f /var/log/syslog'
  try { 
  eXcOut = execSync(strCMD);
    console.log(eXcOut);
    strDebug = strCMD + ": " + strDebug + eXcOut + strCRLF
  }catch (err) {
    console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
  }

    strCMD = 'sudo tail /var/log/kern.log'
  try { 
  eXcOut = execSync(strCMD);
    console.log(eXcOut);
    strDebug = strCMD + ": " + strDebug + eXcOut + strCRLF
  }catch (err) {
    console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
  }

    strCMD = 'sudo service --status-all '
  try { 
  eXcOut = execSync(strCMD);
    console.log(eXcOut);
    strDebug = strCMD + ": " + strDebug + eXcOut + strCRLF
  }catch (err) {
    console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
  }
  */

    strCMD = 'sudo ifconfig'
  try { 
  eXcOut = execSync(strCMD);
    console.log(eXcOut);
    strDebug = strDebug + strCMD + ": " + eXcOut + strCRLF
  }catch (err) {
    console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
  }

    strCMD = 'dmesg'
  try { 
  eXcOut = execSync(strCMD);
    console.log(eXcOut);
    strDebug = strDebug + strCMD + ": " + eXcOut + strCRLF
  }catch (err) {
    console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
  }
/*
    strCMD = 'sudo iwconfig'
  try { 
  eXcOut = execSync(strCMD);
    console.log(eXcOut);
    strDebug = strCMD + ": " + strDebug + eXcOut + strCRLF
  }catch (err) {
    console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
  }
*/
  //   Print to input box
//res.write('<br>System Information: <input type="text" style="width:100%;" name="System_Information" value="' + strDebug + '">');
//res.write('<br><div id="content" style="width:100%;"> <input style="width:100%;" type="text" name="System_Information" value="' + strDebug + '"></div>'); 
res.write('<br><textarea name="System_Information" cols="60" rows="50" style="width:100%;">' + strDebug + '</textarea>');
res.write('<br>');

//////////////////////////////////////////////////////////////////////////////////////////////////////
////  Create Preview images for currently selected Model //// 
///////////////////////////////////////////////////
strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/gen_thumb';
res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
res.write('<input type="submit" value="Generate Model Preview Images">&nbsp&nbsp Debug Only.');
res.write('<br>This should never be needed because model preview images are automatically created when the model is imported and created. This will take a few minutes to complete'); 
res.write('</form>');

res.write('<br>');

//////////////////////////////////////////////////////////////////////////////////////////////////////
////  VIEW Preview images for currently selected Model ////
///////////////////////////////////////////////////
/*
strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/show_thumb';
res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
res.write('<input type="submit" value="View Model Preview Images">');
res.write('</form>');
*/

  res.write(' </tr>');
res.write('</table>');
////////// SPLIT : END  ////////////////////////////////////
res.write('   </td>');
res.write('   <td width="30" height="" bgcolor="#242424">');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="30" height="" alt="" /></td>');
res.write(' </tr>');
res.write('</table>');
res.write('<!-- End Save for Web Slices -->');

  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Back Button to Home ////
  ///////////////////////////////////////////////////
  
  res.write('<br>');
  res.write('<form name="input" action="http://' + strIPAddress + '" method="get">');
  res.write('<input type="submit" value=" Home ">');
  res.write('</form>');

  //res.write('<br>');
  res.write('<form name="input" action="http://' + strIPAddress + '/button_settings" method="get">');
  res.write('<input type="submit" value=" Back to Settings ">');
  res.write('</form>');
  

  //response.write('<br>Request Object:' + request.url)

  /*
  res.write('</table></center></body></html>');
  res.write('</FONT>');

  res.write('</body>');
  res.write('</html>');
  */
  var myTime = Math.floor((new Date).getTime()/1000);
  res.write('<br>' + myTime);
  footer (res);
  res.end();


  // showAdvancedSettings END
}

function showSystemLogs( res ) { //  System Logs  /// START
  header( res );

  ///  Tab Bar with CSS : Start  ////////////////////////////////////
  header_css( res, "show_logs");
  /////////// Tab Br with CSS : End  ////////////////////////////////////

  res.write('<p style="color:#00ceef">');
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="+1" COLOR="#00ceef">');
  
  
  res.write('<div id="header"><h1>iBox Nano : System Logs</h1></div>');
  
  //////////////   System Logs  ///////////////////////////////////////////
  //  We have the logs in the Forever Logs, so just load or link the log file  //
  
  //  StdOut Log - i.e. console logs
  var fileSizeInMegabytes = 0
  res.write('<br>Nano Firmware Logs: (Most information in this file)');
  strLogFile_FullPath = 'http://' + strIPAddress + ':8000/logs/iBoxWebGUI_Forever_StdOut.log'
  strLogFile_LocalPath = '/home/pi/ibox/www/logs/iBoxWebGUI_Forever_StdOut.log'
  //  Get log file size  //
  if( fs.existsSync(strLogFile_LocalPath) ) {
      stats = fs.statSync(strLogFile_LocalPath)
      fileSizeInBytes = stats["size"]
      //Convert the file size to megabytes (optional)
      fileSizeInMegabytes = fileSizeInBytes / 1000000.0  
  }
  res.write('<a href="' + strLogFile_FullPath + '" download="' + strLogFile_FullPath + '">' + strLogFile_FullPath + '</a> <br>File Size: ' + fileSizeInMegabytes + ' MBytes<br>');
  
  res.write('<br>Nano Error Logs: (usually blank)');
  //  Error Log - Havent seen anything in this one
  strLogFile_FullPath = 'http://' + strIPAddress + ':8000/logs/iBoxWebGUI_Forever_Err.log'
  strLogFile_LocalPath = '/home/pi/ibox/www/logs/iBoxWebGUI_Forever_Err.log'
  //  Get log file size  //
  if( fs.existsSync(strLogFile_LocalPath) ) {
      stats = fs.statSync(strLogFile_LocalPath)
      fileSizeInBytes = stats["size"]
      //Convert the file size to megabytes (optional)
      fileSizeInMegabytes = fileSizeInBytes / 1000000.0  
  }
  res.write('<a href="' + strLogFile_FullPath + '" download="' + strLogFile_FullPath + '">' + strLogFile_FullPath + '</a> <br>File Size: ' + fileSizeInMegabytes + ' MBytes<br>');
  

  res.write('<br>Nano Service Monitor Logs: (Forever Service watching Nano Service)');
    //  Forever Regular Log - i.e. having to restart service
  strLogFile_FullPath = 'http://' + strIPAddress + ':8000/logs/iBoxWebGUI_Forever_Log.log'
  strLogFile_LocalPath = '/home/pi/ibox/www/logs/iBoxWebGUI_Forever_Log.log'
  //  Get log file size  //
  if( fs.existsSync(strLogFile_LocalPath) ) {
      stats = fs.statSync(strLogFile_LocalPath)
      fileSizeInBytes = stats["size"]
      //Convert the file size to megabytes (optional)
      fileSizeInMegabytes = fileSizeInBytes / 1000000.0  
  }
  res.write('<a href="' + strLogFile_FullPath + '" download="' + strLogFile_FullPath + '">' + strLogFile_FullPath + '</a> <br>File Size: ' + fileSizeInMegabytes + ' MBytes<br>');
  
  /////  Dynamically list archived files, ONLY if archived folder exists / //////////////
  strLogFile_LocalPath = '/home/pi/ibox/www/logs/archives/'
  //  Get log file size  //
  if( fs.existsSync(strLogFile_LocalPath) ) {
      stats = fs.statSync(strLogFile_LocalPath)
      fileSizeInBytes = stats["size"]
      //Convert the file size to megabytes (optional)
      fileSizeInMegabytes = fileSizeInBytes / 1000000.0  
      //  Trent : 5/20/2015 : NOT reporting dir size need to use a recursive function like: Just like my methof of selecting socks, this is NOT important. http://stackoverflow.com/questions/7529228/how-to-get-totalsize-of-files-in-directory

      //strMsg = ('Log Archives are consuming a total of [' + fileSizeInMegabytes + '] MBytes')
      //console.log(strMsg);
      //res.write('<br>' + strMsg);
      //  Loop through and list them  //
      var files = fs.readdirSync(strLogFile_LocalPath);
      var jsonAry = [];
      for(var i in files) {
         if(path.extname(files[i]) == ".tar") {
            var fileName = files[i];
             // Add to list  //
             if(fileName != '.DS_Store') {
                var strFilenameNoExt = fileName;
                jsonAry.push(strFilenameNoExt); //.replace(".json","")
             }
             //console.log("fileName[",i,"]=",fileName);
         } 
      }

      //////////////////////////////////////////////////////////////////////////////////////////////////////
      ////  Create links to Archived Log Files ////
      ///////////////////////////////////////////////////
      res.write('<br><br>Here is a list of your Archived Logs:<br>'); 

      for (var i = 0; i < jsonAry.length; i++) {
        var strFileCleaned = jsonAry[i];
        res.write('<br>');
        strFileCleaned = strFileCleaned.replace("+"," ");
        //  Get log archive file size  //
        strLogFile_LocalPath = strLogFile_LocalPath + strFileCleaned
        strLogFile_WWWPath = 'http://' + strIPAddress + ':8000/logs/archives/' + strFileCleaned
        if( fs.existsSync(strLogFile_LocalPath) ) {
            stats = fs.statSync(strLogFile_LocalPath)
            fileSizeInBytes = stats["size"]
            //Convert the file size to megabytes (optional)
            fileSizeInMegabytes = fileSizeInBytes / 1000000.0  
        }
        //res.write('<option value="' + strConfigDirectory_WebDownload + strFileCleaned + '.json">' + strFileCleaned + '</option>');
        //res.write('<a href="' + strConfigDirectory_WebDownload + strFileCleaned + '.json" download="' + strFileCleaned + '.json">' + strFileCleaned + '</a>');
        res.write('<br><a href="' + strLogFile_WWWPath + '" download="' + strLogFile_WWWPath + '">' + strLogFile_WWWPath + '</a> <br>File Size: ' + fileSizeInMegabytes + ' MBytes<br>');
  
        //<a href="/images/myw3schoolsimage.jpg" download>
      }


  } //  end archives 




  ///////////////////////////////////////////////////////////////////////////////

  //res.write(strSystem_logs_All)
  
      //  Delete Log Files Button
  res.write('<br><br><b>You should Archive or Delete your system logs periodically so they do not consume too much system resources:</b>');
     //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Archive Logs ////
  ///////////////////////////////////////////////////
  strURL = 'http://' + strIPAddress + '/archive_logs';
  res.write('<form name="input" action="' + strURL + '" method="get">');
  res.write('<input type="submit" value="Archive Logs + restart">');
  res.write(' Archiving compresses and stores your logs where they take up almost no space but can still be accessed if needed. This process will restart your GUI after it completes. This will terminate any current print job.');
  res.write('</form>');
  res.write('');

   //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Delete Logs ////
  ///////////////////////////////////////////////////
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/delete_logs';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<input type="submit" value="Delete Logs">');
  res.write(' Deleting your logs will remove them from your device.');
  res.write('</form>');
  /*
      //  Delete Log Files Button
  res.write('<br><br>You should delete your system logs periodically so they do not consume too much system resources.');
   //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Delete Logs ////
  ///////////////////////////////////////////////////
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/delete_logs';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<input type="submit" value="Delete Logs">');
  res.write('</form>');
  */
  res.write('<br>');
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Back Button to Home ////
  ///////////////////////////////////////////////////
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<input type="submit" value="Back">');
  res.write('</form>');
  
  res.write("</FONT>");

  footer (res);
}

function showSystemConfig_Web_Form( res ) { //  System Config  /// START
  header( res );
            ///  Tab Bar with CSS : Start  ////////////////////////////////////
    header_css( res, "edit_system_config");
    /////////// Tab Br with CSS : End  ////////////////////////////////////
  res.write('<p style="color:#00ceef">');
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="+1" COLOR="#00ceef">');
  
  
  res.write('<div id="header"><h1>iBox Nano : System Configuration</h1></div>');
  //res.write('<br>');
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Back Button to Home ////
  ///////////////////////////////////////////////////
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<input type="submit" value="Back">');
  res.write('</form>');
  //res.write('<br>');
  
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  //  Load current System DATA//////////////////  //
  // Reload config in case it just changed or was modified:
  fsSystem_Load();

  res.write('<div id="nav">');
  res.write("</FONT>");
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">');
  strURL_Config_Submit = 'http://' + strIPAddress + '/submit_system_config';
  res.write('<form name="input" action="' + strURL_Config_Submit + '" method="get">');
  Object.keys(mySystem).forEach(function (key) {
  //res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#ffff00"> <br><p>  ---- Advanced Settings ----');
  //res.write('<br>')    
    if (key == "Print_Counter") {
      res.write('Print Counter: <input type="text" name="' + key + '" value="' + mySystem[key] + '">');
      res.write(' Prints');
    }else if(key == "RPi_Serial_Number") {
      res.write('PRi Serial Number: <font color="#' + strFont_White + '">' + mySystem[key] + '</font>');
    }else if(key == "Prints_Started") {
      res.write('Number of Prints Started: <input type="text" name="' + key + '" value="' + mySystem[key] + '">');
      res.write(' Prints (should match [Print Counter])');
    }else if(key == "Prints_Finished") {
      res.write('Number of Prints Finished: <input type="text" name="' + key + '" value="' + mySystem[key] + '">');
      res.write(' Prints');
    }else if(key == "Print_Time") {
      res.write('Print Time: <input type="text" name="' + key + '" value="' + mySystem[key] + '">');
      res.write(' seconds');
    }else if(key == "Print_UV_Time") {
      res.write('Print UV Time: <input type="text" name="' + key + '" value="' + mySystem[key] + '">');
      res.write(' seconds');
    }else if(key == "Print_UV_Time_Per_LED") {
      res.write('Print UV Time / LED: <input type="text" name="' + key + '" value="' + mySystem[key] + '">');
      res.write(' seconds * PWM');
    }else if(key == "bSoundEnabled") {
      res.write('Enable Sound: <input type="text" name="' + key + '" value="' + mySystem[key] + '">');
      res.write(' true or false');
    }else if(key == "bPrinting_Option_Direct_Print_With_Z_Homing") {
      res.write('Lower Z to Endstop before printing: <input type="text" name="' + key + '" value="' + mySystem[key] + '">');
      res.write(' true or false');
    }else if(key == "bUse_Endstop") {
      res.write('Enable Z Endstop: <input type="text" name="' + key + '" value="' + mySystem[key] + '">');
      res.write(' true or false');
    }else if(key == "bLEDs_Enabled") {
      res.write('Enable LEDs: <input type="text" name="' + key + '" value="' + mySystem[key] + '">');
      res.write(' true or false');
    }else if(key == "bFast_Z") {
      res.write('Fast Z: <input type="text" name="' + key + '" value="' + mySystem[key] + '">');
      res.write(' true or false');
  res.write('<br>')     
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#ffff00"> <br><p>  ---- Very Advanced Settings : Dont Change ----');

    }else if(key == "Hardware_Version_Major") {
      res.write('Hardware Version Major: <input type="text" name="' + key + '" value="' + mySystem[key] + '">');
      res.write(' ');
    }else if(key == "Hardware_Version_Minor") {
      res.write('Hardware Version Minor: <input type="text" name="' + key + '" value="' + mySystem[key] + '">');
      res.write(' ');
    }else{
      res.write( key + ': <input type="text" name="' + key + '" value="' + mySystem[key] + '">');
    }
    res.write('<br>');
    //console.log;
    //console.log(key);
    //console.log(myConfig[key]);
  });
  res.write('<input type="submit" value="Save System Config">');


  
  res.write('</form>');
  res.write('</div>');
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">');
  


 
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Back Button to Home ////
  ///////////////////////////////////////////////////
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<input type="submit" value="Back">');
  res.write('</form>');
  
  res.write("</FONT>");

  footer (res);
} //  System Config  /// END

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////  File IO  //////////////////////////////////////////////////// START
function load_settings_from_file(fileName) {
  //  Load all of the printer settings from this file, I suppose Python will need to do the same.  //
  fs.exists(fileName, function(exists) {
    if (exists) {
      fs.stat(fileName, function(error, stats) {
        fs.open(fileName, "r", function(error, fd) {
          var buffer = new Buffer(stats.size);
   
          fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
            var data = buffer.toString("utf8", 0, buffer.length);
   
            console.log(data);
            fs.close(fd);
          });
        });
      });
    }
  });
}
function functionCreate_Watch_Settings_File_Callback(fileName) {
  fs.watch(fileName, {
    persistent: false
  }, function(event, filename) {
    console.log(event + " File Change event occurred on " + filename);
    //  Reload Settings  //
    load_settings_from_file(fileiBoxSettings); //  Hopefully this read does not trigger the change, thus an infinate loop ;)
  });
}


////////////////////////////////////////////  File IO  ////////////////////////////////////////////////////  END

function menu_item( response, item ){
  response.write( '<td align="center"><b><a href="/'+item+'">'+item+'</a></b></td>');
}

function menu( response ){ 
  response.write('</tr>');
  response.write('<tr><td colspan="'+menu_items.length.toString()+'" height="400" valign="top" padding="10px">');
}



function header( response ){
  response.writeHead(200, {'content-type': 'text/html'});
  /*response.writeHead(200, {  //304
          "Pragma": "public",
          "Cache-Control": "max-age=86400",
          "Expires": new Date(Date.now() + 86400000).toUTCString(),
          "Content-Type": 'image/jpg'}); //text/plain
  */


   
  response.write('<link rel="icon" href="' + strApacheRootLink + 'favicon-32.png" sizes="32x32">');
  response.write('<link rel="shortcut icon" type="image/x-icon" href="' + strApacheRootLink + 'favicon.ico"/>');
  response.write('<head>');
  response.write('<title>iBox Nano - ' + strZeroConfigName + '</title>');
  //response.write('<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />');
  //  Added to try and avoid Meta Refresh caching  //
  //response.write('<meta http-equiv="cache-control" content="max-age=10000" />');
  //response.write('<meta http-equiv="cache-control" content="no-cache" />');
  //response.write('<meta http-equiv="expires" content="10000" />');
  response.write('</head>');
  

  
  // DONT USE BACKGROND, at least not as the primary UI image : TRC
  //response.write('<html><body bgcolor="#888888" color="#224422" link="#224422" vlink="#228822" style="background-image:url(/ibox/images/HTML_HUD_Concept_2p4_960x768.png)">');
  response.write('<html><body bgcolor="#000000">');

  response.write('<center><table class="layout" border="0" width="960" bgcolor="#000000">');
  //response.write('<tr><td colspan="'+menu_items.length.toString()+'"><h1>iBox Nano - Web Interface</h1></td></tr>');
  menu( response );
}

function footer( response ){

  response.write( '</td></tr>');
  //response.write('<tr> <td colspan="2"> Server port = '+ port.toString()  +' </td>     <td colspan="'+(menu_items.length-2).toString()+'"> Status: Ready</td></tr>')
  response.write('<tr> <td width="480"><FONT STYLE="' + strFontStyle + '" SIZE="-1" COLOR="#484848"> Software: WebGUI:['+ strNodeJS_Software_Version  +'] : Firmware:[' + strPython_Software_Version + '] HC:[' + strNodeJS_Software_Version_Hard_Coded + ']</FONT> </td>');
  response.write('<td align="right" width="480"> <FONT STYLE="' + strFontStyle + '" SIZE="-1" COLOR="#484848">Connect Using: ' + strZeroConfigName + '.local OR ' + strIPAddress + '</FONT></td></tr>');
  
  response.write('</table></center></body></html>' );
  response.end();
}

function showAboutPage( response ){
  header( response );
  response.write('its all about the iBox Nano');
}

function showUploadForm_SVG( res ){
  // show a file upload form
  header( res );
  //res.write('Upload a file for printing');
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Upload a file for printing; CHOOSE FILE then press the UPLOAD button<br>');
  res.write('<br>Step 1: Choose a SVG File by pressing [Choose Files]. <br>')

  res.write('<form action="/upload_svg" enctype="multipart/form-data" method="post">')

  res.write('<input type="file" name="upload" multiple="multiple"><br>')
  res.write('<br><i>You will have likely created this SVG in Slic3r or similar modeling/slicing program.</i><br>')

  res.write('<br><br>Step 2: Upload your selected file by pressing [UPLOAD and CONVERT]. <br>')

  res.write('<input type="submit" value="UPLOAD and CONVERT">')
  res.write('</form>')
  
  
  res.write('</FONT>')
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Back Button to Home ////
  ///////////////////////////////////////////////////
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<input type="submit" value="Back">');
  res.write('</form>');
  footer (res);
}

function showUploadForm_IMG_DATA( res ){
  // show a file upload form
  header( res );
  //res.write('Upload a file for printing');
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Upload image files for printing; CHOOSE FILE then press the UPLOAD button</FONT>');
  res.write(
    '<form action="/upload_image_data" enctype="multipart/form-data" method="post">'+
    '<input type="file" name="upload" multiple="multiple"><br>'+
    '<input type="submit" value="UPLOAD">'+
    '</form>'
  );
  
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Back Button to Home ////
  ///////////////////////////////////////////////////
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<input type="submit" value="Back">');
  res.write('</form>');
}

function showUploadForm_CONFIG_FILES( res ){
  // show a file upload form
  header( res );
  //res.write('Upload a file for printing');
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Upload a Config File from your local host; CHOOSE FILE then press the UPLOAD button</FONT>');
  res.write(
    '<form action="/upload_config_files" enctype="multipart/form-data" method="post">'+
    '<input type="file" name="upload" multiple="multiple"><br>'+
    '<input type="submit" value="UPLOAD">'+
    '</form>'
  );
  
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Back Button to Home ////
  ///////////////////////////////////////////////////
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<input type="submit" value="Back">');
  res.write('</form>');
}


function showCheckForUpdatesForm( res ){
  // show a Check for Updates form

  //  Example Code: http://stackoverflow.com/questions/11944932/how-to-download-a-file-with-node-js
  var http = require('http');
  var fs = require('fs');
  
  //fsUpdates_Load(); // will log json data  //  DEBUG DONT DOWNLOAD  //
  //return;

  //strUpdateURL = "http://www.ba....th.com/documents/iBox_Updates/iBox_Nano_Update.json"
  strUpdateURL = "http://files.iboxprinters.com/updates/nano/iBox_Nano_Update.json"
  var request = http.get(strUpdateURL, function(response) {
    var strURL = 'http://' + strIPAddress ;
    
    if (response.statusCode === 200) {
      var path = strHomeDirectory + strUpdates_File_Name + strSettingsFile_Ext
      var file = fs.createWriteStream(path);
      response.pipe(file);
      response.on('end', function () {
        //console.log('response->on-end')
        //console.log('onend : File Exists' + fs.existsSync(path));
        //fsUpdates_Load(); // will log json data  //
        strURL = 'http://' + strIPAddress + '/button_load_updates_json';
        header( res );
        
        res.write('<meta http-equiv="refresh" content="3;URL=' + strURL + '">');
        
        res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Checking for Software Updates...</FONT>');
        
        //////////////////////////////////////////////////////////////////////////////////////////////////////
        ////  Back Button to Home ////
        ///////////////////////////////////////////////////
        strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '';
        res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
        res.write('<input type="submit" value="Exit Update">');
        res.write('</form>');
        
        footer( res );
      });
    }else{  //  Send back to home page
      strURL = 'http://' + strIPAddress + '/';
      header( res );
      res.write('<meta http-equiv="refresh" content="3;URL=' + strURL + '">');
      res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Update Server Not Found. Try again later......</FONT>');
      //////////////////////////////////////////////////////////////////////////////////////////////////////
      ////  Back Button to Home ////
      ///////////////////////////////////////////////////
      strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '';
      res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
      res.write('<input type="submit" value="Back">');
      res.write('</form>');
      footer( res );
    }
    // Add timeout.
    request.setTimeout(10000, function () {
      request.abort();
      header( res );
      res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#ff0000">Update Failed. Could not connect to iBox Servers. Try again later or contact support.</FONT>');
      //strURL = 'http://' + strIPAddress + '/';
      //res.write('<meta http-equiv="refresh" content="5;URL=' + strURL + '">');
      footer( res );
    });

  });
}

function showLoadJSONUpdates( res ) {
  
  header( res );
  strURL = 'http://' + strIPAddress + '/button_show_update_options';
  fsUpdates_Load();
  res.write('<meta http-equiv="refresh" content="3;URL=' + strURL + '">');
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Creating Update List...</FONT>');
  
  ///  Load Files List //
  console.log('showProcessUpdatesForm : About to download - iBox_Nano_Update_File_List')
  //strUpdateURL = "http://www.ba....th.com/documents/iBox_Updates/iBox_Nano_Update_File_List.json"
  strUpdateURL = "http://files.iboxprinters.com/updates/nano/iBox_Nano_Update_File_List.json"
  var request = http.get(strUpdateURL, function(response) {
    if (response.statusCode === 200) {
      var path = strHomeDirectory + strUpdate_File_List_File_Name + strSettingsFile_Ext
      var file = fs.createWriteStream(path);
      response.pipe(file);
      response.on('end', function () {
        console.log('showProcessUpdatesForm : DOWNLOADED - iBox_Nano_Update_File_List')
      });
    }
  });
  ///////////////////////
  
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Back Button to Home ////
  ///////////////////////////////////////////////////
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<input type="submit" value="Stop Update">');
  res.write('</form>');
  footer( res );
}

  
function showUpdateOptionsForm( res ){
  
  // show the results for Check for Updates form
  header( res );
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="3" COLOR="#00ceef">Update Options</FONT>');
  res.write('<br>');
  res.write('<br>');
 
  fsUpdates_Load(); // will log json data  //  //  moved to button_load_updates_json
  //fsSystem_Load();
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Show Current and Updatable file versions, dates, etc   ////
  ///////////////////////////////////////////////////
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">');
  ///  Current Version  //
  var strSoftware_Version_NodeJS_Major = "?"
  var strSoftware_Version_NodeJS_Minor = "?"
  var strSoftware_Version_Python_Major = "?"
  var strSoftware_Version_Python_Minor = "?"
  var strSoftware_Last_Update_Date = "?/?/?"
  Object.keys(mySystem).forEach(function (key) {
    if (key == "Version_NodeJS_Major") {
      strSoftware_Version_NodeJS_Major =  mySystem[key];
    }else if (key == "Version_NodeJS_Minor") {
      strSoftware_Version_NodeJS_Minor =  mySystem[key];
    }else if (key == "Version_Python_Major") {
      strSoftware_Version_Python_Major =  mySystem[key];
    }else if (key == "Version_Python_Minor") {
      strSoftware_Version_Python_Minor =  mySystem[key];
    }else if (key == "Last_Update_Date") {
      strSoftware_Last_Update_Date =  mySystem[key];
    }
  });
  strNodeJS_Software_Version = strSoftware_Version_NodeJS_Major + '.' + strSoftware_Version_NodeJS_Minor
  res.write('Current Web Server Version: ' + strNodeJS_Software_Version);
  res.write('<br>');
  strPython_Software_Version = strSoftware_Version_Python_Major + '.' + strSoftware_Version_Python_Minor
  res.write('Current Firmware Version: ' + strPython_Software_Version);
  res.write('<br>');
  res.write('Last Updated: ' + strSoftware_Last_Update_Date);
  res.write('<br>');
  res.write('<br>');
  res.write('<br>');
  
  /////////////////////////////////////////////////////////////////
  /////////  UPDATE VERSION  /////////////
  /////////////////////////////////////////////////////////////////
  
    Object.keys(myUpdates).forEach(function (key) {
    if (key == "Version_NodeJS_Major") {
      strSoftware_Version_NodeJS_Major =  myUpdates[key];
    }else if (key == "Version_NodeJS_Minor") {
      strSoftware_Version_NodeJS_Minor =  myUpdates[key];
    }else if (key == "Version_Python_Major") {
      strSoftware_Version_Python_Major =  myUpdates[key];
    }else if (key == "Version_Python_Minor") {
      strSoftware_Version_Python_Minor =  myUpdates[key];
    }else if (key == "Last_Update_Date") {
      strSoftware_Last_Update_Date =  myUpdates[key];
    }
  });
  strNodeJS_Software_Version = strSoftware_Version_NodeJS_Major + '.' + strSoftware_Version_NodeJS_Minor
  res.write('Update to Web Server Version: ' + strNodeJS_Software_Version);
  res.write('<br>');
  strPython_Software_Version = strSoftware_Version_Python_Major + '.' + strSoftware_Version_Python_Minor
  res.write('Update to Firmware Version: ' + strPython_Software_Version);
  res.write('<br>');
  res.write('Update Release Date: ' + myUpdates.Creation_Date);
  res.write('<br>');
  res.write('Release Notes: ' + myUpdates.Description);
  res.write('<br>');
  res.write('<br>');

  //  Return global software versions to defaults  //
  Object.keys(mySystem).forEach(function (key) {
    if (key == "Version_NodeJS_Major") {
      strSoftware_Version_NodeJS_Major =  mySystem[key];
    }else if (key == "Version_NodeJS_Minor") {
      strSoftware_Version_NodeJS_Minor =  mySystem[key];
    }else if (key == "Version_Python_Major") {
      strSoftware_Version_Python_Major =  mySystem[key];
    }else if (key == "Version_Python_Minor") {
      strSoftware_Version_Python_Minor =  mySystem[key];
    }else if (key == "Last_Update_Date") {
      strSoftware_Last_Update_Date =  mySystem[key];
    }
  });
  strNodeJS_Software_Version = strSoftware_Version_NodeJS_Major + '.' + strSoftware_Version_NodeJS_Minor
  
  /*
  //  Update Candidate  //
  Object.keys(myUpdates).forEach(function (key) {
    
    res.write('Name="' + key + '" value="' + myUpdates[key] + '">');
    
    res.write('<br>');
    
    if (key == "Description") {
      res.write('Update Description: ' + myConfig[key] + '">');
    }else if (key == "Creation_Date") {
      res.write('Created On: ' + myConfig[key] + '">');
    }else if (key == "Hardware_Version_Major") {
      res.write('Hardware Version ' + myConfig['Hardware_Version_Major'] + '.' + myConfig['Hardware_Version_Minor'] + '">');  
    }else{
      res.write("unused key");
    }
      //res.write('Update Description: <input type="text" name="' + key + '" value="' + myConfig[key] + '">');
    
  });
  */
  res.write('</FONT>');
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Update Button ////
  ///////////////////////////////////////////////////
  strURL = 'http://' + strIPAddress + '/button_process_updates';
  res.write('<form name="input" action="' + strURL + '" method="get">');
  res.write('<input type="submit" value="Update Now">');
  res.write('</form>');

  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Back Button to Home ////
  ///////////////////////////////////////////////////
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<input type="submit" value="Dont Update">');
  res.write('</form>');
  
  footer (res);
}

function showProcessUpdatesForm( res ){
  // Process Updates form
  header( res );
  var fs = require('fs');
  //res.write('<meta http-equiv="refresh" content="3;URL=' + strURL + '">');
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Processing Updates...</FONT>');
  res.write('<br>');
  res.write('<br>');
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">');
  // Download file list
    //  Example Code: http://stackoverflow.com/questions/11944932/how-to-download-a-file-with-node-js
  var http = require('http');
  //var fs = require('fs');

  //  Before each update, make a backup of the PYC file  //
  strSource = '/home/pi/ibox/iBoxPrintManager.pyc'
  strTarget = '/home/pi/ibox/iBoxPrintManager.pyc_backup'
    if ( fs.existsSync( strSource ) ) {
      try { 
        strCMD = 'sudo cp ' + strSource + ' ' + strTarget
        console.log('execSync: ' + strCMD)
        eXcOut = execSync(strCMD);
        res.write('Backing up PYC Object Code: ' + strCMD + '<br>');
        console.log(eXcOut);
      }catch (err) {
        console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
        res.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']')
      }
    }else{
      res.write('<br>Can not copy ' + strSource + ' because the file does not exist');
    }

  console.log('showProcessUpdatesForm : About to download - iBox_Nano_Update_File_List')
  // 1. Open file list json and download each file
  //data = fs.readFileSync(strHomeDirectory + strUpdate_File_List_File_Name + strSettingsFile_Ext) //
  //console.log('Populating myFileUpdateList')
  //myFileUpdateList = JSON.parse(data);
  fsFileList_Load();
  console.log(myFileUpdateList);
  var strFileNameSourceTMP = "";
  var strFileNameDestinationTMP = "";
  var strPathDownloadFileFrom = ""
  var strPathWriteFileTo = ""
  Object.keys(myFileUpdateList).forEach(function (key1) {
    if (key1 == "File_Count") {
      iFile_Download_Count_Total =  myFileUpdateList[key1];
      console.log('>iFile_Download_Count_Total=' + iFile_Download_Count_Total) //  only see once
      for(var i = 1; i <= iFile_Download_Count_Total; ++i) {
        strFileNameSourceTMP = 'File_Source_' + i;
        strFileNameDestinationTMP = 'File_Destination_' + i;
        Object.keys(myFileUpdateList).forEach(function (key2) {
          if (key2 == strFileNameSourceTMP) {
            strPathDownloadFileFrom = myFileUpdateList[key2];
            res.write('<br>Downloading: ' + strPathDownloadFileFrom);
            //res.write('<br>');
            //res.write('<br>');
            console.log('strFileNameSourceTMP =' + strFileNameSourceTMP + ' strPathDownloadFileFrom=' + strPathDownloadFileFrom )
            //  Get destination location  //
            Object.keys(myFileUpdateList).forEach(function (key3) {
              if (key3 == strFileNameDestinationTMP) {
                strPathWriteFileTo = myFileUpdateList[key3];
                console.log('strFileNameDestinationTMP =' + strFileNameDestinationTMP + ' strPathWriteFileTo=' + strPathWriteFileTo )
                //res.write('<br> -strFileNameDestinationTMP =' + strFileNameDestinationTMP + ' strPathWriteFileTo=' + strPathWriteFileTo);

                ///////////////////////////////////////
                /////////  Download File   ////////////
                ///////////////////////////////////////
                http_download4( res, strPathDownloadFileFrom ,  strPathWriteFileTo, function(){  //strPathWriteFileTo + 'tmp',
                  console.log('http_download : ' + strPathWriteFileTo + ' done........');
                  //res.write('<br> -http_download : ' + strPathWriteFileTo + ' done........');
                });
                /*
                http_download3( strPathDownloadFileFrom ,  strPathWriteFileTo, function(){  //strPathWriteFileTo + 'tmp',
                  console.log('http_download : ' + strPathWriteFileTo + ' done........');
                });
                */
                /*
                file = fs.createWriteStream(strPathWriteFileTo);
                var request = http.get(strPathDownloadFileFrom, function(response) {
                  //response.on('end', function () {
                  //  console.log("Response.On [END] with Status_Code=[" + response.statusCode + "]");
                  //}
                  response.on('error', function(err){
                      console.log(err);
                  });
                  response.on('data', function(data){
                      file.write(data);
                      console.log(strPathDownloadFileFrom + ' data in');
                  });
                  response.on('end', function(){ 
                      console.log(strPathDownloadFileFrom + ' completed, moving on');
                  });
                  

                  response.on('end', function () {
                    console.log("response.end on [" + strPathDownloadFileFrom +"] response.file=" + response.file );
                    file = fs.createWriteStream(strPathWriteFileTo);
                    response.pipe(file);
                    //  Copy to destinatiuon  complete //
                    console.log('Download [end] on ' + strPathDownloadFileFrom + ' >>> ' + strPathWriteFileTo);
                    res.write('Updating: ' + strPathWriteFileTo);
                    res.write('<br>');
                    res.write('<br>');
                  });
                  
                  if (response.statusCode === 200) {
                    console.log("Status Code 200 on [" + strPathDownloadFileFrom +"] response.file=" + response.file );
                  }else{
                    console.log('response.statusCode=[' + response.statusCode + '] on [' + strPathDownloadFileFrom +']');
                  }
                  
                });
                */
              }
            });
          }
        });
          
      }
    }
  });



  
  //////////////////////////////////////////////////////////
  ///////  Update mySystem with new software versions  /////
  //////////////////////////////////////////////////////////
  //strPrinter_State_Sm_2 = mySystem.Version_NodeJS_Major + "." + mySystem.Version_NodeJS_Minor + ":" + mySystem.Version_Python_Major + "." + mySystem.Version_Python_Minor
  mySystem.Version_NodeJS_Major = myUpdates.Version_NodeJS_Major
  mySystem.Version_NodeJS_Minor = myUpdates.Version_NodeJS_Minor
  mySystem.Version_Python_Major = myUpdates.Version_Python_Major
  mySystem.Version_Python_Minor = myUpdates.Version_Python_Minor
  mySystem.Last_Update_Date = myUpdates.Creation_Date
  fsSystem_Save();
  //  Delay
  fsConfig_Save();  //  Yes we are using the loading of myconfig as a delay
  fsSystem_Load(); //  so the software version will be correctly displayed on the home screen


  setTimeout( function(){
    res.write('<br>Restoring execute permissions on updated files...');
    try { 
      strCMD = 'sudo chmod +x /home/pi/ibox/*'
      console.log('strCMD : ' + strCMD)
      eXcOut = execSync(strCMD);
      console.log(eXcOut);
    }catch (err) {
      console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
    }
    try { 
      strCMD = 'sudo chmod +x /home/pi/nano*'
      console.log('strCMD : ' + strCMD)
      eXcOut = execSync(strCMD);
      console.log(eXcOut);
    }catch (err) {
      console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
    }

    res.write('</FONT>');      
    res.write('<br><br><FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Update Complete : A reboot is required to load the new software</FONT>');
    
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    ////  Restart Node JS ////
    ///////////////////////////////////////////////////
    strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/restart_nodejs';
    res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
    res.write('<input type="submit" value="Restart Printer Software Now">');
    res.write('You should restart your printer software before you can execute another "Software Update" or you could create an erroneous condition.');
    res.write('</form>');
    
      //////////////////////////////////////////////////////////////////////////////////////////////////////
    ////  Back Button to Home ////
    ///////////////////////////////////////////////////
    strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/';
    res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
    res.write('<input type="submit" value="Continue : Reboot Later">');
    res.write('</form>');
    
    footer( res );

  }, 4000 );


}

function showButtonPowerForm ( res ) {
  //  someone pressed the power button; oh no!
  header( res );
            ///  Tab Bar with CSS : Start  ////////////////////////////////////
    header_css( res, "button_power");
    /////////// Tab Br with CSS : End  ////////////////////////////////////
  //strURL = 'http://' + strIPAddress + '/button_reboot_rpi';
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">You can Reboot the system or just restart the printer software</FONT>');
  res.write('<br>')
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Restart Node JS ////
  ///////////////////////////////////////////////////
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/restart_nodejs';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<input type="submit" value="Restart Printer Software Now">');
  res.write('</form>');
  res.write('<br>')
  //res.write('<meta http-equiv="refresh" content="3;URL=' + strURL + '">');
  
  
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Reboot ////
  ///////////////////////////////////////////////////
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Reboot the iBox Nano</FONT>');
  strURL = 'http://' + strIPAddress + '/button_reboot_rpi';
  res.write('<form name="input" action="' + strURL + '" method="get">');
  res.write('<input type="submit" value="Reboot System Now">');
  res.write('</form>');

  res.write('<br>')

  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Reboot ////
  ///////////////////////////////////////////////////
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Reboot the iBox Nano and perform a file system check after restart</FONT>');
  strURL = 'http://' + strIPAddress + '/button_reboot_rpi_and_check_filesystem';
  res.write('<form name="input" action="' + strURL + '" method="get">');
  res.write('<input type="submit" value="Reboot System Now and Check Filesystem">');
  res.write('</form>');

  res.write('<br>')

  //res.write('<meta http-equiv="refresh" content="3;URL=' + strURL + '">');
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Shutdown the iBox Nano</FONT>');
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Shutdown ////
  ///////////////////////////////////////////////////
  strURL = 'http://' + strIPAddress + '/button_shutdown_rpi';
  res.write('<form name="input" action="' + strURL + '" method="get">');
  res.write('<input type="submit" value="Shutdown System Now">');
  res.write('</form>');
  
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Back Button to Home ////
  ///////////////////////////////////////////////////
  strURL = 'http://' + strIPAddress + '';
  res.write('<form name="input" action="' + strURL + '" method="get">');
  res.write('<input type="submit" value="Exit without Rebooting">');
  res.write('</form>');
  footer( res );
}

function http_download4 (res, remotePath, localFile,  callback) {
  console.log('http_download4 : STARTED');

  var request = http.get(remotePath, function(response) {
    // Buffer the body entirely for processing as a whole.
    var bodyChunks = [];
    strStatus_Code = response.statusCode
    console.log('statusCodestatusCodeFIRST: ', strStatus_Code); // <======= Here's the status code
    //res.write('<br> -statusCodeFIRST: ', response.statusCode);
    if( strStatus_Code != 200  ){
      res.write('<br> -ERROR: HTTP Status Code: ' + response.statusCode + ' received. The file [' + remotePath + '] was NOT downloaded and updated');
      console.log('ERROR: HTTP Status Code: ' + response.statusCode + ' received. The file [' + remotePath + '] was NOT downloaded and updated');
    }
    response.on('error', function(err){
        console.log(err);
        res.write('<br> -ERROR: ' + err);
    });
    response.on('data', function(chunk){
        bodyChunks.push(chunk);
        console.log(remotePath + ' data in');
    });
    response.on('end', function(){ 
        //  BECAUSE OF TRUNCATED FILES; I.E. 136,430 INSTEAD OF 136,433 we will add a 1 sec delay before saving the downloaded GET'ed file
        console.log(remotePath + ' completed, starting 2 sec delay before saving the downloaded file');
        //console.log('statusCode: ', response.statusCode); // <======= Here's the status code
        //res.write('<br> -statusCode: ', response.statusCode );
        strStatus_Code = response.statusCode;
        if( strStatus_Code == 404  ){
          console.log('ERROR: File [' + localFile + '] not found on server; server returned 404 error : Do not save the file, it likely contains a nice 404 error message')
        }else if(strStatus_Code == 200 ){ //.indexOf("200") > -1
          console.log('File was found on server and downloaded as expected.')
          setTimeout( function(){
            console.log(remotePath + ' completed');
            //res.write('<br> -Path:' + remotePath + ' completed');
            var body = Buffer.concat(bodyChunks);
            fs.writeFile(localFile, body, 'binary', function(err){
              if (err){
                  console.log(err);
              } else {
                  console.log("File:" + localFile + " saved");
                  //res.write('<br> -File:' + localFile + ' saved');
              }
            });
            //response.pipe(file);
            callback(null, localFile);
          }, 2000 );
        }else{
          console.log('HTTP Response=' + strStatus_Code + ' which was unexpected downloading file [' + localFile + ']');
        }
    });
  });
}


function http_download3 (remotePath, localFile,  callback) {
  console.log('http_download3 : STARTED');
  //file = fs.createWriteStream(localFile);
  /*
  var options = {
    host: url.parse(remotePath).host,
    port: 80,
    agent: true
    //path: url.parse(file_url).pathname
  };*/
  var request = http.get(remotePath, function(response) {
  //var request = http.get(options, function(response) {
    var downloaded_data = '';
    response.on('error', function(err){
        console.log(err);
    });
    response.on('data', function(data){
        //file.write(data);
        downloaded_data += data;
        console.log(remotePath + ' data in');
    });
    response.on('end', function(){ 
        //  BECAUSE OF TRUNCATED FILES; I.E. 136,430 INSTEAD OF 136,433 we will add a 1 sec delay before saving the downloaded GET'ed file
        console.log(remotePath + ' completed, starting 2 sec delay before saving the downloaded file');
        setTimeout( function(){
          console.log(remotePath + ' completed');
          fs.writeFile(localFile, downloaded_data, 'binary', function(err){
            if (err){
                console.log(err);
            } else {
                console.log("File:" + localFile + " saved");
            }
          });
          //response.pipe(file);
          callback(null, localFile);
        }, 2000 );

    });
  });
                  
  
}

function http_download2 (remotePath, localFile,  callback) {
  console.log('http_download2 : STARTED');
  var localStream = fs.createWriteStream(localFile);

  var out = http.request( remotePath );
  out.on('response', function (resp) {
    if (resp.statusCode === 200){
      console.log('status code 200');
      out.pipe(localStream);
      localStream.on('close', function () {
        callback(null, localFile);
      });
    }
    else
        callback(new Error("No file found at given url."),null);
  })
};

function http_download(url, tempFilepath, filepath, callback) { //http://stackoverflow.com/questions/12906694/fs-createwritestream-does-not-immediately-create-file
  console.log('http_download : STARTED');
    var fs = require('fs');
    var tempFile = fs.createWriteStream(tempFilepath);
    console.log('http_download : ' + url + ' : ' + filepath);
    tempFile.on('open', function(fd) {
        http.request(url, function(res) {
            res.on('data', function(chunk) {
                tempFile.write(chunk);
                console.log('chunk - ' + filepath);
            }).on('end', function() {  //on('end', function()
                tempFile.end();
                fs.renameSync(tempFile.path, filepath);
                console.log('file complete : renaming tmp to - ' + filepath);
                return callback(filepath);
            });
        });
    });
}

function showSelectFileForm( res ){
  // show a file SELECT form
  strFileExistingOrNew = "existing_file" //#"new_file : existing_file"
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Select EXISTING File To Print    ////
  ///////////////////////////////////////////////////
  header( res );
  res.write('<p style="color:#00ceef">');
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="+1" COLOR="#00ceef">');
  

  res.write('<div id="header"><h1>Select file from list of Uploaded Files</h1></div>');
  res.write('<div id="select_file_to_print"">');
  //  Offer to load OTHER config file  //
  //  Step 1 : Make a list by parsing DIR or reading some file

  var files = fs.readdirSync(strUploadPath_SVG);
  var jsonAry = [];
  for(var i in files) {
     if(path.extname(files[i]) == ".svg") {
        var fileName = files[i];
         // Add to list  //
         //if(fileName != (strUploadPath_SVG + strSettingsFile_Ext)) {
            var strFilename = fileName;
            //jsonAry.push(strFilenameNoExt.replace(".svg",""));
            jsonAry.push(strFilename);
         //}
         //console.log("fileName[",i,"]=",fileName);
     } 
  }
  //  Step 2 : Present list in drop down box
  //console.log("jsonAry=",jsonAry);
  res.write('Uploaded Files');  //&nbsp;&nbsp;&nbsp;
  strURL_TMP = 'http://' + strIPAddress + '/select_file_to_print';
  res.write('<form name="input" action="' + strURL_TMP + '" method="get">');
  res.write('<select name="file_name">');
  for (var i = 0; i < jsonAry.length; i++) {
    var strFileCleaned = jsonAry[i];
    strFileCleaned = strFileCleaned.replace("+"," ");
    //console.log("(strConfig_File_Name + strSettingsFile_Ext)"+(strConfig_File_Name + strSettingsFile_Ext)+" != strFileCleaned:" + strFileCleaned)
    //if((strConfig_File_Name + strSettingsFile_Ext) != strFileCleaned) {
      res.write('<option value="' + strFileCleaned + '">' + strFileCleaned + '</option>');
    //}
  }
  res.write('</select>');
  //  Step 3 : Add new Submit button, and look for it, or use a seperate form-> maybe best idea. Maybe a Table layout with two Horiz
  //  Nested Form?
  res.write('<input type="submit" value="Select File">');
  res.write('</form>');
  res.write('</div>');
  
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  HOME ////
  ///////////////////////////////////////////////////
  strURL_TMP = 'http://' + strIPAddress + '';
  res.write('<form name="input" action="' + strURL_TMP + '" method="get">');
  res.write('<input type="submit" value="Back">');
  res.write('</form>');
  
  footer (res);
}

//  Upload just happened, now what do we show the user?
function showConvert_SVG( res ){
  header(res);

  res.write('<p style="color:#00ceef">');
  res.write('<FONT STYLE="' + strFontStyle + '" SIZE="+1" COLOR="#00ceef">');
  res.write('<div id="header"><h1>Converting from Vector (SVG) to Raster</h1></div>');
  res.write('');
  res.write('<br><br>Your SVG will need to be converted from Vector to Raster.'); 
  res.write('<br><br>This process will take 10+ minutes. The actual duration will depend on the height of the Model.');
  res.write('<br><br>Your printers [Print] button will flash rapidly during the conversion.');
  res.write('<br><br>Then preview images of the model will be created, this will also take several minutes to complete. There will not be blinking lights on the top of the printer during this process.');
  res.write("<br>You can watch the green LED flash in the bottom right corner of the Nano during this process. When it is dont the green light will stop blinking, then press [Home]<br>");

  res.write('<br><br>For the moment there is no indication when the process is complete. So start it and be patient.');
  res.write('<br><br>');
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Back Button to Home ////
  ///////////////////////////////////////////////////
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/reload_mysystem';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<input type="submit" value="Home">');
  res.write('</form>');

    res.write('</font>');
  footer (res);

  //  Start Conversion from SVG to IBF  //
  console.log("SVG_Convert_To_IBF : START");
  iBoxPrintManager.stdin.write("SVG_Convert_To_IBF:" + lastFileName_FileName  + "\n" );  //mySystem.lastFileName_FileName
  console.log("SVG_Convert_To_IBF : END");
  //  Generate Thumbnails  //
  //  Called at the end of fcnParseXMLFromSVG in .py
  //console.log("model_generate_images : START");
  //ibp_generate_thumbnails.model_generate_images()
  //console.log("model_generate_images : END");
  //ibp_generate_thumbnails.model_images_show()


}
function showPrintPage_IMG_DATA( response ){
  showUploadForm_IMG_DATA( response );
}
function showPrintPage_CONFIG_FILES( response ){
  showUploadForm_CONFIG_FILES( response );
}

function metaLaunchHomePage( res ) {
  header( res );
  strURL = 'http://' + strIPAddress + '';
  res.write('<meta http-equiv="refresh" content="1;URL=' + strURL + '">');
  strURL_TMP = 'http://' + strIPAddress + '';
  res.write('<form name="input" action="' + strURL_TMP + '" method="get">');
  res.write('<input type="submit" value="Reboot">');
  res.write('</form>');
  footer (res);
}

function showSoftwareError( res ) {
  header( res );
  strURL = 'http://' + strIPAddress + '';
  //res.write('<meta http-equiv="refresh" content="1;URL=' + strURL + '">');
  strURL_TMP = 'http://' + strIPAddress + '';

  res.write('<br><br><FONT COLOR="#00ceef"> You have a serious software issue. We recommend updating your software.')
  res.write('<br>If the update does not work you can use the Boot_Restore feature or the USB File restore feature. <br>');
  res.write('<br>-The Boot Full Restore feature is when you hold down all three printer buttons during the boot process. *You may lose your settings, profiles and models.<br>');
  res.write('<br>To report this error to the iBox Team please include your software version from the bottom of this page.<br><br>')
  res.write('<form name="input" action="' + strURL_TMP + '/button_updates" method="get">');
  res.write('<input type="submit" value="Update Now">');
  res.write('</form>');
  footer (res);
}

//  Home Page - Landing Page  aka default.htm ish //
function showHomePage( req, res ){
  fcnUpdate_IP_Address();

  //  If this is the first load AND it has the master unit settings, send them to Production  //
  //  Make sure this is not a master dev station:
  if(((strZeroConfigName == 'trentsnano' && strIPAddress != '192.168.1.107') || (strZeroConfigName.indexOf("untested") > -1 ) ) && bFirst_HomePage_Load == true) {
    bFirst_HomePage_Load = false;
    console.log('This is a developer unit. sending to production page')
    ibp_production.main(req, res);
    return;
  }

  if(bRecommend_Update == true) {
    //  This means the software is hacing some type of systemic issue and you should update  //
    bRecommend_Update = false;
    //showCheckForUpdatesForm( res);
    showSoftwareError( res );
    return;
  }



  header( res );
  strURL = 'http://' + strIPAddress + '';

  var strTmp_Model_Name = mySystem.lastFileName_FileName;
  strModel_Name = strTmp_Model_Name.replace('.svg','');  //  Just leaves Model Dir name

  fcnSendClientSideSocketsIO_JS( res );
  //  Use Text Wranglers TEXT->Prefix/SuffixLines to add res.write(' and ');
  //  Use TextWragler SEARCH->FIND to replace "images/" with "' + strFullPath + '"  
  //  The LCD section will need to use BACKGROUND images so we can put text on top. This is somewhat a manual process.
  //  Images will be served from Apache at /var/www/images/
  //  There is a script in /ibox/ that copies the images from /ibox/images to /var/www/images to assist with refreshes of images

//  Text over Image example 
//res.write('<TABLE BORDER="0" cellpadding="0" CELLSPACING="0"><TR>');
//res.write('<TD WIDTH="360" HEIGHT="45" BACKGROUND="/ibox/images/LCD_Line_1.png" VALIGN="bottom">');
//res.write('<FONT SIZE="+1" COLOR="#00ceef">Printer: Ready...</FONT></TD></TR></TABLE>');

//  Web safe font list here: http://cssfontstack.com
//font-family: "Lucida Console", "Lucida Sans Typewriter", Monaco, "Bitstream Vera Sans Mono", monospace;


//  Clean "Message_GUI" from strPrinter_State
strPrinter_State = strPrinter_State.replace("Message_GUI","")

//  Update Display Text  // strPrinter_State == strText_LCD_Line_1_Default || 
iMeta_Refresh_Seconds = 26
//  Strip off the CR LF from string
strPrinter_State = strPrinter_State.replace("\n","")
if (strPrinter_State == "Rebooting") {
  //res.write('<meta http-equiv="refresh" content="100;URL=' + strURL + '">');
  iMeta_Refresh_Seconds = 300
}else if(strPrinter_State == "Printing Complete" || strPrinter_State == "Idle" || strPrinter_State == "Upload Completed" ||
    strPrinter_State == "Printing Canceled" || strPrinter_State == "Stop" || strPrinter_State == "Z Stopped" || strPrinter_State == "Ready"
    || strPrinter_State == "Nano Ready") {
  // Dont meta if there is nothing going on
  iMeta_Refresh_Seconds = 10000
}else if(strPrinter_State == "Printing" || strPrinter_State.indexOf("Printing") > -1 || strPrinter_State.indexOf("Prnt") > -1){ //  Print just started, need to update asap
  //res.write('<meta http-equiv="refresh" content="15;URL=' + strURL + '">');
  iStepperTime = ((int(myConfig.iGlobal_Z_Height_Peel_Stage_1) + int(myConfig.iGlobal_Z_Height_Peel_Stage_2)) * parseFloat(myConfig.fGlobal_Speed_Peel) * 2)
  iLayer_Time_Estimate = int(myConfig.iExposure_Time) + iStepperTime
  console.log('iStepperTime=' + iStepperTime + ' iLayer_Time_Estimate=' + iLayer_Time_Estimate);
  iMeta_Refresh_Seconds = iLayer_Time_Estimate
  //iMeta_Refresh_Seconds = 25
}else if(strPrinter_State.indexOf("Processing") > -1) {
  iMeta_Refresh_Seconds = 30;
}else if(strPrinter_State.indexOf("Printing") > -1){ // likely "Printing Layer N, so wait about a layer time, 20-30sec"
  //res.write('<meta http-equiv="refresh" content="' + iMeta_Refresh_Seconds +';URL=' + strURL + '">');
}else{
  //res.write('<meta http-equiv="refresh" content="300;URL=' + strURL + '">');
  iMeta_Refresh_Seconds = 300
}

console.log('strPrinter_State=[' + strPrinter_State + '] :: iMeta_Refresh_Seconds=[' + iMeta_Refresh_Seconds + ']')
//////////////////////////////////////////
///  Use META Refresh  /////////////
//////////////////////////////////////////
res.write('<meta http-equiv="refresh" content="' + iMeta_Refresh_Seconds +';URL=' + strURL + '" >');

res.write('<meta http-equiv="cache-control" content="max-age=10000" >');
res.write('<meta http-equiv="Cache-control" content="public">');

//////////////////////////////////////////
///  Use Javascript Refresh  /////////////
//////////////////////////////////////////
/*
iMeta_Refresh_MilliSeconds = iMeta_Refresh_Seconds * 1000;
res.write('<script type="text/javascript">')
res.write('function timedRefresh(timeoutPeriod) {')
res.write('   setTimeout("location.reload(true);",timeoutPeriod);}')
res.write('</script>')
res.write('<body onload="JavaScript:timedRefresh(' + iMeta_Refresh_MilliSeconds + ');"> // time : 5000= 5 secs')
*/


strText_LCD_Line_1 = strPrinter_State;
//lastFileName_FileName = lastFileName_FullPath.replace
lastFileName_FileNameTruncated = Truncate_File_Name(lastFileName_FileName,34);
if (lastFileName_FileNameTruncated != "") {
  strText_LCD_Line_2 = lastFileName_FileNameTruncated; //lastFileName_FileName;  //code
}



strText_LCD_Line_Print_ETA = strPrinter_State_Sm_2;

strImageFilePath = "/images/"
strFullPath = "http://" + strIPAddress + ':8000' + strImageFilePath; //  Apache is on port 8000 just to serve files FAST, Node.js is set up to also serve the files, but its slow.

//if (strPrinter_State_3 == '' || strPrinter_State_3 == strPrinter_State_3_Last) {
//  strText_LCD_Line_3 = mySystem.Selected_Config_File;
  //strText_LCD_Line_3 = 'IP: ' + strIPAddress + " : Config: " + mySystem.Selected_Config_File;
//}else{
  strText_LCD_Line_3 = strPrinter_State_3;
//}
strPrinter_State_3_Last = strPrinter_State_3; 

strText_LCD_Line_4 = mySystem.Selected_Config_File;

if (bReLaunch_NodeJs_Next_Home_Page_Load == true) {
  strText_LCD_Line_1 = "Rebooting"
  strText_LCD_Line_2 = "This will take ~30sec"
  strText_LCD_Line_3 = "Press refresh after the Nano reboots"
}
if( fs.existsSync(strKey_GCS_Management) && strText_LCD_Line_3.indexOf("ERROR") == -1) {
  biBoxTeam = true;
  strText_LCD_Line_3 = 'iBox Team Unit';
}else{
  biBoxTeam = false;
}

//  Put SVG on deck in browser if it exists  //
strImage_Printer = "/home/pi/ibox/images/LCD_Top_Right_Box.png";
if (lastFileName_Default != lastFileName_FileNameTruncated) {
  //  Load image  //
  //strImage_Printer = lastFileName_FullPath;
}
////res.write('			<img id="LCD_Top_Right_Box" src="' + strFullPath + 'LCD_Top_Right_Box.png" width="60" height="35" alt="" /></td>');
strSVG_Preview = ('<img id="LCD_Top_Right_Box" src="' + strImage_Printer + '" /></td>');//" width="60" height="35" alt=""

//  LCD Inserts  //
strSpaceFix = '';//<FONT SIZE="+3">&nbsp</FONT>';
//strFontStyle = ('font-family: "Arial Black", "Arial Bold", Gadget, sans-serif;');
strFirst = ('<TABLE BORDER="0" cellpadding="0" CELLSPACING="0"><TR>')+strSpaceFix;
strTail = ('</td>')
strTail = ('');

strColorBlue = '#00ceef'
strColorYellow = '#d3d31c';//ffff00';
strColorBlue_Dimmed = '#274e5e'
strColorYellow_Dimmed = '#8d8d40';
//  LCD Line 1  //
strText = strText_LCD_Line_1 ; //
strLast = ('<FONT STYLE="' + strFontStyle + '" SIZE="+3" COLOR="' + strColorBlue + '">' + strText + '</FONT></TD></TR></TABLE>' + strTail);
strLCD_1 = (strFirst + '<TD WIDTH="386" HEIGHT="42" BACKGROUND="' + strFullPath + 'Text_Line_1.png" VALIGN="bottom">' + strLast);
//  LCD Line 3  //
//var strTmp_Model_Name = mySystem.lastFileName_FileName;
strText_LCD_Line_2 = strText_LCD_Line_2.replace('.svg',''); 
strText = Truncate_File_Name(strText_LCD_Line_2,28); // was 22 at +2 // was 25 on 4/12/15
strLast = ('<FONT STYLE="' + strFontStyle + '" SIZE="+1" COLOR="' + strColorYellow + '">' + strText + '</FONT></TD></TR></TABLE>' + strTail);
strLCD_2 = (strFirst + '<TD WIDTH="386" HEIGHT="32" BACKGROUND="' + strFullPath + 'Text_Line_2.png" VALIGN="bottom">' + strLast);
//  LCD Line 3  //
strText = Truncate_File_Name(strText_LCD_Line_3,40); //  was 41 on 4/12/15
strLast = ('<FONT STYLE="' + strFontStyle + '" SIZE="+1" COLOR="' + strColorYellow + '">' + strText + '</FONT></TD></TR></TABLE>' + strTail);
strLCD_3 = (strFirst + '<TD WIDTH="436" HEIGHT="28" BACKGROUND="' + strFullPath + 'Text_Line_3.png" VALIGN="bottom">' + strLast);

//  LCD Line 4  //
strText = Truncate_File_Name(strText_LCD_Line_4,50); 
strLast = ('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="07ee0c">' + strText + '</FONT></TD></TR></TABLE>' + strTail);
strLCD_4 = (strFirst + '<TD WIDTH="436" HEIGHT="23" BACKGROUND="' + strFullPath + 'Text_Line_4.png" VALIGN="bottom">' + strLast);
strColor_Local = strColorBlue
//if( int(strText_LCD_Print_Percentage_Completed)==0) {
if(strPrinter_State.indexOf("Printing") > -1){
  strColor_Local = strColorBlue
}else{
  strColor_Local = strColorBlue_Dimmed
}
//  LCD Print ETA //
strText = strText_LCD_Line_Print_ETA; 
strLast = ('<center><FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="' + strColor_Local + '" VALIGN="center"">' + strText + '</FONT></center></TD></TR></TABLE>' + strTail);
strLCD_Print_Time_ETA = (strFirst + '<TD WIDTH="160" HEIGHT="30" BACKGROUND="' + strFullPath + 'Text_Line_Print_Time.png" VALIGN="middle">' + strLast);
//  LCD Print % Completed Text //

strText = strText_LCD_Print_Percentage_Completed + '%'; 
strLast = ('<center><FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="' + strColor_Local + '" VALIGN="center"">' + strText + '</FONT></center></TD></TR></TABLE>' + strTail);
strLCD_Print_Percentage_Completed = (strFirst + '<TD WIDTH="68" HEIGHT="30" BACKGROUND="' + strFullPath + 'Text_Line_Print_Percentage.png" VALIGN="middle">' + strLast);

iPrint_Percentage = int(strText_LCD_Print_Percentage_Completed)
strPercentage_Append = '_0'
if (iPrint_Percentage == 0) {
  strPercentage_Append = '_0'
}else if (iPrint_Percentage > 0 && iPrint_Percentage < 10){
  strPercentage_Append = '_1'
}else if (iPrint_Percentage >= 10 && iPrint_Percentage < 20){
  strPercentage_Append = '_2'
}else if (iPrint_Percentage >= 20 && iPrint_Percentage < 30){
  strPercentage_Append = '_3'
}else if (iPrint_Percentage >= 30 && iPrint_Percentage < 40){
  strPercentage_Append = '_4'
}else if (iPrint_Percentage >= 40 && iPrint_Percentage < 50){
  strPercentage_Append = '_5'
}else if (iPrint_Percentage >= 50 && iPrint_Percentage < 60){
  strPercentage_Append = '_6'
}else if (iPrint_Percentage >= 60 && iPrint_Percentage < 70){
  strPercentage_Append = '_7'
}else if (iPrint_Percentage >= 70 && iPrint_Percentage < 80){
  strPercentage_Append = '_8'
}else if (iPrint_Percentage >= 80 && iPrint_Percentage < 90){
  strPercentage_Append = '_9'
}else if (iPrint_Percentage >= 90 ){
  strPercentage_Append = '_10'
}else{
  strPercentage_Append = '_0'

}



 //////////////////////////////////////////////////////////////////////////////////////////////////
 //  Cut and paste  from Text Wrangler :: START --->> /////////////////////////////////////////////
 //////////////////////////////////////////////////////////////////////////////////////////////////

res.write('<!-- Save for Web Slices (NanoHUD_3p7p2.psd) -->');
res.write('<table id="Table_01" width="961" border="0" cellpadding="0" cellspacing="0">');
res.write(' <tr>');
res.write('   <td colspan="18">');
res.write('     <img id="NanoHUD_3p7p2_01" src="' + strFullPath + 'NanoHUD_3p7p2_01.png" width="960" height="32" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="1" height="32" alt="" /></td>');
res.write(' </tr>');
res.write(' <tr>');
res.write('   <td colspan="3" rowspan="6">');
res.write('     <img id="NanoHUD_3p7p2_02" src="' + strFullPath + 'NanoHUD_3p7p2_02.png" width="45" height="125" alt="" /></td>');
res.write('   <td colspan="8">');
//res.write('     <img id="Text_Line_1" src="' + strFullPath + 'Text_Line_1.png" width="386" height="42" alt="" /></td>');
res.write(strLCD_1);
res.write('   <td rowspan="2">');
res.write('     <img id="NanoHUD_3p7p2_04" src="' + strFullPath + 'NanoHUD_3p7p2_04.png" width="50" height="48" alt="" /></td>');
res.write('   <td colspan="6" rowspan="3">');
res.write('     <img id="NanoHUD_3p7p2_05" src="' + strFullPath + 'NanoHUD_3p7p2_05.png" width="479" height="59" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="1" height="42" alt="" /></td>');
res.write(' </tr>');
res.write(' <tr>');
res.write('   <td colspan="8" rowspan="3">');
//res.write('     <img id="Text_Line_2" src="' + strFullPath + 'Text_Line_2.png" width="386" height="32" alt="" /></td>');
res.write(strLCD_2);
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="1" height="6" alt="" /></td>');
res.write(' </tr>');
res.write(' <tr>');
res.write('   <td rowspan="2">');
res.write('     <img id="NanoHUD_3p7p2_07" src="' + strFullPath + 'NanoHUD_3p7p2_07.png" width="50" height="26" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="1" height="11" alt="" /></td>');
res.write(' </tr>');
res.write(' <tr>');
res.write('   <td colspan="2" rowspan="6">');
res.write('     <img id="NanoHUD_3p7p2_08" src="' + strFullPath + 'NanoHUD_3p7p2_08.png" width="51" height="211" alt="" /></td>');

strTarget_WWW = "http://" + strIPAddress + ':8000/model_images/' + strModel_Name + '.jpg'
strTarget = '/home/pi/ibox/www/model_images/' + strModel_Name + '.jpg'




//console.log('strTarget=[' + strTarget + ']')
if ( fs.existsSync( strTarget ) ) {
  res.write('   <td rowspan="11" background="' + strTarget_WWW + '">');
  //res.write('     <a href="view_current_model">');
  //res.write('       <img id="Image_3D_View" src="' + strTarget_WWW + '" width="250" height="450" border="0" alt="Selected Model" /></a></td>');
  res.write('       <img id="Image_3D_View" src="http://' + strIPAddress + ':8000/images/Image_3D_View_GlareOnly.png" width="250" height="450" border="0" alt="Selected Model" />');
  //res.write('</a></td>');
  res.write('</td>');
  //  CSS Overlap to get HIGHLIGHT  //
 //res.write('<link rel="stylesheet" type="text/css" href="http://' + strIPAddress + ':8000/main.css">');
 //res.write(' <div class="mainRunner">');
 //res.write('   <img width="250" height="450" class="img1" src="' + strTarget_WWW + '" />');
 //res.write('   <img width="250" height="450" class="img2" src="http://' + strIPAddress + ':8000/images/Image_3D_View_GlareOnly.png" />');
 //res.write(' </div>');

}else{
  res.write('   <td rowspan="11">');
  res.write('     <a href="view_current_model">');
  res.write('       <img id="Image_3D_View" src="' + strFullPath + 'Image_3D_View.png" width="250" height="450" border="0" alt="Selected Model" /></a></td>');
}

res.write('   <td colspan="3" rowspan="5">');
res.write('     <img id="NanoHUD_3p7p2_10" src="' + strFullPath + 'NanoHUD_3p7p2_10.png" width="178" height="164" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="1" height="15" alt="" /></td>');
res.write(' </tr>');
res.write(' <tr>');
res.write('   <td colspan="9">');
//res.write('     <img id="Text_Line_3" src="' + strFullPath + 'Text_Line_3.png" width="436" height="28" alt="" /></td>');
res.write(strLCD_3);
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="1" height="28" alt="" /></td>');
res.write(' </tr>');
res.write(' <tr>');
res.write('   <td colspan="9">');
//res.write('     <img id="Text_Line_4" src="' + strFullPath + 'Text_Line_4.png" width="436" height="23" alt="" /></td>');
res.write(strLCD_4);
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="1" height="23" alt="" /></td>');
res.write(' </tr>');
res.write(' <tr>');
res.write('   <td colspan="2" rowspan="3">');
res.write('     <img id="NanoHUD_3p7p2_13" src="' + strFullPath + 'NanoHUD_3p7p2_13.png" width="37" height="145" alt="" /></td>');
res.write('   <td colspan="3">');
//res.write('     <img id="Text_Line_Print_Time" src="' + strFullPath + 'Text_Line_Print_Time.png" width="160" height="30" alt="" /></td>');
res.write(strLCD_Print_Time_ETA);
res.write('   <td colspan="3">');
//res.write('     <img id="Text_Line_Print_Percentage" src="' + strFullPath + 'Text_Line_Print_Percentage.png" width="68" height="30" alt="" /></td>');
res.write(strLCD_Print_Percentage_Completed);
res.write('   <td colspan="4">');
res.write('     <img id="Graphic_Print_Percentage" src="' + strFullPath + 'Graphic_Print_Percentage' + strPercentage_Append + '.png" width="216" height="30" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="1" height="30" alt="" /></td>');
res.write(' </tr>');
res.write(' <tr>');
res.write('   <td colspan="4" rowspan="2">');
res.write('     <a href="button_print">');
//res.write('       <img id="Button_Print" src="' + strFullPath + 'Button_Print.png" width="177" height="115" border="0" alt="Print" /></a></td>');
var strBP = ""
if ( (iBox_Printer_State_General=="Printing" || strText_LCD_Line_1 == "Printing" || strText_LCD_Line_1.indexOf("Printing") > -1) & ( strText_LCD_Line_1 !="Stopped" & strPrinter_State != "Printing Complete") ){
  strBP = "_ON"
}
res.write('       <img id="Button_Print" src="' + strFullPath + 'Button_Print' + strBP + '.png" width="177" height="115" border="0" alt="Print" /></a></td>');

res.write('   <td colspan="3" rowspan="2">');
res.write('      <a href="button_home"><img id="button_refresh" src="' + strFullPath + 'Button_Refresh_Home.png" width="86" height="115" alt="" /></a></td>');
res.write('   <td colspan="3" rowspan="2">');
res.write('     <a href="button_stop">');
res.write('       <img id="Button_Stop" src="' + strFullPath + 'Button_Stop.png" width="181" height="115" border="0" alt="Stop" /></a></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="1" height="68" alt="" /></td>');
res.write(' </tr>');
res.write(' <tr>');
res.write('   <td rowspan="9">');
res.write('     <img id="NanoHUD_3p7p2_20" src="' + strFullPath + 'NanoHUD_3p7p2_20.png" width="42" height="513" alt="" /></td>');
res.write('   <td rowspan="2">');
res.write('     <a href="button_z_up">');
//res.write('       <img id="Button_Z_Up" src="' + strFullPath + 'Button_Z_Up.png" width="89" height="97" border="0" alt="Move Z Up" /></a></td>');
var strZBU = ""
if ( iBox_Printer_State_General=="Z Moving Up" || strText_LCD_Line_1 == "Z Moving Up" ){
  strZBU = "_ON"
}
res.write('       <img id="Button_Z_Up" src="' + strFullPath + 'Button_Z_Up' + strZBU + '.png" width="89" height="97" border="0" alt="Move Z Up" /></a></td>');

res.write('   <td rowspan="9">');
res.write('     <img id="NanoHUD_3p7p2_22" src="' + strFullPath + 'NanoHUD_3p7p2_22.png" width="47" height="513" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="1" height="47" alt="" /></td>');
res.write(' </tr>');
res.write(' <tr>');
res.write('   <td rowspan="8">');
res.write('     <img id="NanoHUD_3p7p2_23" src="' + strFullPath + 'NanoHUD_3p7p2_23.png" width="29" height="466" alt="" /></td>');
res.write('   <td colspan="3" rowspan="2">');
res.write('     <a href="button_share">');
res.write('       <img id="Button_Share" src="' + strFullPath + 'Button_Share.png" width="150" height="83" border="0" alt="Share Models" /></a></td>');
res.write('   <td colspan="6" rowspan="2">');
res.write('     <a href="button_browse">');
res.write('       <img id="Button_Browse" src="' + strFullPath + 'Button_Browse.png" width="157" height="83" border="0" alt="Browse Models" /></a></td>');
res.write('   <td colspan="3" rowspan="2">');
res.write('     <a href="button_create_model">');
res.write('       <img id="Button_Create_Model" src="' + strFullPath + 'Button_Create_Model.png" width="152" height="83" border="0" alt="Check for Updates" /></a></td>');
res.write('   <td rowspan="8">');
res.write('     <img id="NanoHUD_3p7p2_27" src="' + strFullPath + 'NanoHUD_3p7p2_27.png" width="44" height="466" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="1" height="50" alt="" /></td>');
res.write(' </tr>');
res.write(' <tr>');
res.write('   <td rowspan="2">');
res.write('     <a href="button_z_stop">');
res.write('       <img id="Button_Z_Stop" src="' + strFullPath + 'Button_Z_Stop.png" width="89" height="94" border="0" alt="Stop Z Movement" /></a></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="1" height="33" alt="" /></td>');
res.write(' </tr>');
res.write(' <tr>');
res.write('   <td colspan="6" rowspan="2">');
res.write('     <a href="button_auto_zero_z">');
//res.write('       <img id="Button_Auto_Zero_Z" src="' + strFullPath + 'Button_Auto_Zero_Z.png" width="230" height="104" border="0" alt="Auto Zero Z" /></a></td>');
var strAZZ = ""
if ( mySystem.bPrinting_Option_Direct_Print_With_Z_Homing == true ){
  strAZZ = "_ON"
}
res.write('       <img id="Button_Auto_Zero_Z" src="' + strFullPath + 'Button_Auto_Zero_Z' + strAZZ + '.png" width="230" height="104" border="0" alt="Auto Zero Z" /></a></td>');

res.write('   <td colspan="6" rowspan="2">');
res.write('     <a href="button_sound">');
//res.write('       <img id="Button_Sound" src="' + strFullPath + 'Button_Sound.png" width="229" height="104" border="0" alt="Sound" /></a></td>');
var strSND = ""
if ( mySystem.bSoundEnabled == true ){
  strSND = "_ON"
}
res.write('       <img id="Button_Sound" src="' + strFullPath + 'Button_Sound' + strSND + '.png" width="229" height="104" border="0" alt="Sound" /></a></td>');

res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="1" height="61" alt="" /></td>');
res.write(' </tr>');
res.write(' <tr>');
res.write('   <td rowspan="3">');
res.write('     <a href="button_z_down">');
//res.write('       <img id="Button_Z_Down" src="' + strFullPath + 'Button_Z_Down.png" width="89" height="114" border="0" alt="Move Z Down" /></a></td>');
var strZBD = ""
if ( iBox_Printer_State_General=="Z Moving Down" || strText_LCD_Line_1 == "Z Moving Down" ){
  strZBD = "_ON"
}
res.write('       <img id="Button_Z_Down" src="' + strFullPath + 'Button_Z_Down' + strZBD + '.png" width="89" height="114" border="0" alt="Move Z Down" /></a></td>');

res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="1" height="43" alt="" /></td>');
res.write(' </tr>');
res.write(' <tr>');
res.write('   <td colspan="3" rowspan="3">');
res.write('     <a href="button_help">');
res.write('       <img id="Button_Help" src="' + strFullPath + 'Button_Help.png" width="150" height="85" border="0" alt="Help" /></a></td>');
res.write('   <td colspan="6" rowspan="3">');
res.write('     <a href="button_settings">');
res.write('       <img id="Button_Settings" src="' + strFullPath + 'Button_Settings.png" width="157" height="85" border="0" alt="Settings" /></a></td>');
res.write('   <td colspan="3" rowspan="3">');
res.write('     <a href="button_power">');
res.write('       <img id="Button_Power" src="' + strFullPath + 'Button_Power.png" width="152" height="85" border="0" alt="Power" /></a></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="1" height="52" alt="" /></td>');
res.write(' </tr>');
res.write(' <tr>');
res.write('   <td rowspan="3">');
res.write('     <img id="NanoHUD_3p7p2_35" src="' + strFullPath + 'NanoHUD_3p7p2_35.png" width="250" height="227" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="1" height="19" alt="" /></td>');
res.write(' </tr>');
res.write(' <tr>');
res.write('   <td rowspan="2">');
res.write('     <img id="NanoHUD_3p7p2_36" src="' + strFullPath + 'NanoHUD_3p7p2_36.png" width="89" height="208" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="1" height="14" alt="" /></td>');
res.write(' </tr>');
res.write(' <tr>');
res.write('   <td colspan="12">');
res.write('     <img id="NanoHUD_3p7p2_37" src="' + strFullPath + 'NanoHUD_3p7p2_37.png" width="459" height="194" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="1" height="194" alt="" /></td>');
res.write(' </tr>');
res.write(' <tr>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="29" height="1" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="8" height="1" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="8" height="1" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="134" height="1" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="18" height="1" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="17" height="1" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="45" height="1" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="6" height="1" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="35" height="1" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="36" height="1" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="95" height="1" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="50" height="1" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="7" height="1" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="44" height="1" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="250" height="1" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="42" height="1" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="89" height="1" alt="" /></td>');
res.write('   <td>');
res.write('     <img src="' + strFullPath + 'spacer.gif" width="47" height="1" alt="" /></td>');
res.write('   <td></td>');
res.write(' </tr>');
res.write('</table>');
res.write('<!-- End Save for Web Slices -->');


<!-- End Save for Web Slices -->
  //////////////////////////////////////////////////////////////////////////////////////////////////
 //  Cut and paste  from Text Wrangler :: END --->> /////////////////////////////////////////////
 ////////////////////////////////////////////////////////////////////////////////////////////////// 
  
  /*
  res.write( '<center>' );
  res.write( '<table width="1024px">');
  //  Show home background  //
  res.write( '<tr><img style="padding-top:1px" height="768" src="/ibox/images/HTML_HUD_Concept_2p4_960x768.png" width="1024" alt="iBox Nano" id="iBoxBackground" title="iBox Nano"> <td>' );
  res.write('</table>');
  res.write('</center>');
  */
  //todo show snapshot of printer here or status or stuff...
  fcnSendClientSideSocketsIO_HTML( res );
  footer(res);
  
  if (bReLaunch_NodeJs_Next_Home_Page_Load == true) {
    bReLaunch_NodeJs_Next_Home_Page_Load = false;
    console.log('Rebooting.................................................................')
    try { 
        strCMD = 'sudo forever restartall' //restart -a /home/pi/ibox/iBoxWebGUI.js'
        console.log('exec : ' + strCMD)
        eXcOut = execSync(strCMD);
        console.log(eXcOut);
      }catch (err) {
        console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
      }
      
      //var exec = require('child_process').exec;
      //exec('sudo forever restart -a /home/pi/ibox/iBoxWebGUI.js', function (error, stdout, stderr) {


  }
}


//actual page to control our printer with iBoxPrintManager ;)
function showPrinterPage( res ){
  //  not needed as of 9/26/14
}

//todo add some checks in future here, for now it does the job ;)
function moveFile( source_file, target_file ){
      var is = fs.createReadStream(source_file)
      var os = fs.createWriteStream(target_file);
      console.log('moveFile : source_file=[' + source_file + ' :: " target_file=[' + target_file + ']')
      util.pump(is, os, function() {  //  util.pump is depreciated :: use readableStream.pipe()
      //readableStream.pipe(is, os, function() {
        console.log('unlinkSync');
        fs.unlinkSync( source_file );
        console.log('updating directories');
        //we update the directory after the move...
        runCommand( 'ls', '-tr1', '/home/pi/ibox/uploads' );
        runCommand( 'ls', '-tr1', '/home/pi/ibox/uploads/data' );
        runCommand( 'ls', '-tr1', '/home/pi/ibox/print_config_files' );
      });

      //the fs.rename does not work for me, i want to move from /tmp to a different dir in /home
      //move temp file into gcode_uploads dir with original filename 
      //fs.rename( tempfile, targetfile, function(error){
      //  if( error ){ 
    //    res.write('Oops could not move uploaded file');
      //    return;
      //  }
      //  res.write('thanks, all done!');
      //} );
}

function Truncate_File_Name(strFileName_Long, iLength) {
      //strFileName_Long = strFileName_Long.toString;
      strTruncate_Text = ".. .."
      iLength_Adjusted = iLength - strTruncate_Text.length
      if (strFileName_Long.length > iLength) {
        return strFileName_Long.substring(0,iLength_Adjusted/2) + strTruncate_Text + strFileName_Long.substring(strFileName_Long.length-(iLength_Adjusted/2),strFileName_Long.length);
      }else{
        return strFileName_Long;
      }
}

//needs both request and response vars (request to get file data, response to show results...)
function parseFileUpload( req, res, dir_path ){
    // parse a file upload
    console.log("parseFileUpload -- Start");
    var strFile_Path_TMP = ""
    var strFile_tmpPath_TMP = ""
    var strFile_Name_TMP = ""
    var strFile_Name_Truncated_TMP = ""
    var form = new formidable.IncomingForm();
    //console.log("parseFileUpload -- 0"); ///------------------------------------------------->
    form.parse(req, function(err, fields, files) {
      //console.log("parseFileUpload -- 1"); ///------------------------------------------------->
      //res.writeHead(200, {'content-type': 'text/plain'});
      

      strURL = 'http://' + strIPAddress + '/uploaded_file';
      console.log("parseFileUpload -- 2"); ///------------------------------------------------->

      //  Make sure the path exists.  //
      //  dir_path or strUploadPath_SVG
      if (!fs.existsSync( dir_path )){
        console.log("Creating directory: " + strUploadPath_SVG)
        fs.mkdirSync(strUploadPath_SVG);
        //  fix permissions  //
        try { 
          strCMD = 'sudo chmod -R 777 ' + dir_path
          console.log('requrl : ' + strCMD)
          eXcOut = execSync(strCMD);
          console.log(eXcOut);
        }catch (err) {
          console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
        }
      }else{
        console.log('Directory already exists: ' + strUploadPath_SVG)
      }


      /*
      header( res );
      //res.write('<meta http-equiv="refresh" content="3;URL=http://' + strIPAddress + '/">');
      res.write('<meta http-equiv="refresh" content="3;URL=' + strURL + '">');
      //header( res );
      res.write('<pre>\n');
      */

      strFile_Name_TMP = files['upload']['name'];
      //  Remove Spaces  //
      strFile_Name_TMP = strFile_Name_TMP.replace(" ", "_");
      strFile_Name_TMP = strFile_Name_TMP.replace(/([^a-zA-Z0-9.-]+)/g, "_"); //  Clean File Name of all illegal file name characters
      //console.log("parseFileUpload -- 3"); ///------------------------------------------------->
      strFile_Name_Truncated_TMP = Truncate_File_Name(strFile_Name_TMP,28);

      //console.log("parseFileUpload -- 4"); ///------------------------------------------------->
      strFile_tmpPath_TMP = files['upload']['path'];
      //strFile_tmpPath_TMP = strFile_tmpPath_TMP.replace(" ", "_");
      //strFile_tmpPath_TMP = strFile_tmpPath_TMP.replace(/([^a-zA-Z0-9.-]+)/g, "_"); //  Clean File Name of all illegal file name characters
      //lastFileName_FullPath  = '/home/pi/ibox/uploads/'+files['upload']['name'];
      //lastFileName_FullPath  = strUploadPath_SVG + files['upload']['name'];
      strFile_Path_TMP = dir_path + strFile_Name_TMP
      console.log('strFile_Name_TMP=' + strFile_Name_TMP);
      console.log('strFile_Name_Truncated_TMP=' + strFile_Name_Truncated_TMP);
      console.log('strFile_Path_TMP=' + strFile_Path_TMP);
      console.log('strFile_tmpPath_TMP=' + strFile_tmpPath_TMP);
      //console.log("parseFileUpload -- 5"); ///------------------------------------------------->
      console.log(util.inspect(files));

      ////  MAIN CODE  ///// 
      moveFile( strFile_tmpPath_TMP, strFile_Path_TMP );

      
      //  Save as last file name ONLY if it is a SVG or IMG file
      if (dir_path == strUploadPath_SVG) {
        //lastFileName_tmpPath = strFile_tmpPath_TMP
        lastFileName_FullPath = strFile_Path_TMP
        lastFileName_FileName = strFile_Name_TMP
        //lastFileName_FileNameTruncated = strFile_Name_Truncated_TMP
        //mySystem.lastFileName_FullPath = strFile_Path_TMP; //  Save Settings
        //mySystem.lastFileName_FileName = strFile_Name_TMP;

        //fsSystem_Save();  //  Save Settings  //  4/13/15 save in ibp_create_model.populate_json_data( req, res );
        strFileExistingOrNew = "new_file" //#"new_file : existing_file"
      }else if (dir_path == strUploadPath_IMG_DATA) {
        lastFileName_tmpPath = strFile_tmpPath_TMP
        lastFileName_FullPath = strFile_Path_TMP
        lastFileName_FileName = strFile_Name_TMP
        lastFileName_FileNameTruncated = strFile_Name_Truncated_TMP
        mySystem.lastFileName_FullPath = strFile_Path_TMP; //  Save Settings
        mySystem.lastFileName_FileName = strFile_Name_TMP;
        fsSystem_Save();  //  Save Settings
        strFileExistingOrNew = "new_file" //#"new_file : existing_file"
      }else if ( dir_path == strUploadPath_CONFIG_FILES) {
        var strTmp_Config_File_Name = strFile_Name_TMP;
        strTmp_Config_File_Name = strTmp_Config_File_Name.replace('.json','');  //  so we dont end up with .json.json
        mySystem.Selected_Config_File = strTmp_Config_File_Name;
        fsSystem_Save();  //  Save Settings
      }

      //console.log("parseFileUpload -- 7"); ///------------------------------------------------->
      /*
      res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">File successfully downloaded to Printer:[' + strFile_Name_TMP + ']</FONT>');
      //res.write('<br><br><br><FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">You will be redirected back to the Print Manager. <a COLOR="#00ceef" href="' + strURL + '"><click here></a></FONT>');
        strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '';
      res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
      res.write('<input type="submit" value="Back">');
      res.write('</form>');
      res.write('</pre>\n');

      //res.end('');
      //now move the file into /uploads
      
      footer( res );
      */

      if (dir_path == strUploadPath_SVG) {
        // display "file upload com[lete" then launch the svg to png convert process  //
        //  Old 4/13/15 showConvert_SVG( res );
        ibp_create_model.populate_json_data( req, res , lastFileName_FileName, lastFileName_FullPath);
      }else if (dir_path == strUploadPath_IMG_DATA) {
        showPrintPage_IMG_DATA( req, res);
      }else if ( dir_path == strUploadPath_CONFIG_FILES) {
        showPrintPage_CONFIG_FILES( res );
      }
      
      //#todo, have this just redirect to home page
      
      //  Redirect to home page  //
      //setTimeout( function(){

      //}, 2000 );
      
      //  Catch ALL  //
      header( res );
      //res.write('<meta http-equiv="refresh" content="3;URL=http://' + strIPAddress + '/">');
      res.write('<meta http-equiv="refresh" content="3;URL=' + strURL + '">');
      footer( res );
    });

}

//needs both request and response vars (request to get file data, response to show results...)
/*formible cant list files from a remote servers HD,a nd the Raspberry Pi is a remote server
function parseFileSelect( req, res ){
    // Select a file to Print
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      //res.writeHead(200, {'content-type': 'text/plain'});
      //
      strURL = 'http://' + strIPAddress + '';

      //res.write('<meta http-equiv="refresh" content="3;URL=http://' + strIPAddress + '/">');
      //res.write('<meta http-equiv="refresh" content="3;URL=' + strURL + '">');


      //res.write(util.inspect({fields: fields, files: files})); //handy snippet to show the fields submitted
      //var tempfile    = files['upload']['path'];
      //var targetfile  = '/home/pi/ibox/uploads/'+files['upload']['name'];
      //moveFile( tempfile, targetfile );
      console.log(files);
      lastFileName_FileName = files['select']['name'];
      if (lastFileName_FileName.length > 28) {
        lastFileName_FileNameTruncated = lastFileName_FileName.substring(0,14) + ".. .." + lastFileName_FileName.substring(lastFileName_FileName.length-14,lastFileName_FileName.length);
      }else{
        lastFileName_FileNameTruncated = lastFileName_FileName;
      }
      
      lastFileName_tmpPath    = files['select']['path'];
      lastFileName_FullPath  = '/home/pi/ibox/uploads/'+files['select']['name'];
      console.log('lastFileName_FileName=' + lastFileName_FileName);
      console.log('lastFileName_tmpPath=' + lastFileName_tmpPath);
      console.log('lastFileName_FullPath=' + lastFileName_FullPath);
      console.log(util.inspect(files));
      
      showHomePage( req, res );
  });

}
*/

function runCommand( command, args, dir ){
  //var spawn   = require('child_process').spawn;
  var command = spawn(command, [args, dir]);

  command_output = '';
  command.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
    command_output = command_output+ data;
  });

  command.stderr.on('data', function (data) {
    //console.log('stderr: ' + data);
    command_output = command_output + data;
  });

  command.on('exit', function (code) {
    //console.log('child process exited with code ' + code);
    files = command_output.toString().split('\n');
    files.splice(files.length-1,1); //removes last empty entry here...
  });
    
}

//everything is async, this kinda sucks here, we need to call this thing even before we go to the page... test it now here use a global var here...
function showFilesPage( response ){
  header( response );
  response.write('<pre>');
  response.write( command_output );
  response.write('</pre>');
  footer( response );
} 

var printserver = http.createServer(function(req, res) {
  var uri = url.parse(req.url).pathname;
  var filename = path.join(process.cwd(), unescape(uri));
  var stats;
  //var io = socket.listen(printserver);
  var requrl = req.url;
  //  Remove ?
  requrl = requrl.replace("?","");
  console.log('NODE : HTTP Request Received : requrl=[' + requrl + ']');
  
    if (requrl == '/upload_svg' && req.method.toLowerCase() == 'post') {
      console.log(req.url);
      parseFileUpload( req, res , strUploadPath_SVG);
      return; 
    }
    if (requrl == '/upload_img_data' && req.method.toLowerCase() == 'post') {
      console.log(req.url);
      parseFileUpload( req, res , strUploadPath_IMG_DATA);
      return; 
    }
    if (requrl == '/upload_config_files' && req.method.toLowerCase() == 'post') {
      console.log(req.url);
      parseFileUpload( req, res , strUploadPath_CONFIG_FILES);
      return; 
    }
    if (requrl == '/select' && req.method.toLowerCase() == 'post') {
      parseFileSelect( req, res );
      
      return; 
    }
    //  iBox Nano  ////////////////////////////////////////
    else if( requrl == '/button_print' ){
      //  Mke sure Printer is READY and BOOTED  //
      /*
      if (iBox_Printer_State_Boot != "Ready") {
        console.log("Printer NOT BOOTED and Ready : Message_State_Boot=",iBox_Printer_State_Boot)
        //  Let GUI know...
        strPrinter_State = "Printer Not ready";
        return;
      }
      */
      console.log(req.url);
      //var lastfile = files[files.length-1].toString();
      console.log('About to start a print, what was the last file used? : last file='+lastFileName_FileName +"\n");
      //iBoxPrintManager.stdin.write(req.url + ":/ibox/uploads/"+lastFileName_FullPath+"\n" );
      iBoxPrintManager.stdin.write("/button_print:" + lastFileName_FileName + ":" + strFileExistingOrNew + "\n" ); //strFileExistingOrNew
      //iBoxPrintManager.stdin.write(req.url + '\n');
      strPrinter_State = "Printing"; //  Update Status
      showHomePage( req, res );
      return;
    }
    else if( req.url.indexOf('/print?') > -1 ){
      console.log(req.url);
      //Step 1 - get URL Parts
      var url_parts = url.parse(req.url,true);
      
      //  Step 3 write to JSON
      data = JSON.stringify(url_parts );
      myGet = JSON.parse(data);
      console.log("/print : myQuery:",myGet );
      //  Step 4 : Transfer objects from myGet to current config  //
      myQuery = myGet.query;
      console.log("/print : myQuery:",myQuery );
      console.log("/print myQuery.file_name=",myQuery.file_name);

      lastFileName_FullPath = strUploadPath_SVG + myQuery.file_name;
      lastFileName_FileName = myQuery.file_name;
      
      mySystem.lastFileName_FullPath = lastFileName_FullPath; //  Save Settings
      mySystem.lastFileName_FileName = lastFileName_FileName;

      //Step 6 : Save new Config Data
      fsSystem_Save();

      console.log('/print : About to start a print, what was the last file used? : last file='+lastFileName_FullPath +"\n");
      //iBoxPrintManager.stdin.write(req.url + ":/ibox/uploads/"+lastFileName_FullPath+"\n" );
      iBoxPrintManager.stdin.write("/button_print:" + lastFileName_FullPath + ":existing_file\n" ); //existing_file or new_file
      //iBoxPrintManager.stdin.write(req.url + '\n');
      strPrinter_State = "Printing"; //  Update Status
      showHomePage( req, res );
      return;
    }
    else if( requrl == '/button_stop' ){
      console.log(req.url);
      iBoxPrintManager.stdin.write(req.url + '\n');
      strPrinter_State = "Stopped"; //  Update Status
      showHomePage( req, res );
      return;
    }
    else if( requrl == '/button_fastz' ){
      console.log(req.url);
      iBoxPrintManager.stdin.write(req.url + '\n');
      showHomePage( req, res );
      return;
    }
    else if( requrl == '/restart_nodejs'){
      console.log(req.url);
      //  Reboot Node.js and Python3  //
      bReLaunch_NodeJs_Next_Home_Page_Load = true; //  relaunches Node.js and Python, does not reboot Raspberry Pi

      metaLaunchHomePage( res ); 

      //var exec = require('child_process').exec;
      //  exec('forever restart -a /home/pi/ibox/iBoxWebGUI.js', function (error, stdout, stderr) {
      //  // output is in stdout
      //});
      return;
    }
    else if( requrl == '/button_updates' ){
      console.log(req.url);

      //  because this could come from /production.js we need to LOAD the mySystem.json, because the info in the mySystem was updated by /production button_1
      fsSystem_Load();
      fsConfig_Load();
      fsCalibration_Load();
      //  Several options:
      //  1. Complete the update process from Node.js (here)
      //  example code: http://stackoverflow.com/questions/11944932/how-to-download-a-file-with-node-js
      showCheckForUpdatesForm( res);
      
      //  2. Complete the process from Python.
      //iBoxPrintManager.stdin.write(req.url + '\n');

      
      //  3. Have both Node and Pythn perform their independent updates.

      return;
    }
    else if( requrl == '/button_load_updates_json' ){
      console.log(req.url);
      showLoadJSONUpdates( res );


      return;
    }
    else if( requrl == '/button_show_update_options' || req.url == '/button_show_update_options?'){
      console.log(req.url);
      //  Several options:
      //  1. Complete the update process from Node.js (here)
      //  example code: http://stackoverflow.com/questions/11944932/how-to-download-a-file-with-node-js
      showUpdateOptionsForm( res);
      
      //  2. Complete the process from Python.
      //iBoxPrintManager.stdin.write(req.url + '\n');

      
      //  3. Have both Node and Pythn perform their independent updates.

      return;
    }
    else if( requrl == '/button_process_updates'){
      console.log(req.url);

      //  Make sure this is not a master dev station:
      if(strZeroConfigName == 'trentsnano') {
        res.write('This is a developer unit. Updating is not allowed.')
        res.end();
        return;
      }
      //  Several options:
      //  1. Complete the update process from Node.js (here)
      //  example code: http://stackoverflow.com/questions/11944932/how-to-download-a-file-with-node-js
      showProcessUpdatesForm( res);
      
      //  2. Complete the process from Python.
      //iBoxPrintManager.stdin.write(req.url + '\n');

      
      //  3. Have both Node and Pythn perform their independent updates.

      return;
    }
    else if( requrl == '/button_enable_leds' ){
      console.log(req.url);
      iBoxPrintManager.stdin.write(req.url + '\n');
      showHomePage( req, res );
      return;
    }
    else if( requrl == '/button_download_file' ){
      console.log(req.url);
      showUploadForm_SVG( res);
      return;
    }
    else if( requrl == '/button_download_file_img_data' ){
      console.log(req.url);
      showUploadForm_IMG_DATA( res);
      return;
    }
    else if( requrl == '/button_download_file_config_files' ){
      console.log(req.url);
      showUploadForm_CONFIG_FILES( res);
      return;
    }
    else if( requrl == '/button_select_file' ){
      console.log(req.url);
      //iBoxPrintManager.stdin.write(req.url + '\n');
      showSelectFileForm( res);
      return;
    }
    
    else if( requrl == '/button_auto_zero_z' ){
      console.log(req.url);
      //  Toggle AutoZeroZ  //
      if ( mySystem.bPrinting_Option_Direct_Print_With_Z_Homing == true ){
        mySystem.bPrinting_Option_Direct_Print_With_Z_Homing = false;
      }else{
        mySystem.bPrinting_Option_Direct_Print_With_Z_Homing = true;
      }
      fsSystem_Save();
      iBoxPrintManager.stdin.write(req.url + '\n'); // This is fine, .py just beeps and prints a log statement, then reloads system.json
      showHomePage( req, res );
      return;
    }
    else if( requrl == '/button_sound' ){
      console.log(req.url);
      //  Toggle Sound  //
      if ( mySystem.bSoundEnabled == true ){
        mySystem.bSoundEnabled = false;
      }else{
        mySystem.bSoundEnabled = true;
      }
      fsSystem_Save();
      iBoxPrintManager.stdin.write(req.url + '\n');
      showHomePage( req, res );
      return;
    }
    /*else if( requrl == '/button_settings' ){
      console.log(req.url);
      //iBoxPrintManager.stdin.write(req.url + '\n');
      //functionTestSettingsLoadSave();
      showSettings( req, res );
      return;
    }*/
    else if( requrl == '/edit_system_config' ){
      console.log(req.url);
      showSystemConfig_Web_Form( res );
      return;
    }
    else if( requrl == '/button_power' ){
      //bReLaunch_NodeJs_Next_Home_Page_Load = true;
      showButtonPowerForm( res );
      //metaLaunchHomePage( res ); //  relaunches Node.js and Python, does not reboot Raspberry Pi
      /*
      console.log(req.url);
      iBoxPrintManager.stdin.write(req.url + '\n');
      //  Save Settings
      fsSystem_Save(); //  Just do once and a while
      fsConfig_Save();
      //  Clear Fields //
      strText_LCD_Line_1 = "Printer Ready"
      strPrinter_State = strText_LCD_Line_1;
      strPrinter_State_3 = "";
      //  Todo actually reset print system
      strText_LCD_Line_2 = "";
      strText_LCD_Line_4 = "WiFi";
      strText_LCD_Line_Print_ETA = "rst"
      //strText_LCD_Line_3 = "";
      */
      return;
    }
    else if( requrl == '/button_reboot_rpi'  ){
      console.log(req.url);
      header( res );
      strURL = 'http://' + strIPAddress + '';
      res.write('<meta http-equiv="refresh" content="140;URL=' + strURL + '">');
      res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Rebooting Now......</FONT>');
      res.write('<br><br>');
      res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">This will take about 2 minutes.</FONT>');
      res.write('<br>');
      res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Press the button below after the printer reboots. This will take you back to the main page.</FONT>');
      res.write('<br>');
      //////////////////////////////////////////////////////////////////////////////////////////////////////
      ////  Back Button to Home ////
      ///////////////////////////////////////////////////
      strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '';
      res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
      res.write('<input type="submit" value="Press After Reboot">');
      res.write('</form>');
  
      footer (res);
      //  Delete Logs  // Maybe should be its own thing  //
      //fcnDeleteMyLogs()
      //  Send reboot command to CLI
      var exec = require('child_process').exec;
        exec('sudo shutdown -r now', function (error, stdout, stderr) {
        // output is in stdout
      });
      return;
    }

    else if( requrl == '/delete_browse_json'  ){
      console.log(req.url);
      header( res );
      strURL = 'http://' + strIPAddress + '';
      res.write('<meta http-equiv="refresh" content="140;URL=' + strURL + '">');
      res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Resetting Browse List</FONT>');
      res.write('<br><br>');
      //  Send reboot command to CLI
      var exec = require('child_process').exec;
        exec('sudo rm /home/pi/ibox/www/packages/_list.json', function (error, stdout, stderr) {
        // output is in stdout
      });
      var exec = require('child_process').exec;
        exec('sudo rm /home/pi/ibox/www/packages/_listTime.json', function (error, stdout, stderr) {
        // output is in stdout
      });
      res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Done...</FONT>');
      res.write('<br>');
     
      //////////////////////////////////////////////////////////////////////////////////////////////////////
      ////  Back Button to Home ////
      ///////////////////////////////////////////////////
      strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '';
      res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
      res.write('<input type="submit" value="Home">');
      res.write('</form>');
  
      footer (res);


      return;
    }

    else if( requrl == '/button_reboot_rpi_and_check_filesystem'  ){
      console.log(req.url);
      header( res );
      strURL = 'http://' + strIPAddress + '';
      res.write('<meta http-equiv="refresh" content="140;URL=' + strURL + '">');
      res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Rebooting Now......</FONT>');
      res.write('<br><br>');
      res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">This will take about 2-3 minutes.</FONT>');
      res.write('<br>');
      res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Your file system will be checked during reboot, which will add time to the boot process.</FONT>');
      res.write('<br>');
      res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Press the button below after the printer reboots. This will take you back to the main page.</FONT>');
      res.write('<br>');
      //////////////////////////////////////////////////////////////////////////////////////////////////////
      ////  Back Button to Home ////
      ///////////////////////////////////////////////////
      strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '';
      res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
      res.write('<input type="submit" value="Press After Reboot">');
      res.write('</form>');
  
      footer (res);
      //  Delete Logs  // Maybe should be its own thing  //
      //fcnDeleteMyLogs()
      //  Send reboot command to CLI
      var exec = require('child_process').exec;
        exec('sudo shutdown -r -F now', function (error, stdout, stderr) {
        // output is in stdout
      });
      return;
    }
    
    else if( requrl == '/button_shutdown_rpi'  ){
      console.log(req.url);
      header( res );

      strURL = 'http://' + strIPAddress + '';
      res.write('<meta http-equiv="refresh" content="140;URL=' + strURL + '">');
      res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Shutting Down Now......</FONT>');
      res.write('<br><br>');
      res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">This will take about a minute.</FONT>');
      res.write('<br>');
      res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">After the green light stops blinking and the red light is on continuously you can safely remove the USB power.</FONT>');
      res.write('<br>');

  
      footer (res);
      //  Delete Logs  // Maybe should be its own thing  //
      //fcnDeleteMyLogs()
      //  Send reboot command to CLI
      var exec = require('child_process').exec;
        exec('sudo shutdown -h now', function (error, stdout, stderr) {
        // output is in stdout
      });
      return;
    }
    
    else if( requrl == '/delete_logs'  ){
      console.log(req.url);
      header( res );
      strURL = 'http://' + strIPAddress + '';
      res.write('<meta http-equiv="refresh" content="140;URL=' + strURL + '">');
      res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Deleting Logs....</FONT>');

      res.write('<br>');
      //  Delete Logs  // Maybe should be its own thing  //
      fcnDeleteMyLogs()
      
      res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Logs Deleted Successfully</FONT>');

      res.write('<br>');
      
      //////////////////////////////////////////////////////////////////////////////////////////////////////
      ////  Back Button to Home ////
      ///////////////////////////////////////////////////
      strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '';
      res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
      res.write('<input type="submit" value="Back">');
      res.write('</form>');
  
      footer (res);
  
      return;

    }else if( requrl == '/archive_logs'  ){
      console.log(req.url);
      header( res );
      strURL = 'http://' + strIPAddress + '';
      res.write('<meta http-equiv="refresh" content="140;URL=' + strURL + '">');
      res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Archiving Logs...');

      res.write('<br>');
      res.write('...working...........')
      res.write('<br>');
      //  Archive Logs  //
      strCMD = 'sudo /home/pi/ibox/archive_logs.sh'
      try { 
      eXcOut = execSync(strCMD);
        res.write('Executing: ' + strCMD);
        console.log(eXcOut);
        res.write('Result: ' + eXcOut);
        
      }catch (err) {
        console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']');
        res.write('ERROR [' + err + '] : executing execSync[' + strCMD + ']');
      }
      res.write('<br>');
      res.write('<br></FONT>');
      res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Logs Archived Successfully.</FONT>');

      res.write('<br>');
      
      //////////////////////////////////////////////////////////////////////////////////////////////////////
      ////  Back Button to Home ////
      ///////////////////////////////////////////////////
      strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '';
      res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
      res.write('<input type="submit" value="Back">');
      res.write('</form>');
  
      footer (res);
  
      return;

    }else if( requrl == '/button_z_up' ){
      console.log(req.url);
      iBoxPrintManager.stdin.write(req.url + '\n');
      strPrinter_State = "Z Moving Up"; //  Update Status
      showHomePage( req, res );
      return;
    }
    else if( requrl == '/button_z_down' ){
      console.log(req.url);
      iBoxPrintManager.stdin.write(req.url + '\n');
      strPrinter_State = "Z Moving Down"; //  Update Status
      showHomePage( req, res );
      return;
    }
    else if( requrl == '/button_z_stop' ){
      console.log(req.url);
      iBoxPrintManager.stdin.write(req.url + '\n');
      strPrinter_State = "Z Stopped"; //  Update Status
      showHomePage( req, res );
      return;
    }
    else if( requrl == '/uploaded_file' ){
      console.log(req.url);
      iBoxPrintManager.stdin.write(req.url + '\n');
      strText_LCD_Line_3 = "Press PRINT to print this File";
      strPrinter_State = "Upload Completed"; //  Update Status
      
      showHomePage( req, res );
      return;
    }
    else if(req.url.indexOf('/submit_config') > -1 ){  // && req.method.toLowerCase() == 'post'   /////////////// SUBMIT CONFIG -->GET<---
      console.log(req.url);
      
      //  ToDo: Change JSON
      //console.log('iExposure_Time: ' + req.query.iExposure_Time );
      //Step 1 - get URL Parts
      var url_parts = url.parse(req.url,true);
      //console.log('url_parts=',url_parts,"\n\n");
      //Step 2 : Replace "+" with " "
      //url_parts = url_parts.replace("+", " ");  //  did not work, apparently not a string
      //  Step 3 write to JSON
      data = JSON.stringify(url_parts );
      myGet = JSON.parse(data);
      //  Step 4 : Transfer objects from myGet to current config  //
      /*
      Object.keys(myGet).forEach(function (key) {  //  All of the data is in the "query" key
        //  Name = Key :: Value=myConfig[key]
        if (key = "query") {
          console.log("Key:[",key,"] = [", myGet[key] ,"]");
        }
        //res.write('<br>' + key + ': <input type="text" name="' + key + '" value="' + myConfig[key] + '"><br>');
      });
      */
      myQuery = myGet.query
      console.log("Just get myQuery:",myQuery )
      
      console.log("myQuery.iExposure_Time:",myQuery.iExposure_Time ); //worked.
      
      //  Step 5 - write to myConfig  from myQuery
      Object.keys(myQuery).forEach(function (key) {
        myConfig[key] = myQuery[key];
        /*if (key == 'iGlobal_Z_Layer_Thickness') {
          myConfig[key] = myQuery[key] * 2.56;
        }else if (key == 'iGlobal_Z_Height_Peel_Stage_1') {
          myConfig[key] = myQuery[key] * 2.56;
        }else if (key == 'iGlobal_Z_Height_Peel_Stage_2') {
          myConfig[key] = myQuery[key] * 2.56;
        }else{
          myConfig[key] = myQuery[key];
        }*/
        console.log("Key:[",key,"] = [", myQuery[key] ,"] => Config:[", myConfig[key] ,"]");
        //console.log("Key:[",key,"] = [", myConfig[key] ,"]");
      });
      //  Step 5.5 : Change destination Config file name  in mySystem
      strFile_Name_Cleaned = myQuery.config_name;
      strFile_Name_Cleaned = strFile_Name_Cleaned.replace(" ", "_");
      strFile_Name_Cleaned = strFile_Name_Cleaned.replace(/([^a-zA-Z0-9-]+)/g, "_"); //  Clean File Name of all illegal file name characters
      //strFile_Name_Cleaned = strFile_Name_Cleaned.replace("[^a-zA-Z0-9.-]", "_");
      console.log(' myQuery.config_name=' +  myQuery.config_name + ' : strFile_Name_Cleaned=' + strFile_Name_Cleaned)
      mySystem.Selected_Config_File = strFile_Name_Cleaned; //myQuery.config_name;
      myConfig.config_name = strFile_Name_Cleaned;
      
      //Step 6 : Save new Config Data
      fsConfig_Save();
      fsSystem_Save();

      //console.log("JSON.stringify(req.body)=",JSON.stringify(url_parts));//req.body));
      //console.log('req.body.iExposure_Time', req.body('iExposure_Time'));
      strPrinter_State_3 = '' + myConfig.config_name + ' saved';
      
      showHomePage( req, res );
      return;
    }
    else if(req.url.indexOf('/change_config') > -1 ){  // && req.method.toLowerCase() == 'post'   /////////////// Change Config
      ////////////////////////////
      ///  CHANGE files /////////////
      //Step 1 - get URL Parts
      var url_parts = url.parse(req.url,true);
      
      //  Step 3 write to JSON
      data = JSON.stringify(url_parts );
      myGet = JSON.parse(data);
      console.log("change_config files : myQuery:",myGet );
      //  Step 4 : Transfer objects from myGet to current config  //
      myQuery = myGet.query;
      console.log("change_config files: myQuery:",myQuery );
      
      //  Step 5 - write to myConfig  from myQuery
      //Object.keys(myQuery).forEach(function (key) {
      //  console.log("Key:[",key,"] = [", myQuery[key] ,"]");
      //  myConfig[key] = myQuery[key];
      //});
      //  Step 5.5 : Change destination Config file name  in mySystem
      console.log("myQuery.config_name=",myQuery.config_name);
      var strOldConfigFile = mySystem.Selected_Config_File;
      mySystem.Selected_Config_File = myQuery.config_name;
      fsSystem_Save();
      console.log(mySystem);
      console.log(myConfig);
      //Step 6 : Save new Config Data
      //fsConfig_Save();
      //fsSystem_Save();
      strPrinter_State_3 = 'Changed config from ' + strOldConfigFile + ' to ' + mySystem.Selected_Config_File;
      
      showSettings( req, res );
      return;
    }  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    else if(req.url.indexOf('/submit_system_config') > -1 ){  // && req.method.toLowerCase() == 'post'   /////////////// SUBMIT SYSTEM CONFIG -->GET<---
      //console.log(req.url);
      
      //  ToDo: Change JSON
      //console.log('iExposure_Time: ' + req.query.iExposure_Time );
      //Step 1 - get URL Parts
      var url_parts = url.parse(req.url,true);
      //console.log('url_parts=',url_parts,"\n\n");
      //Step 2 : Replace "+" with " "
      //url_parts = url_parts.replace("+", " ");  //  did not work, apparently not a string
      //  Step 3 write to JSON
      data = JSON.stringify(url_parts );
      myGet = JSON.parse(data);
      //  Step 4 : Transfer objects from myGet to current config  //
      /*
      Object.keys(myGet).forEach(function (key) {  //  All of the data is in the "query" key
        //  Name = Key :: Value=myConfig[key]
        if (key = "query") {
          console.log("Key:[",key,"] = [", myGet[key] ,"]");
        }
        //res.write('<br>' + key + ': <input type="text" name="' + key + '" value="' + myConfig[key] + '"><br>');
      });
      */
      myQuery = myGet.query
      console.log("Just get myQuery:",myQuery )
      
      console.log("myQuery.Last_Update_Date:",myQuery.Last_Update_Date ); //worked.
      
      //  Step 5 - write to myConfig  from myQuery
      Object.keys(myQuery).forEach(function (key) {
        mySystem[key] = myQuery[key];
        /*if (key == 'iGlobal_Z_Layer_Thickness') {
          myConfig[key] = myQuery[key] * 2.56;
        }else if (key == 'iGlobal_Z_Height_Peel_Stage_1') {
          myConfig[key] = myQuery[key] * 2.56;
        }else if (key == 'iGlobal_Z_Height_Peel_Stage_2') {
          myConfig[key] = myQuery[key] * 2.56;
        }else{
          myConfig[key] = myQuery[key];
        }*/
        console.log("Key:[",key,"] = [", myQuery[key] ,"] => Config:[", mySystem[key] ,"]");
        //console.log("Key:[",key,"] = [", myConfig[key] ,"]");
      });
      //  Step 5.5 : Change destination Config file name  in mySystem
      //mySystem.Selected_Config_File = myQuery.config_name;
      
      //Step 6 : Save new Config Data
      //fsConfig_Save();
      fsSystem_Save();

      //console.log("JSON.stringify(req.body)=",JSON.stringify(url_parts));//req.body));
      //console.log('req.body.iExposure_Time', req.body('iExposure_Time'));
      //strPrinter_State_3 = 'Configuration ' + myConfig.config_name + ' saved';
      
      showHomePage( req, res );
      return;
    }
else if(req.url.indexOf('/select_file_to_print') > -1 ){  // && req.method.toLowerCase() == 'post'   ///////////////  Select File (already uploaded)
      ///  Select File already uploaded  /////////////
      //Step 1 - get URL Parts
      var url_parts = url.parse(req.url,true);
      
      //  Step 3 write to JSON
      data = JSON.stringify(url_parts );
      myGet = JSON.parse(data);
      console.log("select_file_to_print : myQuery:",myGet );
      //  Step 4 : Transfer objects from myGet to current config  //
      myQuery = myGet.query;
      console.log("select_file_to_print : myQuery:",myQuery );
      console.log("myQuery.file_name=",myQuery.file_name);

      lastFileName_FullPath = strUploadPath_SVG + myQuery.file_name;
      lastFileName_FileName = myQuery.file_name;
      
      mySystem.lastFileName_FullPath = lastFileName_FullPath; //  Save Settings
      mySystem.lastFileName_FileName = lastFileName_FileName;
      
      //Step 6 : Save new Config Data
      //fsConfig_Save();
      fsSystem_Save();
      //fsSystem_Load();
      //console.log(mySystem);
      strModel_File_Name = lastFileName_FileName.replace('.svg','');  //  Just leaves Model Dir name
      strPrinter_State_3 = 'Selected File: ' + strModel_File_Name + '';
      
      showHomePage( req, res );
      return;
    }  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// Select File (already uploaded)
    /// END : iBox Nano  /////////////////////////////
    else if( requrl == '/about' ){
      showAboutPage( res );
      return;
    }else if( requrl == '/print' ){
      showPrintPage( res );
      return;
    }else if( requrl == '/show_logs' ){
      showSystemLogs( res );
      return;
    }else if( requrl == '/printfile' ){
      var lastfile = files[files.length-1].toString();
      console.log('last file='+lastfile +"\n");
      iBoxPrintManager.stdin.write( 'load /ibox/uploads/'+lastfile+"\n" );
      iBoxPrintManager.stdin.write( 'print\n' );
      showPrinterPage( res );
    }else if( requrl == '/heatoff' ){
      console.log('setting temp off!');
      iBoxPrintManager.stdin.write( 'settemp 0\n' );
      showPrinterPage( res );
    }else if( requrl == '/upload_svg' ){
      console.log('showing Upload SVG page');
      showUploadForm_SVG( res );
    }else if( requrl == '/upload_img_data' ){
      console.log('showing Upload Image Data page');
      showUploadForm_IMG_DATA( res );
    }else if( requrl == '/upload_config_files' ){
      console.log('showing Upload Config Files page');
      showUploadForm_CONFIG_FILES( res );
    }else if( requrl == '/button_home'){
      console.log(req.url);
      showHomePage( req, res );
      return;
    }else if( requrl == '/reload_mysystem'){
      console.log(req.url);
      fsSystem_Load();
      showHomePage( req, res );
      return;
    }else if( requrl == '/files' ){
      showFilesPage( res );
    }else if( requrl == '/default.htm' ){
      showHomePage( req, res );
    }else if( requrl == '' ){
      showHomePage( req, res );
    }else if( requrl == '/' ){
      showHomePage( req, res );
    }else if( requrl.indexOf("/button_browse") > -1 || requrl.indexOf("/browse/") > -1 ){
      ibp_browse.main(req, res);
      return;
    }else if( requrl.indexOf('/button_share_save') > -1 ){
      ibp_share.share_save_model_data(req, res, url);
      return;
    }else if( requrl.indexOf('/button_create_model_save_data') > -1 ){
      ibp_create_model.save_model_data(req, res, url);
      return;
    }else if( requrl.indexOf('/create_model_images_python_start') > -1 ){
      showConvert_SVG( res )
      return;     
    }else if( requrl == '/button_share' || requrl.indexOf("/share/") > -1 ){
      ibp_share.main(req, res, url);
      return;
    }else if( requrl == '/button_help' || requrl.indexOf("/help/") > -1 ){
      ibp_help.main(req, res);
      return;
    }else if( requrl == '/button_about' || requrl.indexOf("/about/") > -1 ){
      ibp_about.main(req, res);
      return;
    }else if( requrl == '/production' || requrl.indexOf("/production/") > -1 ){
      ibp_production.main(req, res);
      return;
    }else if( requrl.indexOf("/generate_layers") > -1 ){  //  i.e. http://192.168.1.107/generate_layers?File_Name=/home/pi/ibox/www/packages/expanded/GearBoth40p/GearBoth40p_&Layer_Count=40
      //http://192.168.1.107/generate_layers?File_Name=/home/pi/ibox/www/packages/expanded/GearBoth40p/GearBoth40p_&Layer_Count=40
      console.log(requrl + ' : START')
      header( res );
      res.write('Generating generate_layers<br><br><br>');

      var url_parts = url.parse(req.url,true);
      data = JSON.stringify(url_parts );
      myGet = JSON.parse(data);
      myQuery = myGet.query;
      console.log("Layers : Layer_Count:",myQuery.Layer_Count );  //  USE: nano.local/beep?Beep_Count=4
      iBeep_Cnt = int(myQuery.Layer_Count);
      iBoxPrintManager.stdin.write('/beep:' + iBeep_Cnt + '\n');
      iLayers = int(myQuery.Layer_Count)
      console.log("Master Layer Path+Name : File_Name:",myQuery.File_Name );
      strFile_Name = myQuery.File_Name
      if( fs.existsSync(strFile_Name + '.png') ) {
        for(var i=0;i<iLayers;i++) {
          try { 
            strCMD = 'sudo cp ' + myQuery.File_Name + '.png ' + myQuery.File_Name + i + '.png'
            console.log('execSync: ' + strCMD)
            res.write('<br>execSync: ' + strCMD);
            eXcOut = execSync(strCMD);
            console.log(eXcOut);
          }catch (err) {
            console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
            res.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
          }
        }
      }  //  loop  //
      showHomePage( req, res );
      return;

    }else if( requrl.indexOf("/production_step_1") > -1 ){
      ibp_production.production_step_1(req, res, url);
      return;
    }else if( requrl == '/friends'){
      ibp_friends.main(req, res, url);
      return;
    }else if( requrl == '/serial_numbers'){
      strStatus = 'hostname=' + strZeroConfigName 
      strStatus = strStatus + ':RPi_SN=' + strRPi_Serial_Number
      strStatus = strStatus + ':Nano_SN=' + mySystem.Serial_Number
      res.write(strStatus)
      res.end();
      return;
    }else if( requrl == '/status'){
      //  send status to populate Friends
      console.log(requrl + ' : START')
      strStatus = 'hostname=' + strZeroConfigName 
      strStatus = strStatus + ':IP_Address=' + strIPAddress 
      strStatus = strStatus + ':Model_File=' + mySystem.lastFileName_FileName
      strStatus = strStatus + ':Config_File=' + mySystem.Selected_Config_File
      strStatus = strStatus + ':State=' + strPrinter_State
      strStatus = strStatus + ':State_2=' + strPrinter_State_Sm_2
      strStatus = strStatus + ':State_3=' + strPrinter_State_3
      strStatus = strStatus + ':HD=' + strFree_HD.substring(0,6);
      strStatus = strStatus + ':Node=' + strNodeJS_Software_Version
      strStatus = strStatus + ':Python=' + strPython_Software_Version
      strStatus = strStatus + ':RPi_SN=' + strRPi_Serial_Number
      strStatus = strStatus + ':Nano_SN=' + mySystem.Serial_Number

      res.write(strStatus)
      res.end();
      return;
    }else if( requrl == '/production_step_2'){
      ibp_production.production_step_2(req, res);
      return;

    }else if( requrl == '/generate_pyc'){
      console.log(requrl + ' : START')
      header( res );
      res.write('Generating PYC...<br><br>This takes about 30 seconds.<br>');
      try { 
        strCMD = 'sudo /home/pi/ibox/convert_and_move_py_to_pyc_to_root.sh'
        console.log('execSync: ' + strCMD)
        res.write('<br>execSync: ' + strCMD);
        eXcOut = execSync(strCMD);
        console.log(eXcOut);
      }catch (err) {
        console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
        res.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
      }
      //////////////////////////////////////////////////////////////////////////////////////////////////////
      ////  Back Button to Home ////
      ///////////////////////////////////////////////////
      
      res.write('<br>');
      res.write('<form name="input" action="http://' + strIPAddress + '" method="get">');
      res.write('<input type="submit" value=" Home ">');
      res.write('</form>');


      res.end();
      return;
    }else if( requrl == '/clean_wpa'  ){
      console.log(requrl + ' : START')
      //header( res );
      strDefaultDir = '/home/pi/ibox/default_files/'
      strIBOX = '/home/pi/ibox/'
      strFile = 'wpa_supplicant'

      copyFileSync(strDefaultDir + strFile + '.txt', '/etc/wpa_supplicant/' + strFile + '.conf')
      //res.write('<br>Copying: ' + strDefaultDir + strFile + '.txt' + ' TO ' + '/etc/wpa_supplicant/' + strFile + '.conf');
      //footer();
      //res.end();     
      ibp_production.main(req, res);
      return;

    }else if( requrl == '/delete_calibration'  ){
      console.log(requrl + ' : START')
      //header( res );
      strDefaultDir = '/home/pi/ibox/default_files/'
      strIBOX = '/home/pi/ibox/'
      strFile = 'wpa_supplicant'

      //  Put fresh mycalibration.json into directory
      strFile = 'mycalibration.json'
      copyFileSync(strDefaultDir + strFile, strIBOX + strFile)
      response.write('<br>Copying: ' + strDefaultDir + strFile + ' TO ' + strIBOX + strFile);  

      ibp_production.main(req, res);
      return;

    }else if( requrl == '/button_settings' || requrl.indexOf("/settings/") > -1 ){
      showSettings( req, res );
      //ibp_settings.main(req, res);
      return;
    }else if( requrl == '/button_settings_advanced' ){
      showAdvancedSettings( req, res );
      return;
    }else if( requrl == '/button_network_setup' ){
      showNetworkSetup( req, res );
      return;
    }else if( requrl.indexOf("/beep") > -1 ){
      var url_parts = url.parse(req.url,true);
      data = JSON.stringify(url_parts );
      myGet = JSON.parse(data);
      console.log("beep : myGet:",myGet );
      //  Step 4 : Transfer objects from myGet to current config  //
      myQuery = myGet.query;
      console.log("beep : Beep_Count:",myQuery.Beep_Count );  //  USE: nano.local/beep?Beep_Count=4
      iBeep_Cnt = 1
      if(int(myQuery.Beep_Count) > 0) {
        iBeep_Cnt = int(myQuery.Beep_Count)
      }

      iBoxPrintManager.stdin.write('/beep:' + iBeep_Cnt + '\n');
      showHomePage( req, res );
      return;

    }else if( requrl == '/update_hostname' || requrl.indexOf("update_hostname") > -1  ){
      //  Get hostname from [get]
      var url_parts = url.parse(req.url,true);
      
      data = JSON.stringify(url_parts );
      myGet = JSON.parse(data);
      console.log("update_hostname : myGet:",myGet );
      //  Step 4 : Transfer objects from myGet to current config  //
      myQuery = myGet.query;
      console.log("update_hostname : myQuery:",myQuery );
      console.log("myQuery.Hostname=",myQuery.Hostname);
      //  Send Hostname to Script : script_set_hostname.sh
      try { 
        strCMD = 'sudo /home/pi/ibox/script_set_hostname.sh ' + myQuery.Hostname
        console.log('update_hostname : ' + strCMD)
        eXcOut = execSync(strCMD);
        console.log(eXcOut);
      }catch (err) {
        console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
      }

      //  Let the user know they need to reboot to save the setting
            header( res );
      strURL = 'http://' + strIPAddress + '';
      strNetworkName = os.hostname();
      res.write('<meta http-equiv="refresh" content="140;URL=' + strURL + '">');
      res.write('<br>');
      res.write('<br>');
      res.write('<br>');
      res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Your network name has been changed from ' + strNetworkName + ' to ' + myQuery.Hostname + '. This change will not take effect until you restart your printer.</FONT>');

      res.write('<br>');

      
      //res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">Logs Deleted Successfully</FONT>');
      //////////////////////////////////////////////////////////////////////////////////////////////////////
      ////  Button Reboot ////
      ///////////////////////////////////////////////////
      strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/button_reboot_rpi';
      res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
      res.write('<input type="submit" value="Reboot Now">');
      res.write('</form>');
      res.write('<br>');
      
      //////////////////////////////////////////////////////////////////////////////////////////////////////
      ////  Back Button to Home ////
      ///////////////////////////////////////////////////
      strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '';
      res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
      res.write('<input type="submit" value="Back">');
      res.write('</form>');
  
      footer (res);

      
      //showNetworkSetup( req, res );
      return;
      
      
    }else if( requrl == '/show_thumb' ){
      console.log('HTTP requrl=[' + requrl + ']');
      ibp_generate_thumbnails.model_images_show(req, res, url);
      return;
    }else if( requrl == '/gen_thumb' ){
      console.log('HTTP requrl=[' + requrl + '] >> > > > >');
      //  If we dont pump the browser some HTML, the basterd will re-request this function, putting us in a loop
      header( res );
      res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#c6c6c6">');
      res.write("<h2>You have initiated the Model Image Creation Function.</h2><br>")
      res.write("<br>Nobody has ever pressed this button before and it tickles a little...<br>")
      res.write("<br>This will create thumbnails and images for your currently selected model.<br>")
      res.write("<br>This process can not be terminated!<br>")
      res.write("<br>During this process your nano and its Web interface will be completely unresponsive due to heavy CPU usage.<br>")
      res.write("<br>The duration of theis process depends on the number of layers in your model. You can estimate about 1-2seconds per layer. So a 200 layer model could take 400 seconds or about 6 minutes.<br>")
      res.write("<br>Please dont refresh your browser, it will run this again as soon as it finishes, thus causing further delays and such.<br>")
      res.write("<br>When the task is finished, you will see a message at the bottom of this page, unless your browser times out before the task is complete.<br><br>")
            //////////////////////////////////////////////////////////////////////////////////////////////////////
      ////  Back Button to Home ////
      ///////////////////////////////////////////////////
      strURLGo = 'http://' + strIPAddress + '';
      res.write('<form name="input" action="' + strURLGo + '" method="get">');
      res.write('<input type="submit" value="Home"> &nbsp This BUTTON will be unresponsive until the task completes.');
      res.write('</form>');
      
      ibp_generate_thumbnails.model_generate_images(req, res, url);
      res.write('</FONT>');
      res.write('<br><h2><font color="#FF0909"> FINISHED!</font></h2><br>')
      footer( res );
      res.end();
      res.end();
      res.end();
      
      return;
    }else if( requrl == '/manufacturing_and_test_off' ){
      iBoxPrintManager.stdin.write('/manufacturing_and_test_off\n');
      //ibp_manufacturing_and_test.main(req, res, url, iContrastAdjusted);
      showSettings( req, res );
      return;
    }else if( requrl == '/manufacturing_and_test_on' ){
      iBoxPrintManager.stdin.write('/manufacturing_and_test_on\n');
      //showSettings( req, res );
      ibp_manufacturing_and_test.main(req, res, url);
      return;
    }else if( requrl.indexOf("set_contrast") > -1   ){
      console.log('set_contrast: ' + req.url);
      var url_parts = url.parse(req.url,true); //Step 1 - get URL Parts
      data = JSON.stringify(url_parts ); //  Step 2: Get data from URL
      myGet = JSON.parse(data); //  Step 3: put data in JSON object so we can access data via key name
      console.log("myGet:",myGet ); //  Debug
      myQuery = myGet.query;//  Step 4 : Access objects from myGet  //
      iContrastAdjusted = 100 + int(myQuery.contrast)
      console.log("iContrastAdjusted=",iContrastAdjusted);
      iBoxPrintManager.stdin.write(iContrastAdjusted + '\n');
      ibp_manufacturing_and_test.main(req, res, url, iContrastAdjusted);
      return;
    }else if( requrl.indexOf("increment_contrast") > -1   ){
      console.log('increment_contrast: ' + req.url);
      var url_parts = url.parse(req.url,true); //Step 1 - get URL Parts
      data = JSON.stringify(url_parts ); //  Step 2: Get data from URL
      myGet = JSON.parse(data); //  Step 3: put data in JSON object so we can access data via key name
      console.log("myGet:",myGet ); //  Debug
      myQuery = myGet.query;//  Step 4 : Access objects from myGet  //
      iContrastAdjusted = 100 + int(myQuery.contrast) + 1

      if(iContrastAdjusted > 200) {
        iContrastAdjusted = 0
      }
      console.log("iContrastAdjusted=",iContrastAdjusted);
      iBoxPrintManager.stdin.write(iContrastAdjusted + '\n');
      ibp_manufacturing_and_test.main(req, res, url, iContrastAdjusted);
      return;

    }else if( requrl == '/contrast_screen_clear' ){
      iBoxPrintManager.stdin.write('5\n');
      ibp_manufacturing_and_test.main(req, res, url, iContrastAdjusted);
      return;
    }else if( requrl == '/contrast_screen_opaque' ){
      iBoxPrintManager.stdin.write('2\n');
      ibp_manufacturing_and_test.main(req, res, url, iContrastAdjusted);
      return;
    }else if( requrl == '/contrast_screen_scan' ){
      iBoxPrintManager.stdin.write('1\n');
      ibp_manufacturing_and_test.main(req, res, url, iContrastAdjusted);
      return;
    }else if( requrl == '/turn_on_leds' ){
      iBoxPrintManager.stdin.write('/turn_on_leds\n');
      ibp_manufacturing_and_test.main(req, res, url, iContrastAdjusted);
      return;
    }else if( requrl == '/turn_off_leds' ){
      iBoxPrintManager.stdin.write('/turn_off_leds\n');
      ibp_manufacturing_and_test.main(req, res, url, iContrastAdjusted);
      return;
    }else if( requrl == '/long_term_led_testing_on' ){
      iBoxPrintManager.stdin.write('/long_term_led_testing_on\n');
      ibp_manufacturing_and_test.main(req, res, url, iContrastAdjusted);
      return;

    }else if( requrl == '/manufacturing_and_test_on_calpwr' ){
      iBoxPrintManager.stdin.write('/manufacturing_and_test_on_calpwr\n');
      showSettings( req, res );
      //ibp_manufacturing_and_test.main(req, res, url, iContrastAdjusted);
      return;
    }else if( requrl == '/fix_permissions_directory_packages' ){
      try { 
        strCMD = 'sudo chmod -R 777 /home/pi/ibox/www/packages/'
        console.log('requrl : ' + strCMD)
        eXcOut = execSync(strCMD);
        console.log(eXcOut);
      }catch (err) {
        console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
      }
      showSettings( req, res );
      //ibp_manufacturing_and_test.main(req, res, url, iContrastAdjusted);
      return;

    }else if( requrl == '/fix_execute_permissions_directory_ibox' ){
      try { 
        strCMD = 'sudo chmod +x /home/pi/ibox/*'
        console.log('strCMD : ' + strCMD)
        eXcOut = execSync(strCMD);
        console.log(eXcOut);
      }catch (err) {
        console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
      }
      try { 
        strCMD = 'sudo chmod +x /home/pi/nano*' //  to catch nano_restore.py
        console.log('strCMD : ' + strCMD)
        eXcOut = execSync(strCMD);
        console.log(eXcOut);
      }catch (err) {
        console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
      }
      showSettings( req, res );
      //ibp_manufacturing_and_test.main(req, res, url, iContrastAdjusted);
      return;

    }else if( requrl == '/create_restore_point' ){
      header( res );
      res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">');
      ibp_production.create_restore_point(req, res);
      res.write('<br><h2><font color="#FF0909"> FINISHED!</font></h2><br>')
      res.write('<br>');
      res.write('<form name="input" action="http://' + strIPAddress + '" method="get">');
      res.write('<input type="submit" value=" Home ">');
      res.write('</form>');
      footer( res );
      res.end();
      return;

    }else if( requrl == '/fix_permissions_directory_config' ){
      try { 
        strCMD = 'sudo chmod -R 777 /home/pi/ibox/print_config_files/'
        console.log('requrl : ' + strCMD)
        eXcOut = execSync(strCMD);
        console.log(eXcOut);
      }catch (err) {
        console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
      }
      showSettings( req, res );
      //ibp_manufacturing_and_test.main(req, res, url, iContrastAdjusted);
      return;

    }else if( requrl == '/fix_permissions_directory_www' ){
      try { 
        strCMD = 'sudo chmod -R 777 /home/pi/ibox/www/'
        console.log('requrl : ' + strCMD)
        eXcOut = execSync(strCMD);
        console.log(eXcOut);
      }catch (err) {
        console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
      }
      showSettings( req, res );
      //ibp_manufacturing_and_test.main(req, res, url, iContrastAdjusted);
      return;

    }else if( requrl.indexOf("manufacturing_and_test_calibrate_long") > -1  ){
      // 5/8/2015  Getting sent ip_address
      console.log('manufacturing_and_test_calibrate_long: ' + req.url);
      var url_parts = url.parse(req.url,true); //Step 1 - get URL Parts
      data = JSON.stringify(url_parts ); //  Step 2: Get data from URL
      myGet = JSON.parse(data); //  Step 3: put data in JSON object so we can access data via key name
      console.log("myGet:",myGet ); //  Debug
      myQuery = myGet.query;//  Step 4 : Access objects from myGet  //
      console.log("access example :  myQuery.ip_address=",myQuery.ip_address);
      //  Only send to Python if its a valid IP Address  //
      if(myQuery.ip_address == srrIP_MnT_default) {
        iBoxPrintManager.stdin.write('/beep:10\n');
        console.log('You forgot to set an IP address');
      }else{
        iBoxPrintManager.stdin.write('/manufacturing_and_test_calibrate_long:' + myQuery.ip_address + '\n');
      }
      
      showSettings( req, res );  //  Great place to wait for MnT to finish
      return;

    }else if( requrl.indexOf("manufacturing_and_test_calibrate_quick") > -1  ){
      // 5/8/2015  Getting sent ip_address
      console.log('manufacturing_and_test_calibrate_quick: ' + req.url);
      var url_parts = url.parse(req.url,true); //Step 1 - get URL Parts
      data = JSON.stringify(url_parts ); //  Step 2: Get data from URL
      myGet = JSON.parse(data); //  Step 3: put data in JSON object so we can access data via key name
      console.log("myGet:",myGet ); //  Debug
      myQuery = myGet.query;//  Step 4 : Access objects from myGet  //
      console.log("access example :  myQuery.ip_address=",myQuery.ip_address);
      //  Only send to Python if its a valid IP Address  //
      if(myQuery.ip_address == srrIP_MnT_default) {
        iBoxPrintManager.stdin.write('/beep:10\n');
        console.log('You forgot to set an IP address');
      }else{
        iBoxPrintManager.stdin.write('/manufacturing_and_test_calibrate_quick:' + myQuery.ip_address + '\n');
      }
      
      showSettings( req, res );  //  Great place to wait for MnT to finish
      return;

    }else if( requrl.indexOf("manufacturing_and_test_calibrate_converge") > -1  ){
      // 5/8/2015  Getting sent ip_address
      console.log('manufacturing_and_test_calibrate_converge: ' + req.url);
      var url_parts = url.parse(req.url,true); //Step 1 - get URL Parts
      data = JSON.stringify(url_parts ); //  Step 2: Get data from URL
      myGet = JSON.parse(data); //  Step 3: put data in JSON object so we can access data via key name
      console.log("myGet:",myGet ); //  Debug
      myQuery = myGet.query;//  Step 4 : Access objects from myGet  //
      console.log("access example :  myQuery.ip_address=",myQuery.ip_address);
      //  Only send to Python if its a valid IP Address  //
      if(myQuery.ip_address == srrIP_MnT_default) {
        iBoxPrintManager.stdin.write('/beep:10\n');
        console.log('You forgot to set an IP address');
      }else{
        iBoxPrintManager.stdin.write('/manufacturing_and_test_calibrate_converge:' + myQuery.ip_address + '\n');
      }
      
      showSettings( req, res );  //  Great place to wait for MnT to finish
      return;

    }else if( requrl.indexOf("manufacturing_and_test_generate_table") > -1  ){
      // 5/8/2015  Getting sent ip_address
      console.log('manufacturing_and_test_generate_table: ' + req.url);
      var url_parts = url.parse(req.url,true); //Step 1 - get URL Parts
      data = JSON.stringify(url_parts ); //  Step 2: Get data from URL
      myGet = JSON.parse(data); //  Step 3: put data in JSON object so we can access data via key name
      console.log("myGet:",myGet ); //  Debug
      myQuery = myGet.query;//  Step 4 : Access objects from myGet  //
      console.log("access example :  myQuery.ip_address=",myQuery.ip_address);
      //  Only send to Python if its a valid IP Address  //
      if(myQuery.ip_address == srrIP_MnT_default) {
        iBoxPrintManager.stdin.write('/beep:10\n');
        console.log('You forgot to set an IP address');
      }else{
        iBoxPrintManager.stdin.write('/manufacturing_and_test_generate_table:' + myQuery.ip_address + '\n');
      }
      
      showSettings( req, res );  //  Great place to wait for MnT to finish
      return;


    }else if( requrl.indexOf("manufacturing_and_test_generate_power") > -1  ){
      // 5/8/2015  Getting sent ip_address
      console.log('manufacturing_and_test_generate_power: ' + req.url);
      var url_parts = url.parse(req.url,true); //Step 1 - get URL Parts
      data = JSON.stringify(url_parts ); //  Step 2: Get data from URL
      myGet = JSON.parse(data); //  Step 3: put data in JSON object so we can access data via key name
      console.log("myGet:",myGet ); //  Debug
      myQuery = myGet.query;//  Step 4 : Access objects from myGet  //
      console.log("access example :  myQuery.ip_address=",myQuery.ip_address);
      //  Only send to Python if its a valid IP Address  //
      if(myQuery.ip_address == srrIP_MnT_default) {
        iBoxPrintManager.stdin.write('/beep:10\n');
        console.log('You forgot to set an IP address');
      }else{
        iBoxPrintManager.stdin.write('/manufacturing_and_test_generate_power:' + myQuery.ip_address + '\n');
      }
      
      showSettings( req, res );  //  Great place to wait for MnT to finish
      return;

    }else if( requrl.indexOf("manufacturing_and_test_calibrate_individual") > -1  ){
      // 5/8/2015  Getting sent ip_address
      console.log('manufacturing_and_test_calibrate_individual: ' + req.url);
      var url_parts = url.parse(req.url,true); //Step 1 - get URL Parts
      data = JSON.stringify(url_parts ); //  Step 2: Get data from URL
      myGet = JSON.parse(data); //  Step 3: put data in JSON object so we can access data via key name
      console.log("myGet:",myGet ); //  Debug
      myQuery = myGet.query;//  Step 4 : Access objects from myGet  //
      console.log("access example :  myQuery.ip_address=",myQuery.ip_address);
      //  Only send to Python if its a valid IP Address  //
      if(myQuery.ip_address == srrIP_MnT_default) {
        iBoxPrintManager.stdin.write('/beep:10\n');
        console.log('You forgot to set an IP address');
      }else{
        iBoxPrintManager.stdin.write('/manufacturing_and_test_calibrate_individual:' + myQuery.ip_address + '\n');
      }
      
      showSettings( req, res );  //  Great place to wait for MnT to finish
      return;
      
    }else if( requrl.indexOf("manufacturing_and_test_calibrate_percent_avg") > -1 ){
      // 5/8/2015  Getting sent ip_address
      console.log('manufacturing_and_test_calibrate_percent_avg: ' + req.url);
      var url_parts = url.parse(req.url,true); //Step 1 - get URL Parts
      data = JSON.stringify(url_parts ); //  Step 2: Get data from URL
      myGet = JSON.parse(data); //  Step 3: put data in JSON object so we can access data via key name
      console.log("myGet:",myGet ); //  Debug
      myQuery = myGet.query;//  Step 4 : Access objects from myGet  //
      console.log("access example :  myQuery.ip_address=",myQuery.ip_address);
      //  Only send to Python if its a valid IP Address  //
      if(myQuery.ip_address == srrIP_MnT_default) {
        iBoxPrintManager.stdin.write('/beep:10\n');
        console.log('You forgot to set an IP address');
      }else{
        iBoxPrintManager.stdin.write('/manufacturing_and_test_calibrate_percent_avg:' + myQuery.ip_address + '\n');
      }
      
      showSettings( req, res );  //  Great place to wait for MnT to finish
      return;

    }else if( requrl.indexOf("manufacturing_and_test_calibrate_percent_adjust") > -1 ){
      // 5/8/2015  Getting sent ip_address and calibration_iterations
      console.log('manufacturing_and_test_calibrate_percent_avg: ' + req.url);
      var url_parts = url.parse(req.url,true); //Step 1 - get URL Parts
      data = JSON.stringify(url_parts ); //  Step 2: Get data from URL
      myGet = JSON.parse(data); //  Step 3: put data in JSON object so we can access data via key name
      console.log("myGet:",myGet ); //  Debug
      myQuery = myGet.query;//  Step 4 : Access objects from myGet  //
      console.log("raw :  myQuery.ip_address=",myQuery.ip_address);
      console.log("raw :  myQuery.calibration_iterations=",myQuery.calibration_iterations);
      //  Only send to Python if its a valid IP Address  //
      if(myQuery.ip_address == srrIP_MnT_default) {
        iBoxPrintManager.stdin.write('/beep:10\n');
        console.log('You forgot to set an IP address');
      }else{
        iBoxPrintManager.stdin.write('/manufacturing_and_test_calibrate_percent_adjust:' + myQuery.ip_address + ':' + myQuery.calibration_iterations + '\n');
      }
      
      showSettings( req, res );
      //ibp_manufacturing_and_test.main(req, res, url, iContrastAdjusted);
      return;

    }else if( requrl.indexOf("manufacturing_and_test_build_compair_table") > -1 ){
      // 5/8/2015  Getting sent ip_address and calibration_iterations
      console.log('manufacturing_and_test_build_compair_table: ' + req.url);
      var url_parts = url.parse(req.url,true); //Step 1 - get URL Parts
      data = JSON.stringify(url_parts ); //  Step 2: Get data from URL
      myGet = JSON.parse(data); //  Step 3: put data in JSON object so we can access data via key name
      console.log("myGet:",myGet ); //  Debug
      myQuery = myGet.query;//  Step 4 : Access objects from myGet  //
      console.log("raw :  myQuery.ip_address=",myQuery.ip_address);
      console.log("raw :  myQuery.calibration_iterations=",myQuery.calibration_iterations);
      //  Only send to Python if its a valid IP Address  //
      if(myQuery.ip_address == srrIP_MnT_default) {
        iBoxPrintManager.stdin.write('/beep:10\n');
        console.log('You forgot to set an IP address');
      }else{
        iBoxPrintManager.stdin.write('/manufacturing_and_test_build_compair_table:' + myQuery.ip_address + ':' + myQuery.calibration_iterations + '\n');
      }
      
      showSettings( req, res );
      //ibp_manufacturing_and_test.main(req, res, url, iContrastAdjusted);
      return;

    }else if( requrl.indexOf("manufacturing_and_test_calibrate_lcd_contrast") > -1 ){
      // 5/8/2015  Getting sent ip_address and calibration_iterations
      console.log('manufacturing_and_test_calibrate_lcd_contrast: ' + req.url);
      var url_parts = url.parse(req.url,true); //Step 1 - get URL Parts
      data = JSON.stringify(url_parts ); //  Step 2: Get data from URL
      myGet = JSON.parse(data); //  Step 3: put data in JSON object so we can access data via key name
      console.log("myGet:",myGet ); //  Debug
      myQuery = myGet.query;//  Step 4 : Access objects from myGet  //
      console.log("raw :  myQuery.ip_address=",myQuery.ip_address);
      console.log("raw :  myQuery.calibration_iterations=",myQuery.calibration_iterations);
      //  Only send to Python if its a valid IP Address  //
      if(myQuery.ip_address == srrIP_MnT_default) {
        iBoxPrintManager.stdin.write('/beep:10\n');
        console.log('You forgot to set an IP address');
      }else{
        iBoxPrintManager.stdin.write('/manufacturing_and_test_calibrate_lcd_contrast:' + myQuery.ip_address + ':' + myQuery.calibration_iterations + '\n');
      }
      
      //showSettings( req, res );
      ibp_manufacturing_and_test.main(req, res, url, iContrastAdjusted);
      return;


    }else if( requrl.indexOf("manufacturing_and_test_calibrate_lcd_quick_contrast") > -1 ){
      // 5/8/2015  Getting sent ip_address and calibration_iterations
      console.log('manufacturing_and_test_calibrate_lcd_quick_contrast: ' + req.url);
      var url_parts = url.parse(req.url,true); //Step 1 - get URL Parts
      data = JSON.stringify(url_parts ); //  Step 2: Get data from URL
      myGet = JSON.parse(data); //  Step 3: put data in JSON object so we can access data via key name
      console.log("myGet:",myGet ); //  Debug
      myQuery = myGet.query;//  Step 4 : Access objects from myGet  //
      console.log("raw :  myQuery.ip_address=",myQuery.ip_address);
      console.log("raw :  myQuery.calibration_iterations=",myQuery.calibration_iterations);
      //  Only send to Python if its a valid IP Address  //
      if(myQuery.ip_address == srrIP_MnT_default) {
        iBoxPrintManager.stdin.write('/beep:10\n');
        console.log('You forgot to set an IP address');
      }else{
        iBoxPrintManager.stdin.write('/manufacturing_and_test_calibrate_lcd_quick_contrast:' + myQuery.ip_address + ':' + myQuery.calibration_iterations + '\n');
      }
      
      //showSettings( req, res );
      ibp_manufacturing_and_test.main(req, res, url, iContrastAdjusted);
      return;


    }else if( requrl.indexOf("set_box_100") > -1 ){
      // 5/8/2015  Getting sent ip_address and calibration_iterations
      console.log('set_box_100: ' + req.url);
      //  Only send to Python if its a valid IP Address  //
      iBoxPrintManager.stdin.write('/set_box_100\n');      
      return;

    }else if( requrl == '/button_create_model' ){
      ibp_create_model.main(req, res, url);
      return;
    }else if( requrl == '/button_manufandtest' ){
      ibp_manufacturing_and_test.main(req, res, url, iContrastAdjusted);
      return;
      
    
    /*}else{
      console.log('sending 404 to browser')
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.write('The file or path [' + requrl + '] Not Found. 404 File or Path Not Found\n');
      res.end();
      return;
      */
    }

    //  Because of the ELSE above, this section should never load. If, in the future we want to serve files via Node.js, we will need to delete the }else{ above and let this run. BUT if so we need to make sure that self pathes random dirs and paths dont crash the system}
    
    // <<<<<<< Look at brackets here ; simething amiss; Trent 3/7/15
    try {
      //console.log('Looking for File: '+filename); //  Note the root file stsm is /home/pi, so add Working Path: /ibox/tron.png" or /ibox/images/img.jpg
      stats = fs.lstatSync(filename); // throws if path doesn't exist
    } catch (e) {
      //  If its not a file, then it wont be found, but may be a dir or path. i.e. 192.168.2.103/button_print
      console.log('File NotFound: '+filename);
      
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.write('404 Not Found EOL\n');
      res.end();
      return;
      
    }
    if (stats.isFile()) {
      // path exists, is a file
      //var mimeType = mimeTypes[path.extname(filename).split(".").reverse()[0]]; //orig code from: http://stackoverflow.com/questions/7268033/basic-static-file-server-in-nodejs
      //var mimeType = mimeTypes[path.extname(filename).split(".").reverse()[0]];
      //res.writeHead(200, {'Content-Type': mimeType} );
      //var fileStream = fs.createReadStream(filename);
      //fileStream.pipe(res);
      
      //  From: http://www.cburch.com/cs/340/reading/nodejs/
      path.exists(filename, function (exists) {
        var extension, mimeType, fileStream;
        if (exists) {
            extension = path.extname(filename).substr(1);
            mimeType = mimeTypes[extension] || 'application/octet-stream';
            res.writeHead(200, {'Content-Type': mimeType});
            console.log('serving ' + filename + ' as ' + mimeType);
    
            fileStream = fs.createReadStream(filename);
            fileStream.pipe(res);
            return; //  TRC, so it does not go on to load the default htm
        } else {
            console.log('not exists: ' + filename);
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.write('404 Not Found\n');
            res.end();
        }
      }); //end path.exists
     
    } else if (stats.isDirectory()) {
      // path exists, is a directory
      ///res.writeHead(200, {'Content-Type': 'text/plain'});
      ///res.write('Index of '+uri+'\n');
      ///res.write('TODO, show index?\n');
      ///res.end();
      
      showHomePage( req, res );
    
    } else {  //  if (stats.isFile()) {
    // Symbolic link, other?
    // TODO: follow symlinks?  security?
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.write('500 Internal server error\n');
    res.end();
  } //  END of if (stats.isFile()) {
 // footer( res );
});


// Pipe list of files to StdOut
//runCommand( 'ls', '-tr1', '/home/pi/ibox/uploads/' );

console.log('iBoxWebGUI.js : STARTING...');

console.log('<<< <<< <<< Loading iBoxPrintManager Python >>> >>> >>>');
var iBoxPrintManager 
strTarget = '/home/pi/ibox/iBoxPrintManager.py'
if ( fs.existsSync( strTarget ) ) {
  try { 
    console.log('spawn(python3, /home/pi/ibox/iBoxPrintManager.py');
    iBoxPrintManager = spawn('python3', ['/home/pi/ibox/iBoxPrintManager.py','']); //  2/8/2015 (SRR)CHANGE THIS PATH TO THE .PYC
  }catch (err) {
    console.log('ERROR [' + err + '] : executing spawn(python3, /home/pi/ibox/iBoxPrintManager.py')
  }
}else{
  try { 
    console.log('spawn(python3, /home/pi/ibox/iBoxPrintManager.pyc');
    iBoxPrintManager = spawn('python3', ['/home/pi/ibox/iBoxPrintManager.pyc','']); //  2/8/2015 (SRR)CHANGE THIS PATH TO THE .PYC
  }catch (err) {
    console.log('ERROR [' + err + '] : executing spawn(python3, /home/pi/ibox/iBoxPrintManager.pyc')
  }
}
console.log('<<< <<< <<< Loading iBoxPrintManager COMPLETE >>> >>> >>>');

//  Make sure network interface is awake and ready
var exec = require('child_process').exec;
  exec('sudo wpa_cli enable_network all', function (error, stdout, stderr) {
});

setTimeout( function(){
  //iBoxPrintManager.stdin.write('connecting\n');
  try { 
    
    if(iBoxPrintManager.stdin) {
      console.log('iBoxPrintManager.stdin.write[connected...');
      iBoxPrintManager.stdin.write('connected\n');
      // If we get here then the PYC was not corrupted  // 
    }else{
      console.log('iBoxPrintManager.stdin does not exist. Please dont crash');
      return;
    }


  }catch (err) {
    console.log('ERROR [' + err + '] : executing iBoxPrintManager.stdin.write')
    //  If we get here the PYC was corrupted and a new one needs to be used. Use known good PYC  //
    strSource = '/home/pi/ibox/iBoxPrintManager.pyc_backup'
    strTarget = '/home/pi/ibox/iBoxPrintManager.pyc'
    if ( fs.existsSync( strSource ) ) {
      try { 
        strCMD = 'sudo cp ' + strSource + ' ' + strTarget
        console.log('execSync: ' + strCMD)
        eXcOut = execSync(strCMD);
        console.log(eXcOut);
        //  Relaunch Myself  //
        try { 
          strCMD = 'sudo forever restartall' //restart -a /home/pi/ibox/iBoxWebGUI.js'
          console.log('exec : ' + strCMD)
          eXcOut = execSync(strCMD);
          console.log(eXcOut);
        }catch (err) {
          console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
        }
      }catch (err) {
        console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
      }
    }else{
      console.log('No pyc_backup exists, must have been a Beta user. Try to save it by stopping the python connection and sending them to the update page.')
      bRecommend_Update = true;
      //iBoxPrintManager = nil; 
      return;
    }
  }
  

}, 2000 );

iBoxPrintManager.stdout.on('data', function (data) {
  console.log( 'iBoxPrintManager-Message: '+data ); //todo use some ajax to feed it to our browser here...
  var strData = String(data);
  var aryData = strData.split(":");
  for(var i=0;i<aryData.length;i++) {
    //console.log('Ary[' + i + ']==(' + aryData[i] + ')');
  }
  //  Look for Message Tags here  //
  if (aryData.length > 1) {
    if (aryData[0] == "Message_GUI") {
      //  A message was sent from the iBox printer to the GUI  //
      if(aryData[1] != "") {
        strPrinter_State = aryData[1];
      }
      //  Send it to the browser  //
    }
    if (aryData[0] == "Message_JSON") {
      //  Check for "Message_JSON" in aryData[1]
      if (aryData[1].indexOf(aryData[0]) > -1 || aryData[2].indexOf(aryData[0]) > -1 ) {
        console.log('ERROR : we found a [' + aryData[0] + '] in the Data Element aryData [' + aryData + ']')
        //  We can either remove the string from the data, or discard the data
        aryData[1] = aryData[1].replace(aryData[0],"");
        aryData[2] = aryData[2].replace(aryData[0],"");
        //  Replaced
        console.log('New aryData[1]=' + aryData[1] + ' : new aryData[2]=' + aryData[2])
      }
      //  A message was sent from the iBox printer to Node.js to be saved in the JSON object (mySystem.json)  //
      if(aryData[1] != "") {
        console.log("Message_JSON:" + aryData[1] + ":" + aryData[2])
        if(aryData[1] == "Print_Counter"){
          mySystem.Print_Counter = aryData[2].replace("\n","");
        }else if(aryData[1] == "Print_Time"){
          mySystem.Print_Time = aryData[2].replace("\n","");
        }else if(aryData[1] == "Print_UV_Time"){
          mySystem.Print_UV_Time = aryData[2].replace("\n","");
        }else if(aryData[1] == "Print_UV_Time_Per_LED"){
          mySystem.Print_UV_Time_Per_LED = aryData[2].replace("\n","");
        }else if(aryData[1] == "Prints_Started"){
          mySystem.Prints_Started = aryData[2].replace("\n","");
        }else if(aryData[1] == "Prints_Finished"){
          mySystem.Prints_Finished = aryData[2].replace("\n","");
        }else if(aryData[1] == "Load_Counter_Python"){
          mySystem.Load_Counter_Python = aryData[2].replace("\n","");
          //  Save : but maybe delayed because these will come fast
          //  Save here because this one will always be LAST, thus the file mySystem.json is less likely to be OPEN
          fsSystem_Save();
        }

      }
      //  Send it to the browser  //
    }
    if (aryData[0] == "Update_Meta_Refresh") {
      //  A message was sent from the iBox printer to the GUI  //
      if(aryData[1] != "") {
        iMeta_Refresh_Seconds = aryData[1];
      }
      //  Send it to the browser  //
    }
    if (aryData[0] == "Message_GUI_Sm_1") {
      //  A message was sent from the iBox printer to the GUI  //
      if(aryData[1] != "") {
        strPrinter_State_Sm_1 = aryData[1];
      }
      //  Send it to the browser  //
    }
    if (aryData[0] == "Message_GUI_3") {
      //  A message was sent from the iBox printer to the GUI  //
      if(aryData[1] != "") {
        strPrinter_State_3 = aryData[1];  
      }
      //  Send it to the browser  //
    }
    if (aryData[0] == "Message_GUI_Sm_2") {
      //  A message was sent from the iBox printer to the GUI  //
      if(aryData[1] != "") {
        strPrinter_State_Sm_2 = aryData[1];  
      }
      //  Send it to the browser  //
    }
    if (aryData[0] == "Message_GUI_Print_Percentage") {
      //  A message was sent from the iBox printer to the GUI  //
      if(aryData[1] != "") {
        strText_LCD_Print_Percentage_Completed = aryData[1];  
      }
      //  Send it to the browser  //
    }
    if (aryData[0] == "Message_State_Boot") {
      //  A message was sent from the iBox printer regarding Boot State //
      if(aryData[1] != "") {
        iBox_Printer_State_Boot = aryData[1];
        //  Trim \n crlf
        iBox_Printer_State_Boot = iBox_Printer_State_Boot.replace("\n","");
      }
    }

if (aryData[0] == "Message_LCD") {
      //  A message was sent from the iBox printer to Node.js to be saved in the JSON object (mySystem.json)  //
      if(aryData[1] != "") {
        console.log("Message_LCD:" + aryData[1])
          var lcd = aryData[1].split(",");
          var strLcd = lcd.join(",");
          myConfig.iLCD_Contrast = aryData[1].replace("\n","").replace("\'", "");;
          fsConfig_Save();
        }

}

if (aryData[0] == "Message_Calibration") {
      //  A message was sent from the iBox printer to Node.js to be saved in the JSON object (mySystem.json)  //
      if(aryData[1] != "") {
        console.log("Message_Calibration:" + aryData[1])
          var calibration = aryData[1].split(",");
          var strCalibratedValues = calibration.join(",");
          myConfig.iOEM_Calibrated_UV_LED_PWM = aryData[1].replace("\n","").replace("\'", "");;
          myCalibration.iOEM_Calibrated_UV_LED_PWM = aryData[1].replace("\n","").replace("\'", "");;
          fsConfig_Save();
          fsCalibration_Save(); 
        }

}

    if (aryData[0] == "Message_Pre_Calibration") {
          //  A message was sent from the iBox printer to Node.js to be saved in the JSON object (mySystem.json)  //
      if(aryData[1] != "") {
        console.log("Message_Pre_Calibration:" + aryData[1])
          myCalibration.iOEM_Calibrated_UV_LED_uV_at_9mA_Pre_Cal = aryData[1].replace("\n","").replace("\'", "");;
          fsCalibration_Save(); 
        }

    }

    if (aryData[0] == "Message_Post_Calibration") {
          //  A message was sent from the iBox printer to Node.js to be saved in the JSON object (mySystem.json)  //
      if(aryData[1] != "") {
        console.log("Message_Post_Calibration:" + aryData[1])
          myCalibration.iOEM_Calibrated_UV_LED_uV_at_9mA_Post_Cal = aryData[1].replace("\n","").replace("\'", "");;
          fsCalibration_Save(); 
        }

    }

    if (aryData[0] == "Message_Individual") {
          //  A message was sent from the iBox printer to Node.js to be saved in the JSON object (mySystem.json)  //
      if(aryData[1] != "") {
        console.log("Message_Individual:" + aryData[1])
          myCalibration.iOEM_Calibrated_UV_LED_uV_at_9mA_Pre_Individual = aryData[1].replace("\n","").replace("\'", "");;
          fsCalibration_Save(); 
        }

    }

    if (aryData[0] == "Message_Power_Table") {
          //  A message was sent from the iBox printer to the GUI  //
          //  used for calibrated voltage read
          //  example: Message_Calibrate_2: ( (data seperated by commas)
      if(aryData[1] != "") {
        if(aryData[1] == "uW_at_6"){       
          var uWValues = aryData[2].split(","); 
          var strUWValues = uWValues.join(",");
          myCalibration.uW_at_6 = strUWValues.replace("\n", "");
        }

        if(aryData[1] == "uW_at_7"){       
          var uWValues = aryData[2].split(","); 
          var strUWValues = uWValues.join(",");
          myCalibration.uW_at_7 = strUWValues.replace("\n", "");
        }

        if(aryData[1] == "uW_at_8"){       
          var uWValues = aryData[2].split(","); 
          var strUWValues = uWValues.join(",");
          myCalibration.uW_at_8 = strUWValues.replace("\n", "");
        }

        if(aryData[1] == "uW_at_9"){       
          var uWValues = aryData[2].split(","); 
          var strUWValues = uWValues.join(",");
          myCalibration.uW_at_9 = strUWValues.replace("\n", "");
        }

        if(aryData[1] == "uW_at_10"){       
          var uWValues = aryData[2].split(","); 
          var strUWValues = uWValues.join(",");
          myCalibration.uW_at_10 = strUWValues.replace("\n", "");
        }

        if(aryData[1] == "uW_at_11"){       
          var uWValues = aryData[2].split(","); 
          var strUWValues = uWValues.join(",");
          myCalibration.uW_at_11 = strUWValues.replace("\n", "");
        }

        if(aryData[1] == "uW_at_12"){       
          var uWValues = aryData[2].split(","); 
          var strUWValues = uWValues.join(",");
          myCalibration.uW_at_12 = strUWValues.replace("\n", "");
        }

        if(aryData[1] == "uW_at_13"){       
          var uWValues = aryData[2].split(","); 
          var strUWValues = uWValues.join(",");
          myCalibration.uW_at_13 = strUWValues.replace("\n", "");
        }

        if(aryData[1] == "uW_at_14"){       
          var uWValues = aryData[2].split(","); 
          var strUWValues = uWValues.join(",");
          myCalibration.uW_at_14 = strUWValues.replace("\n", "");
        }

        if(aryData[1] == "uW_at_15"){       
          var uWValues = aryData[2].split(","); 
          var strUWValues = uWValues.join(",");
          myCalibration.uW_at_15 = strUWValues.replace("\n", "");
        }

        if(aryData[1] == "uW_at_16"){       
          var uWValues = aryData[2].split(","); 
          var strUWValues = uWValues.join(",");
          myCalibration.uW_at_16 = strUWValues.replace("\n", "");
        }

        if(aryData[1] == "uW_at_17"){       
          var uWValues = aryData[2].split(","); 
          var strUWValues = uWValues.join(",");
          myCalibration.uW_at_17 = strUWValues.replace("\n", "");
        }

        if(aryData[1] == "uW_at_18"){       
          var uWValues = aryData[2].split(","); 
          var strUWValues = uWValues.join(",");
          myCalibration.uW_at_18 = strUWValues.replace("\n", "");
        }

        if(aryData[1] == "uW_at_19"){       
          var uWValues = aryData[2].split(","); 
          var strUWValues = uWValues.join(",");
          myCalibration.uW_at_19 = strUWValues.replace("\n", "");
        }

        fsCalibration_Save();
      }
    }

    if (aryData[0] == "Message_State_General") { //  "Printing", "Stopped", Ready" etc
      //  A message was sent from the iBox printer regarding Boot State //
      if(aryData[1] != "") {
        iBox_Printer_State_General = aryData[1];
        iBox_Printer_State_General = iBox_Printer_State_General.replace("\n","");
        if(iBox_Printer_State_General == 'Generate_Model_Images') {
          console.log('Python Message : ' + aryData[0] + ' : ' + iBox_Printer_State_General);
          ibp_generate_thumbnails.model_generate_images();
        }
      }
    }
  }
});
/*
io.sockets.on('connection', function(socket) { //  From: http://stackoverflow.com/questions/7490547/sending-messages-to-all-browsers-with-socket-io
    socket.on('send_message', function(data) {
    data.message = data.message + ' yo<br/>';
    socket.emit('get_message',data);
    });
});
*/
function fcnSendClientSideSocketsIO_JS( res ){  /////  SOCKET.IO  //////// <--------------->
  //res.write('');
  /*
  res.write('  <script src="//ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js" type="text/javascript"></script>');
  res.write('    <script src="/socket.io/socket.io.js"></script>');
  res.write('    <script>');
  res.write('    $(document).ready(function() {');
  res.write('    var socket = io.connect("http://localhost:4000");');
  res.write('');
  res.write('    $("#sender").live("click",function() {');
  res.write('            var user_message = $("#message_box").val()');
  //res.write('            socket.emit("send_message",{message: user_message});');
  res.write('             io.sockets.emit("get_message", data);');
  res.write('    });');
  res.write('');
  res.write('    socket.on("get_message", function(data) {');
  res.write('        $("#data").append(data.message);');
  res.write('        });');
  res.write('    });');
  res.write('</script>');
  res.end();
*/
}

function fcnSendClientSideSocketsIO_HTML( res ){  /////  SOCKET.IO  //////// <--------------->
/*
  res.write('<div id="data"></div>');
  res.write('<input type="text" id="message_box" placeholder="send message">');
  res.write('<button id="sender">Send Message</button>');
  res.end();
*/
}

function fcnUpdate_IP_Address () {
  //console.log('Updating IP Address');
  //  Get IP Address of iBox

  //  Get IP address so we can serve images from a real web server  //
  var
      // Local ip address that we're trying to calculate
      address
      // Provides a few basic operating-system related utility functions (built-in)
      ,os = require('os')
      // Network interfaces
      ,ifaces = os.networkInterfaces();
  
  
  // Iterate over interfaces ...
  for (var dev in ifaces) {
  
      // ... and find the one that matches the criteria
      var iface = ifaces[dev].filter(function(details) {
          return details.family === 'IPv4' && details.internal === false;
      });
  
      if(iface.length > 0) address = iface[0].address;
  }

  // Print the result
  //console.log(address); // 10.25.10.147
  strIPAddress = address; //"http://192.168.2.103"
  strApacheRootLink = 'http://' + address + ":8000/"
  
  strZeroConfigName = os.hostname();
  //console.log('IP Address is:',strIPAddress)
  
}



iBoxPrintManager.stderr.on('data', function (data) {
  console.log('iBoxPrintManager err: ' + data);
});

iBoxPrintManager.stdout.on('end', function(data) {
  iBoxPrintManager.stdout.end();
} );

iBoxPrintManager.on('exit', function (code) {
  if (code !== 0) {
    console.log('iBoxPrintManager process exited with code ' + code);
  }
  console.log('iBoxPrintManager exited!');
  iBoxPrintManager.stdin.end(); 
  //Respawn iBoxPrintManager
  //  Notify GUI
  strPrinter_State = "Firmware Error " + code
  strPrinter_State_Sm_1 = "You may have to reboot"
});



//Start webserver on port specified here. 
console.log('>>>Binding Node.js to server port: ' + port)
try {
    printserver.listen(port);
    //var err = new Error('example');
    //throw err;
} catch (err) {
    // handle the error safely
    //  Node already has a handle on Port 80, so you can kill it like this:
    console.log("KILLING NODE or who(m)ever has a hold of port 80")
    try { 
      strCMD = 'sudo fuser -k 80/tcp'
      eXcOut = execSync(strCMD);
      console.log(eXcOut);
    }catch (err) {
      console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
    }

    //var exec = require('child_process').exec;
    //  exec('sudo fuser -k 80/tcp', function (error, stdout, stderr) {
    //  });
    
    console.log(err);
}



fcnUpdate_IP_Address();
//  The End  //

//  Manual creation of mysystem.json and myconfig.json
//  These are normally COMMENTED
//fsSystem_Save(); //  If this command is BEFORE _Load, it will overwrite and/or create a JSON file with the defaults as listed in the Def VAR at the header of this file
//fsSystem_Load();
//fsConfig_Save(); //  If this command is BEFORE _Load, it will overwrite and/or create a JSON file with the defaults as listed in the Def VAR at the header of this file

// Load Settings from File  //
fsSystem_Load();
fsConfig_Load();
fsCalibration_Load();



function Check_Log_Size() {
  console.log('Checking Log Sizes...');
  var fileSizeInMegabytes = 0
  //strLogFile_FullPath = 'http://' + strIPAddress + ':8000/logs/iBoxWebGUI_Forever_StdOut.log'
  strLogFile_LocalPath = '/home/pi/ibox/www/logs/iBoxWebGUI_Forever_StdOut.log'
  //  Get log file size  //
  if( fs.existsSync(strLogFile_LocalPath) ) {
      stats = fs.statSync(strLogFile_LocalPath)
      fileSizeInBytes = stats["size"]
      //Convert the file size to megabytes (optional)
      fileSizeInMegabytes_1 = fileSizeInBytes / 1000000.0  
      if(fileSizeInMegabytes_1 > fileSizeInMegabytes) {
        fileSizeInMegabytes = fileSizeInMegabytes_1;
      }
      console.log('Check_Log_Size : ' + strLogFile_LocalPath + ' = ' + fileSizeInMegabytes_1 + ' Mbytes');
  }
  //res.write('<a href="' + strLogFile_FullPath + '" download="' + strLogFile_FullPath + '">' + strLogFile_FullPath + '</a> <br>File Size: ' + fileSizeInMegabytes + ' MBytes<br>');

  //  Error Log - Havent seen anything in this one
  //strLogFile_FullPath = 'http://' + strIPAddress + ':8000/logs/iBoxWebGUI_Forever_Err.log'
  strLogFile_LocalPath = '/home/pi/ibox/www/logs/iBoxWebGUI_Forever_Err.log'
  //  Get log file size  //
  if( fs.existsSync(strLogFile_LocalPath) ) {
      stats = fs.statSync(strLogFile_LocalPath)
      fileSizeInBytes = stats["size"]
      //Convert the file size to megabytes (optional)
      fileSizeInMegabytes_2 = fileSizeInBytes / 1000000.0 
      if(fileSizeInMegabytes_2 > fileSizeInMegabytes) {
        fileSizeInMegabytes = fileSizeInMegabytes_2;
      } 
      console.log('Check_Log_Size : ' + strLogFile_LocalPath + ' = ' + fileSizeInMegabytes_2 + ' Mbytes');
  }
  //res.write('<a href="' + strLogFile_FullPath + '" download="' + strLogFile_FullPath + '">' + strLogFile_FullPath + '</a> <br>File Size: ' + fileSizeInMegabytes + ' MBytes<br>');
  
    //  Forever Regular Log - i.e. having to restart service
  //strLogFile_FullPath = 'http://' + strIPAddress + ':8000/logs/iBoxWebGUI_Forever_Log.log'
  strLogFile_LocalPath = '/home/pi/ibox/www/logs/iBoxWebGUI_Forever_Log.log'
  //  Get log file size  //
  if( fs.existsSync(strLogFile_LocalPath) ) {
      stats = fs.statSync(strLogFile_LocalPath)
      fileSizeInBytes = stats["size"]
      //Convert the file size to megabytes (optional)
      fileSizeInMegabytes_3 = fileSizeInBytes / 1000000.0  
      if(fileSizeInMegabytes_3 > fileSizeInMegabytes) {
        fileSizeInMegabytes = fileSizeInMegabytes_3;
      }
      console.log('Check_Log_Size : ' + strLogFile_LocalPath + ' = ' + fileSizeInMegabytes_3 + ' Mbytes');
  }
  //res.write('<a href="' + strLogFile_FullPath + '" download="' + strLogFile_FullPath + '">' + strLogFile_FullPath + '</a> <br>File Size: ' + fileSizeInMegabytes + ' MBytes<br>');
  fileSizeInMegabytes_Maximum = 200; //  Megabytes
  if(fileSizeInMegabytes > fileSizeInMegabytes_Maximum) {
    console.log('fileSizeInMegabytes ('+ fileSizeInMegabytes +') is greater than allowed Max')
    //  Alert driver.
    strText_LCD_Line_3 = "WARNING: Archive or Delete logs from Advanced Settings."
  }

}

Check_Log_Size();

mySystem.Load_Counter_NodeJS = int(mySystem.Load_Counter_NodeJS) + 1;

//  Populate Vars from JSON  //
lastFileName_FullPath = mySystem.lastFileName_FullPath; //  Save Settings
lastFileName_FileName = mySystem.lastFileName_FileName;
if (lastFileName_FullPath == undefined) {
  lastFileName_FullPath = "";
}
if (lastFileName_FileName == undefined) {
  lastFileName_FileName = "";
}
strFileExistingOrNew = "existing_file" //#"new_file : existing_file"

//  Set Software Version  //
strSoftwareVersion = mySystem.Version_NodeJS_Major + "." + mySystem.Version_NodeJS_Minor + ":" + mySystem.Version_Python_Major + "." + mySystem.Version_Python_Minor
//  real software vesion populated during the Software Update process and stored in mySystem aka mysystem.json
strNodeJS_Software_Version = mySystem.Version_NodeJS_Major + "." + mySystem.Version_NodeJS_Minor
strPython_Software_Version = mySystem.Version_Python_Major + "." + mySystem.Version_Python_Minor
//strPrinter_State_Sm_2 = strSoftwareVersion;

//  Log Memory usage
  strCMD = 'free -m'
  try { 
  eXcOut = execSync(strCMD);
    console.log(eXcOut);
  }catch (err) {
    console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
  }
  //  Log free diskspace
  diskspace.check('/', function (err, total, free, status)
  {
    strFree_HD = String(free/1000000).substring(0,7);   
    console.log('diskspace:' + strFree_HD)
  });

//  Get Raspberry Pi Serial Number from Broadcom chip  //
    strCMD = 'cat /proc/cpuinfo'
  try { 
  eXcOut = execSync(strCMD);
    console.log(eXcOut);
    //  Strip Spaces  //
    strCleaned = eXcOut.replace(" ", '');
    //  strRPi_Serial_Number
    aryRaw = strCleaned.split(/\r?\n/); //("/\r/")
    for(var i=0; i<aryRaw.length; i++) {
      console.log('[' + i + ']=[' + aryRaw[i] + ']')
      aryRaw_Split = aryRaw[i].split(":");
      if(aryRaw_Split[0] = 'Serial') {
        strSN = aryRaw_Split[1];
      }
    }
    strRPi_Serial_Number = strSN.replace(' ', '');
    console.log('RPi_Serial_Number=' + strRPi_Serial_Number)
    mySystem.RPi_Serial_Number = strRPi_Serial_Number
    fsSystem_Save();
  }catch (err) {
    console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
  }

console.log('Loading ibp_share.load_google_cloud_storage_object')
ibp_share.load_google_cloud_storage_object();

console.log("iBoxWebGUI : loaded and <<<< READY >>>>> 1.1x");

function copyFileSync( source, target ) {
  //  From: http://stackoverflow.com/questions/13786160/copy-folder-recursively-in-node-js
    var targetFile = target;
    var strSource_File = source;
    //  Make sure the source exists
    if ( fs.existsSync( strSource_File ) ) {
      //if target is a directory a new file with the same name will be created
      if ( fs.existsSync( target ) ) {
          if ( fs.lstatSync( target ).isDirectory() ) {
              targetFile = path.join( target, path.basename( source ) );
          }
      }
      fs.createReadStream( source ).pipe( fs.createWriteStream( targetFile ) );
    }else{
      console.log('copyFileSync : ERROR : strSource_File [' + strSource_File + '] DOES NOT EXIST --> No Copy Performed')
    }
}

function copyFolderRecursiveSync( source, target ) {
    var files = [];
    //  From: http://stackoverflow.com/questions/13786160/copy-folder-recursively-in-node-js
    //check if folder needs to be created or integrated
    var targetFolder = path.join( target, path.basename( source ) );
    if ( !fs.existsSync( targetFolder ) ) {
        fs.mkdirSync( targetFolder );
    }

    //copy
    if ( fs.lstatSync( source ).isDirectory() ) {
        files = fs.readdirSync( source );
        files.forEach( function ( file ) {
            var curSource = path.join( source, file );
            if ( fs.lstatSync( curSource ).isDirectory() ) {
                copyFolderRecursiveSync( curSource, targetFolder );
            } else {
                copyFileSync( curSource, targetFolder );
            }
        } );
    }
}

function header_css (response, varRefreshLocation) {
  //var refreshLocation = "button_browse";
  refreshLocation = varRefreshLocation
  var header = require('./header');
  header.printHeader(response, strIPAddress, refreshLocation); //strIPAddress
}

function zeroPad(num, places) {
  //  Pad zeros; i.e. zeroPad(5, 4) will return 0005
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}

function get_iContrastAdjusted() {

  return iContrastAdjusted;
}
exports.get_iContrastAdjusted = get_iContrastAdjusted;
