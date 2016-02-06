//  ibp_prduction  // 
//  Created: 3/15/2015
//  Copyright iBox Printers Inc 2015

//  Includes
var gcloud
var fs = require('fs');
var os = require('os');
var diskspace = require('diskspace');
var strFontStyle = ('font-family: "Arial Black", "Arial Bold", Gadget, sans-serif;');
var strIPAddress = '127.0.0.1';
var strFullPath = "http://" + strIPAddress + ':8000/' ; //  Apache is on port 8000 just to serve files FAST, Node.js is set up to also serve the files, but its slow.
var strFontStyle = ('font-family: lucida sans typewriter, courier new, monospace;');
var strFree_HD = "wait"
	diskspace.check('/', function (err, total, free, status)
	{
		strFree_HD = String(free/1000000).substring(0,7);   
	});
var execSync = require('exec-sync'); //  4/7/2015 so I can nest a Imagemagick shell loop

//  Config and System 
var strUploadPath_CONFIG_FILES = '/home/pi/ibox/print_config_files/';
var strHomeDirectory = '/home/pi/ibox/';
var strConfigDirectory = '/home/pi/ibox/print_config_files/';
var strSystem_File_Name = 'mysystem';
var strCalibration_File_Name = 'mycalibration';
var strConfig_File_Name = 'default';
var strUpdates_File_Name = 'updates';
var strUpdate_File_List_File_Name = "file_update_list";
var strSettingsFile_Ext = '.json';


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
    console.log('Making a backup copy of mySystem ')
    console.log(mySystem)
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
  try {  //  T2
    //console.log('(strConfigDirectory + mySystem.Selected_Config_File + strSettingsFile_Ext)=' + (strConfigDirectory + mySystem.Selected_Config_File + strSettingsFile_Ext))
    var strTmp_Config_File_Name = mySystem.Selected_Config_File;
    strTmp_Config_File_Name = strTmp_Config_File_Name.replace('.json','');  //  so we dont end up with .json.json
    data = fs.readFileSync(strConfigDirectory + strTmp_Config_File_Name + strSettingsFile_Ext) //  T2
    myConfig = JSON.parse(data);
    //console.log(myConfig);
  }
  catch (err) {
    console.log('There has been an error parsing your JSON. : myConfig')
    console.log(err);
  }
}

/////////////  1   /////////////////

function production_step_1 (request, response, url) {
	console.log("Called: ibp_production -> step 1")
	//fsSystem_Load();
	//fsConfig_Load();
	
	fcnUpdate_IP_Address();
	response.writeHead(200, {'content-type': 'text/html'});
	response.write('<html><body bgcolor="#1B1B1B">');
	response.write('<center><table class="layout" border="0" width="960" bgcolor="#000000">');
	response.write('<head>');
	response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">');
	response.write('<title>iBox Nano - Production Tool - This tool is VERY SERIOUS and has the potential to destroy your Nano</title>');
	response.write('<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />');
	  response.write('<link rel="icon" href="' + strApacheRootLink + 'favicon-32.png" sizes="32x32">');
	  response.write('<link rel="shortcut icon" type="image/x-icon" href="' + strApacheRootLink + 'favicon.ico"/>');
	response.write('</head><p>');

	response.write('<body bgcolor="#FFFFFF"><table >');

	response.write('<font color="#c6c6c6">');

	///  Tab Bar with CSS : Start  ////////////////////////////////////
  	header_css( response, "production_step_1");

  	//////////////////  EXECUTION  ////////////////////////////////////////////////////////////
  	strRPi_Serial_Number = mySystem.RPi_Serial_Number;  //  Get RPi SN
  	console.log('mySystem.RPi_Serial_Number)=' + mySystem.RPi_Serial_Number);

  	    //  Put fresh default.json into directory
      strFile = 'mysystem.json'
      strDefaultDir = '/home/pi/ibox/default_files/'
      strIBOX = '/home/pi/ibox/'

      console.log('Copying: ' + strDefaultDir + strFile + ' TO ' + strIBOX + strFile);
      //  Does not seem to be synchronous!!!!
      //copyFileSync(strDefaultDir + strFile, strIBOX  + strFile)
 	strTarget = strDefaultDir + strFile
  	if ( fs.existsSync( strTarget ) ) {
		try { 
			strCMD = 'sudo cp ' + strTarget + ' ' + strIBOX + strFile
			console.log('execSync: ' + strCMD)
			response.write('<br>execSync: ' + strCMD);
			eXcOut = execSync(strCMD);
			console.log(eXcOut);
		}catch (err) {
			console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
			response.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
		}
  	}
      console.log('Copying FINISHED: ' + strDefaultDir + strFile + ' TO ' + strIBOX + strFile);

    //  Load mySystem to grab defaults
    //  Load new values  //
    setTimeout( function(){  ////////////////////   DELAY START
        fsSystem_Load(); 
        //  Get serial_number from http get  //
        var url_parts = url.parse(request.url,true);
        data = JSON.stringify(url_parts );
        myGet = JSON.parse(data);
        //console.log("production_step_1 : myGet:",myGet );
        myQuery = myGet.query;
        //console.log("production_step_1 : myQuery:",myQuery );
        
        //  Pad SN
        strSN = zeroPad(myQuery.serial_number, 6);
        console.log('strSN=' + strSN);
        mySystem.Serial_Number = strSN
        console.log("myQuery.serial_number=",myQuery.serial_number, ' : mySystem.Serial_Number=',mySystem.Serial_Number);

        mySystem.RPi_Serial_Number = strRPi_Serial_Number;  //  Save RPi SN
        console.log('POST mySystem Clean: mySystem.RPi_Serial_Number)=' + mySystem.RPi_Serial_Number);
        //  Reset RPI SN
        //mySystem.RPi_Serial_Number = strRPi_Serial_Number 

        ///  1. Copy fresh and blank mySystem from clean dir to ibox/
        ///  2. Add SN
        ///  3. Add RPi SN (if not it will be added soon.
        ///  4. Re-save mySystem
        

        //  Now set the Nanos name to nanoX
              //  Send Hostname to Script : script_set_hostname.sh
        strHostName = 'nano' + myQuery.serial_number
        try { 
          strCMD = 'sudo /home/pi/ibox/script_set_hostname.sh ' + strHostName
          console.log('update_hostname : ' + strCMD)
          eXcOut = execSync(strCMD);
          console.log(eXcOut);
          response.write(eXcOut);
        }catch (err) {
          console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
          response.write('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
        }
        strURL = 'http://' + strIPAddress + '';
        strNetworkName = os.hostname();
        console.log('Your network name has been changed from ' + strNetworkName + ' to ' + strHostName + '. This change will not take effect until you restart your Nano.');
        response.write('<br>Your network name has been changed from ' + strNetworkName + ' to ' + strHostName + '. This change will not take effect until you restart your Nano.');

        //  Verify
        console.log('mySystem.Serial_Number=' + mySystem.Serial_Number + ' : mySystem.RPi_Serial_Number=' + mySystem.RPi_Serial_Number)
        response.write('mySystem.Serial_Number=' + mySystem.Serial_Number + ' : mySystem.RPi_Serial_Number=' + mySystem.RPi_Serial_Number)


    //  2. /////////////////////////////////////////////////////////////////////////////////////
    // Move FRESH Files
    strDefaultDir = '/home/pi/ibox/default_files/'
    strIBOX = '/home/pi/ibox/'



    //  Delete all files in /print_config_files/
    strTarget = '/home/pi/ibox/print_config_files/*'
    try { 
      strCMD = 'rm ' + strTarget
      console.log('execSync: ' + strCMD)
      response.write('<br>execSync: ' + strCMD);
      eXcOut = execSync(strCMD);
      console.log(eXcOut);
    }catch (err) {
      console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
      response.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
    }
      if ( fs.existsSync( strTarget ) ) {

      }

      //  0. Delete TrentsNano_192_168_1_107.json
      strTarget = '/home/pi/ibox/TrentsNano_192_168_1_107.json'
      if ( fs.existsSync( strTarget ) ) {
        try { 
          strCMD = 'sudo rm ' + strTarget
          console.log('execSync: ' + strCMD)
          response.write('<br>execSync: ' + strCMD);
          eXcOut = execSync(strCMD);
          console.log(eXcOut);
        }catch (err) {
          console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
          response.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
        }
      }

      //  Delete iBoxPrintManager.py
      strTarget = '/home/pi/ibox/iBoxPrintManager.py'
      if ( fs.existsSync( strTarget ) ) {
        try { 
          strCMD = 'sudo rm ' + strTarget
          console.log('execSync: ' + strCMD)
          response.write('<br>execSync: ' + strCMD);
          eXcOut = execSync(strCMD);
          console.log(eXcOut);
        }catch (err) {
          console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
          response.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
        }
      }

      //  Delete SCRAP dir
      strTarget = '/home/pi/ibox/scrap/'
      if ( fs.existsSync( strTarget ) ) {
      try { 
        strCMD = 'sudo rm -r ' + strTarget
        console.log('execSync: ' + strCMD)
        response.write('<br>execSync: ' + strCMD);
        eXcOut = execSync(strCMD);
        console.log(eXcOut);
      }catch (err) {
        console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
        response.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
      }
      }

      //  Delete LOGS
      strTarget = '/home/pi/ibox/www/logs/*'
    try { 
      strCMD = 'sudo rm ' + strTarget
      console.log('execSync: ' + strCMD)
      response.write('<br>execSync: ' + strCMD);
      eXcOut = execSync(strCMD);
      console.log(eXcOut);
    }catch (err) {
      console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
      response.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
    }
    //  Delete apple meta crap
    strCMD = 'sudo find /home/pi/ibox/ -name \.AppleDouble -exec rm -rf {} \;'
    try { 
      //strCMD = 'sudo rm ' + strTarget
      console.log('execSync: ' + strCMD)
      response.write('<br>execSync: ' + strCMD);
      eXcOut = execSync(strCMD);
      console.log(eXcOut);
    }catch (err) {
      console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
      response.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
    }
    //  Delete apple .DS crap
    strCMD = 'sudo find /home/pi/ibox/ -name \.DS_Store -exec rm -rf {} \;'
    //strCMD = 'sudo find ~/ -name '.DS_Store' -delete'
    try { 
      //strCMD = 'sudo rm ' + strTarget
      console.log('execSync: ' + strCMD)
      response.write('<br>execSync: ' + strCMD);
      eXcOut = execSync(strCMD);
      console.log(eXcOut);
    }catch (err) {
      console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
      response.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
    }
      // Recreate a blank file because forever is set to "append" and if the file is missing no logs will be created (maybe)
      console.log('Recreating Log files...: ')
    strCMD = 'sudo touch /home/pi/ibox/www/logs/iBoxWebGUI_Forever_StdOut.log'
    try { 
      console.log('execSync: ' + strCMD)
      response.write('<br>execSync: ' + strCMD);
      eXcOut = execSync(strCMD);
      console.log('Recreating iBoxWebGUI_Forever_StdOut Done ');
      response.write('<br>Recreating iBoxWebGUI_Forever_StdOut Done')
    }catch (err) {
      console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
      response.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
    }

      strCMD = 'sudo touch /home/pi/ibox/www/logs/iBoxWebGUI_Forever_Log.log'
    try { 
      console.log('execSync: ' + strCMD)
      response.write('<br>execSync: ' + strCMD);
      eXcOut = execSync(strCMD);
      console.log('Recreating iBoxWebGUI_Forever_Log Done ');
      response.write('<br>Recreating iBoxWebGUI_Forever_Log Done')
    }catch (err) {
      console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
      response.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
    }

      strCMD = 'sudo touch /home/pi/ibox/www/logs/iBoxWebGUI_Forever_Err.log'
    try { 
      console.log('execSync: ' + strCMD)
      response.write('<br>execSync: ' + strCMD);
      eXcOut = execSync(strCMD);
      console.log('Recreating iBoxWebGUI_Forever_Err Done ');
      response.write('<br>Recreating iBoxWebGUI_Forever_Err Done')
    }catch (err) {
      console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
      response.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
    }

  /*
        var exec = require('child_process').exec;
        console.log('Recreating Log files...: ')
      response.write('<br>Recreating Log files...: ')
        exec('sudo touch /home/pi/ibox/www/logs/iBoxWebGUI_Forever_StdOut.log', function (error, stdout, stderr) {
          console.log('Recreating iBoxWebGUI_Forever_StdOut Done ')
        response.write('<br>Recreating iBoxWebGUI_Forever_StdOut Done')
        });
        var exec = require('child_process').exec;
        exec('sudo touch /home/pi/ibox/www/logs/iBoxWebGUI_Forever_Err.log', function (error, stdout, stderr) {
          console.log('Recreating iBoxWebGUI_Forever_Err Done ')
        response.write('<br>Recreating iBoxWebGUI_Forever_Err Done')
        });
        var exec = require('child_process').exec;
        exec('sudo touch /home/pi/ibox/www/logs/iBoxWebGUI_Forever_Log.log', function (error, stdout, stderr) {
          console.log('Recreating iBoxWebGUI_Forever_Log Done ')
        response.write('<br>Recreating iBoxWebGUI_Forever_Log Done')
        });
  */

        //  Reset permissions on Logs  //
        try { 
          strCMD = 'sudo chmod -R 777 /home/pi/ibox/www/logs/'
          console.log('requrl : ' + strCMD)
          eXcOut = execSync(strCMD);
          console.log(eXcOut);
        }catch (err) {
          console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
        }

    //  Delete Packages/expanded/
      strTarget = '/home/pi/ibox/www/packages/expanded/*'
    try { 
      strCMD = 'sudo rm -r ' + strTarget
      console.log('execSync: ' + strCMD)
      response.write('<br>execSync: ' + strCMD);
      eXcOut = execSync(strCMD);
      console.log(eXcOut);
    }catch (err) {
      console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
      response.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
    }

    //  Delete Packages/compressed/
      strTarget = '/home/pi/ibox/www/packages/compressed/*'
    try { 
      strCMD = 'sudo rm ' + strTarget
      console.log('execSync: ' + strCMD)
      response.write('<br>execSync: ' + strCMD);
      eXcOut = execSync(strCMD);
      console.log(eXcOut);
    }catch (err) {
      console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
      response.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
    }

      //  Delete Packages/compressed/_svg
      strTarget = '/home/pi/ibox/www/packages/compressed/_svg/*'
    try { 
      strCMD = 'sudo rm ' + strTarget
      console.log('execSync: ' + strCMD)
      response.write('<br>execSync: ' + strCMD);
      eXcOut = execSync(strCMD);
      console.log(eXcOut);
    }catch (err) {
      console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
      response.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
    }


    //  Delete Model Images
      strTarget = '/home/pi/ibox/www/model_images/*'
    try { 
      strCMD = 'sudo rm ' + strTarget
      console.log('execSync: ' + strCMD)
      response.write('<br>execSync: ' + strCMD);
      eXcOut = execSync(strCMD);
      console.log(eXcOut);
    }catch (err) {
      console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
      response.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
    }
    strTarget = '/home/pi/ibox/www/model_images/mgnt/*'
    try { 
      strCMD = 'sudo rm ' + strTarget
      console.log('execSync: ' + strCMD)
      response.write('<br>execSync: ' + strCMD);
      eXcOut = execSync(strCMD);
      console.log(eXcOut);
    }catch (err) {
      console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
      response.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
    }

      //  Put fresh default.json into directory
    strFile = 'default.json'
    copyFileSync(strDefaultDir + strFile, strIBOX + 'print_config_files/' + strFile)
    response.write('<br>Copying: ' + strDefaultDir + strFile + ' TO ' + strIBOX + 'print_config_files/' + strFile);

      //  backup mycalibration.json into directory
    strFile = 'mycalibration.json'
    copyFileSync(strIBOX + strFile, strIBOX + strFile + '_backup')
    response.write('<br>Copying: ' + strIBOX + strFile + ' TO ' + strIBOX + strFile + '_backup');

      //  Put fresh mycalibration.json into directory
    //strFile = 'mycalibration.json'
    //copyFileSync(strDefaultDir + strFile, strIBOX + strFile)
    //response.write('<br>Copying: ' + strDefaultDir + strFile + ' TO ' + strIBOX + strFile);

    //strFile = 'mysystem.json'
    //copyFileSync(strDefaultDir + strFile, strIBOX + strFile)

    //  Do this in iBoxWebGUI.js because that is where we set the serial number of the Nano, and this will erase said data
    /*
      //  Put fresh default.json into directory
    strFile = 'mysystem.json'
    copyFileSync(strDefaultDir + strFile, strIBOX  + strFile)
    response.write('<br>Copying: ' + strDefaultDir + strFile + ' TO ' + strIBOX + strFile);
    */
      //  1.  Create pyc from py /////////////////////////////////////////////////////////////////////////////////////
      response.write('<br>Create pyc from py');
      //  a. Delete current pyc
      /*
      strTarget = '/home/pi/ibox/iBoxPrintManager.pyc'
      if ( fs.existsSync( strTarget ) ) {
        //  pyc exists, so lets delete it  //
      try { 
        strCMD = 'sudo rm ' + strTarget
        console.log('execSync: ' + strCMD)
        response.write('<br>execSync: ' + strCMD);
        eXcOut = execSync(strCMD);
        console.log(eXcOut);
      }catch (err) {
        console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
        response.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
      }
      }
      */

      //iBoxPrintManager.cpython-32.pyc
          //  Delete .pyc cache
      strTarget = '/home/pi/ibox/__pycache__/iBoxPrintManager.cpython-32.pyc'
      if ( fs.existsSync( strTarget ) ) {
        //  pyc exists, so lets delete it  //
      try { 
        strCMD = 'sudo rm ' + strTarget
        console.log('execSync: ' + strCMD)
        response.write('<br>execSync: ' + strCMD);
        eXcOut = execSync(strCMD);
        console.log(eXcOut);
      }catch (err) {
        console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
        response.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
      }
      }

      /*
      //  Only do this if there is a .py, if not it is just a waste of time  //
      strTarget = '/home/pi/ibox/iBoxPrintManager.py' 
    if ( fs.existsSync( strTarget ) ) {
      try { 
        strCMD = 'sudo /home/pi/ibox/convert_and_move_py_to_pyc_to_root.sh'
        console.log('execSync: ' + strCMD)
        response.write('<br>execSync: ' + strCMD);
        eXcOut = execSync(strCMD);
        console.log(eXcOut);
      }catch (err) {
        console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
        response.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
      }
      //  b. now lets verify that PYC was in fact created
      if ( fs.existsSync( strTarget ) ) {
        console.log('We found file: ' + strTarget)
        response.write('<br>We found file: ' + strTarget)
      }

        //  Delete .py
        strTarget = '/home/pi/ibox/iBoxPrintManager.py'
        if ( fs.existsSync( strTarget ) ) {
          //  pyc exists, so lets delete it  //
        try { 
          strCMD = 'sudo rm ' + strTarget
          console.log('execSync: ' + strCMD)
          response.write('<br>execSync: ' + strCMD);
          eXcOut = execSync(strCMD);
          console.log(eXcOut);
        }catch (err) {
          console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
          response.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
        }
        }
     }
     */

     //  Delete Init.d if it exists  //
    strTarget = '/etc/init.d/startnano'
    if ( fs.existsSync( strTarget ) ) {
      try { 
        strCMD = 'sudo rm ' + strTarget 
        console.log('execSync: ' + strCMD)
        response.write('<br>execSync: ' + strCMD);
        eXcOut = execSync(strCMD);
        console.log(eXcOut);
      }catch (err) {
        console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
        response.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
      }
      try { 
        strCMD = 'sudo update-rc.d startnano disable' 
        console.log('execSync: ' + strCMD)
        response.write('<br>execSync: ' + strCMD);
        eXcOut = execSync(strCMD);
        console.log(eXcOut);
      }catch (err) {
        console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
        response.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
      }
    }




    response.write('<br><br><br> Finished');

    response.write('<br><br><br> Now you are ready to [Update the Software] then conduct a test print on the Nano');

        strURL = 'http://' + strIPAddress + '/button_updates';
    response.write('<form name="input" action="' + strURL + '" method="get">');
    response.write('<input type="submit" value="Update Software">');
    response.write('</form>');

    /*

      strURL = 'http://' + strIPAddress + '/production';
    response.write('<form name="input" action="' + strURL + '" method="get">');
    response.write('<input type="submit" value="Back">');
    response.write('</form>');
    */


    response.write('</table></center></body></html>');
    response.write('</FONT>');

    response.write('</body>');
    response.write('</html>');
    response.end();
    setTimeout( function(){  ////////////////////   DELAY START
      fsSystem_Save();
    }, 1000 );  ////////////////////////////////  DELAY : END
  }, 2000 );  ////////////////////////////////  DELAY : END
      

}

/////////////  2   /////////////////

function production_step_2 (request, response) {

	
  	fsConfig_Load();
	fsSystem_Load();

	console.log("Called: ibp_production -> step 2")
	fcnUpdate_IP_Address();
	response.writeHead(200, {'content-type': 'text/html'});
	response.write('<html><body bgcolor="#1B1B1B">');
	response.write('<center><table class="layout" border="0" width="960" bgcolor="#000000">');
	response.write('<head>');
	response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">');
	response.write('<title>iBox Nano - Production Tool - This tool is VERY SERIOUS and has the potential to destroy your Nano</title>');
	response.write('<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />');
	  response.write('<link rel="icon" href="' + strApacheRootLink + 'favicon-32.png" sizes="32x32">');
	  response.write('<link rel="shortcut icon" type="image/x-icon" href="' + strApacheRootLink + 'favicon.ico"/>');
	response.write('</head><p>');

	response.write('<body bgcolor="#FFFFFF"><table >');

	response.write('<font color="#c6c6c6">');

	///  Tab Bar with CSS : Start  ////////////////////////////////////
  	header_css( response, "production_step_2");

  	//////////////////  EXECUTION  ////////////////////////////////////////////////////////////
 response.write('<br><br>'); 	

	//  2. /////////////////////////////////////////////////////////////////////////////////////
	// Move FRESH Files
	strDefaultDir = '/home/pi/ibox/default_files/'
	strIBOX = '/home/pi/ibox/'

  response.write('<br><br> >>> Verify this is Nano Number [ ' + mySystem.Serial_Number + '] <<< <br><br>');

	//  System  //
	strFile = 'hosts'
	copyFileSync(strDefaultDir + strFile + '.txt', '/etc/' + strFile)
	response.write('<br>Copying: ' + strDefaultDir + strFile + '.txt' + ' TO ' + '/etc/' + strFile);

	strFile = 'hostname'
	copyFileSync(strDefaultDir + strFile + '.txt', '/etc/' + strFile)
	response.write('<br>Copying: ' + strDefaultDir + strFile + '.txt' + ' TO ' + '/etc/' + strFile);

	strFile = 'wpa_supplicant'
	copyFileSync(strDefaultDir + strFile + '.txt', '/etc/wpa_supplicant/' + strFile + '.conf')
	response.write('<br>Copying: ' + strDefaultDir + strFile + '.txt' + ' TO ' + '/etc/wpa_supplicant/' + strFile + '.conf');

  //  Make a backup copy of the default profile used for the test print
  strFile = 'default.json'
  copyFileSync(strIBOX + 'print_config_files/' + strFile, strIBOX + 'print_config_files/default_backup.json')
  response.write('<br>Copying: ' + strIBOX + 'print_config_files/' + strFile + ' TO ' + strIBOX + 'print_config_files/' + 'print_config_files/default_backup.json');

	//  FINE -> No changes needed
	//strFile = 'interfaces'
	//copyFileSync(strDefaultDir + strFile + '.txt', '/etc/network/' + strFile)



  	/////  Now we need to dynamically create backup files  //////
    create_restore_point(request, response);
  	//////  These will be used by nano_recovery in the home/pi die, not iBox.
  	//////  Upon boot holding down specific button combinations initiates specific recovery modes.
  	//////  Full Restore: DOWN + UP buttons at led blink (5sec window)
  	//////  JSON restore including calibration data: DOWN + PRINT


response.write('<br><br>');
  	response.write('<br>Backing up the default.json and mycalibration.json files to Google Cloud Store');
  	//   Copy calibration file to Google Cloud Store named Nano_SN_RPi_SN_Cal.json
  	//   Possibly add meta data for serial numbers
  	//   You must do this before deleting the KEY to the read-only Bucket (aka iBox_Master Key)
  	str_file_name_source = '/home/pi/ibox/mycalibration.json'
  	str_file_name_destination = mySystem.Serial_Number + "_" + mySystem.RPi_Serial_Number + "_calibration.json"
  	fcn_upload_to_google_cloud_storage(request, response, str_file_name_source, str_file_name_destination);

  	response.write('<br><br>');

   	str_file_name_source = '/home/pi/ibox/print_config_files/default.json'
  	str_file_name_destination = mySystem.Serial_Number + "_" + mySystem.RPi_Serial_Number + "_default.json"
  	fcn_upload_to_google_cloud_storage(request, response, str_file_name_source, str_file_name_destination);

   	response.write('<br><br>');

   	str_file_name_source = '/iboxJSONRestore.tar'
  	str_file_name_destination = mySystem.Serial_Number + "_" + mySystem.RPi_Serial_Number + "_iboxJSONRestore.tar"
  	fcn_upload_to_google_cloud_storage(request, response, str_file_name_source, str_file_name_destination);

    response.write('<br><br>');

    str_file_name_source = '/iboxFullRestore.tar'
    str_file_name_destination = mySystem.Serial_Number + "_" + mySystem.RPi_Serial_Number + "_iboxFullRestore.tar"
    fcn_upload_to_google_cloud_storage(request, response, str_file_name_source, str_file_name_destination);

response.write('<br><br>');

response.write('<br><br><br> Finished');
response.write('<br><br><br> Now you are ready to ship the Nano');

/*
sudo cp /etc/hosts /home/pi/ibox/default_files/hosts
sudo cp /etc/hostname /home/pi/ibox/default_files/hostname
sudo cp /etc/wpa_supplicant/wpa_supplicant.conf  /home/pi/ibox/default_files/wpa_supplicant.conf
sudo cp /etc/network/interfaces /home/pi/ibox/default_files/interfaces

*/






  	strURL = 'http://' + strIPAddress + '';
	response.write('<form name="input" action="' + strURL + '" method="get">');
	response.write('<input type="submit" value="Home">');
	response.write('</form>');


	response.write('</table></center></body></html>');
	response.write('</FONT>');

	response.write('</body>');
	response.write('</html>');
	response.end();

}

function main(request, response) {
	console.log("Called: ibp_production->main Function")
	fcnUpdate_IP_Address();
	response.writeHead(200, {'content-type': 'text/html'});
	strFree_RAM = String(os.freemem()/1000000).substring(0,6);

	fsSystem_Load();
	fsConfig_Load();

	
	var strRaw = String(os.loadavg())
	var aryCPU = strRaw.split(',');
	//strCPU = aryCPU[1].substring(0,3);
	strCPU = String(aryCPU[2]*100).substring(0,3) + "%"; //  1 , 5 , 15min lookback/avg of CPU i.e. [2] = 5min avg lookback of CPU

	  //  Use Text Wranglers TEXT->Prefix/SuffixLines to add res.write(' and ');
  //  Use TextWragler SEARCH->FIND to replace "images/" with "' + strFullPath + '"  
  //  The LCD section will need to use BACKGROUND images so we can put text on top. This is somewhat a manual process.
  //  Images will be served from Apache at /var/www/images/
  //  There is a script in /ibox/ that copies the images from /ibox/images to /var/www/images to assist with refreshes of images


	response.write('<html><body bgcolor="#1B1B1B">');
	response.write('<center><table class="layout" border="0" width="960" bgcolor="#000000">');
	response.write('<head>');
	response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">');
	response.write('<title>iBox Nano - Production Tool - This tool is VERY SERIOUS and has the potential to destroy your Nano</title>');
	response.write('<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />');
	  response.write('<link rel="icon" href="' + strApacheRootLink + 'favicon-32.png" sizes="32x32">');
	  response.write('<link rel="shortcut icon" type="image/x-icon" href="' + strApacheRootLink + 'favicon.ico"/>');
	response.write('</head><p>');

	response.write('<body bgcolor="#FFFFFF">');

	///  Tab Bar with CSS : Start  ////////////////////////////////////
  	header_css( response, "production");
  	/////////// Tab Br with CSS : End  ///////////////////////////////////

	// TABS  ///////////////////////////////////////////////

	response.write('<!-- Save for Web Slices (NanoHID_Tabs_960x88.psd) -->');
	response.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0">');
	response.write('	<tr>');
	response.write('		<td>');
	response.write('			<img id="NanoHID_Tabs_960x88_01" src="' + strFullPath + 'NanoHID_Tabs_960x88_01.png" width="31" height="88" alt="" /></td>');
	response.write('		<td>');
	response.write('			<a href="' + strApacheRootLink + '/help/User_Instruction_Draft_2_5_15.htm" target="_blank">');
	response.write('				<img id="Button_User_Guide" src="' + strFullPath + 'Button_User_Guide.png" width="150" height="88" border="0" alt="User Guide" /></a></td>');
	response.write('		<td>');
	response.write('			<a href="https://www.youtube.com/channel/UCfHkl7-As8ycrRVbJ3I7Zvg" target="_blank">');
	response.write('				<img id="Button_YouTube" src="' + strFullPath + 'Button_YouTube.png" width="149" height="88" border="0" alt="YouTube" /></a></td>');
	response.write('		<td>');
	response.write('			<a href="help/button_quickstart_guide" target="_blank">');
	response.write('				<img id="Button_QuickStart_Guide" src="' + strFullPath + 'Button_QuickStart_Guide.png" width="150" height="88" border="0" alt="Quick Start Guide" /></a></td>');
	response.write('		<td>');
	response.write('			<a href="http://support.iboxprinters.com" target="_blank">');
	response.write('				<img id="Button_Forums" src="' + strFullPath + 'Button_Forums.png" width="151" height="88" border="0" alt="Forums" /></a></td>');
	response.write('		<td>');
	response.write('			<a href="http://wiki.iboxprinters.com" target="_blank">');
	response.write('				<img id="Button_Wiki" src="' + strFullPath + 'Button_Wiki.png" width="149" height="88" border="0" alt="iBox Wiki" /></a></td>');
	response.write('		<td>');
	response.write('			<a href="http://wiki.iboxprinters.com" target="_blank">');
	response.write('				<img id="Button_FAQ" src="' + strFullPath + 'Button_FAQ.png" width="150" height="88" border="0" alt="FAQ" /></a></td>');
	response.write('		<td>');
	response.write('			<img id="NanoHID_Tabs_960x88_08" src="' + strFullPath + 'NanoHID_Tabs_960x88_08.png" width="30" height="88" alt="" /></td>');
	response.write('	</tr>');
	response.write('</table>');
	response.write('<!-- End Save for Web Slices -->');
	
	/// BODY - Home/Main //////////////////////////////////////////////


	response.write('<!-- Save for Web Slices (NanoHID_Body_Home_960x608.psd) -->');
	response.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0">');
	response.write('	<tr>');
	response.write('		<td colspan="6">');
	response.write('			<img id="NanoHID_Body_Home_960x608_01" src="' + strFullPath + 'NanoHID_Body_Home_960x608_0.png" width="960" height="69" alt="" /></td>');
	response.write('	</tr>');
	response.write('	<tr>');
	response.write('		<td rowspan="4">');
	response.write('			<img id="NanoHID_Body_Home_960x608_02" src="' + strFullPath + 'NanoHID_Body_Home_960x60-02.png" width="51" height="539" alt="" /></td>');
	response.write('		<td width="420" height="218" colspan="4" bgcolor="#1B1B1B"><font color="#c6c6c6">');



	response.write('This will destroy your Nanos data, settings, and configurations!');
	response.write('<br>>Step 1: BEFORE manufacture and test ');
	response.write('<br>A. Clean up default.json, mysystem.json and packages')
	response.write('<br>B. Create pyc then delete py')

    if(strZeroConfigName != 'trentsnano') {
    	//response.write('<br>C. Update Software from server')
    	strURL = 'http://' + strIPAddress + '/production_step_1';
    	response.write('<form name="input" action="' + strURL + '" method="get">');
    	//  Set unit serial number here  //
    	strSN = "";//mySystem.Serial_Number
    	response.write('Serial#<input type="text" name="serial_number" value="' + strSN + '" size="7">');
    	response.write('<input type="submit" value="Execute Step 1">');
    	response.write('</form>');
    }

	response.write('>Step 2: AFTER manufacture_&_test + test print');
	
	response.write('<br>A. Create new network, hosts, hostname');
	response.write('<br>2. Delete Mgnt Keys for GCS, non-default profiles, Packages /expanded/ + /compressed/');

  if(strZeroConfigName != 'trentsnano') {
    strURL = 'http://' + strIPAddress + '/production_step_2';
    response.write('<form name="input" action="' + strURL + '" method="get">');
    response.write('<input type="submit" value="Execute Step 2">');
    response.write('</form>');    
  }



	response.write('		</font></td>');
	response.write('		<td rowspan="4">');
	response.write('			<img id="NanoHID_Body_Home_960x608_04" src="' + strFullPath + 'NanoHID_Body_Home_960x60-03.png" width="489" height="539" alt="" /></td>');
	response.write('	</tr>');
	response.write('	<tr>');
	response.write('		<td colspan="4">');
	response.write('			<img id="NanoHID_Body_Home_960x608_05" src="' + strFullPath + 'NanoHID_Body_Home_960x60-04.png" width="420" height="53" alt="" /></td>');
	response.write('	</tr>');
	response.write('	<tr>');
	response.write('		<td rowspan="2">');
	response.write('			<img id="NanoHID_Body_Home_960x608_06" src="' + strFullPath + 'NanoHID_Body_Home_960x60-05.png" width="3" height="268" alt="" /></td>');
	//response.write('		<td width="192" height="115" bgcolor="#1B1B1B">iBox Printers Inc. Copyright 2015</td>');
	//////////////////////////////////

		response.write('		<td width="192" height="115" bgcolor="#1B1B1B">');
	/// Hardware Stats : Start //////////////////////////////////////////////
	strText_Color_Green = '#61dc3c' //' + strFullPath + '

	response.write('<!-- Save for Web Slices (NanoHUD_192x115_Window.psd) -->');
	response.write('<table id="Table_01" width="192" border="0" cellpadding="0" cellspacing="0">');
	response.write('	<tr>');
	response.write('		<td colspan="3">');
	response.write('			<img id="NanoHUD_192x115_Window_01" src="' + strFullPath + 'NanoHUD_192x115_Window_01.png" width="192" height="10" alt="" /></td>');
	response.write('	</tr>');
	response.write('	<tr>');
	response.write('		<td rowspan="5">');
	response.write('			<img id="NanoHUD_192x115_Window_02" src="' + strFullPath + 'NanoHUD_192x115_Window_02.png" width="37" height="105" alt="" /></td>');
	response.write('		<td width="91" height="28" bgcolor="#1B1B1B"><font align="center" color="' + strText_Color_Green + '">' + strFree_RAM + '</font></td>');
	response.write('		<td rowspan="5">');
	response.write('			<img id="NanoHUD_192x115_Window_04" src="' + strFullPath + 'NanoHUD_192x115_Window_04.png" width="64" height="105" alt="" /></td>');
	response.write('	</tr>');
	response.write('	<tr>');
	response.write('		<td>');
	response.write('			<img id="NanoHUD_192x115_Window_05" src="' + strFullPath + 'NanoHUD_192x115_Window_05.png" width="91" height="11" alt="" /></td>');
	response.write('	</tr>');
	response.write('	<tr>');
	response.write('		<td width="91" height="29" bgcolor="#1B1B1B"><font align="center" color="' + strText_Color_Green + '">' + strFree_HD + '</font></td>');
	response.write('	</tr>');
	response.write('	<tr>');
	response.write('		<td>');
	response.write('			<img id="NanoHUD_192x115_Window_07" src="' + strFullPath + 'NanoHUD_192x115_Window_07.png" width="91" height="11" alt="" /></td>');
	response.write('	</tr>');
	response.write('	<tr>');
	response.write('		<td width="91" height="26" bgcolor="#1B1B1B"><font align="center" color="' + strText_Color_Green + '">' + strCPU + '</font></td>');
	response.write('	</tr>');
	response.write('</table>');
	response.write('<!-- End Save for Web Slices -->');

	
	/// Hardware Stats : END //////////////////////////////////////////////
	response.write('</td>');

	////////////////////////////////////////////////////////////////////
	response.write('		<td rowspan="2">');
	response.write('			<img id="NanoHID_Body_Home_960x608_08" src="' + strFullPath + 'NanoHID_Body_Home_960x60-06.png" width="38" height="268" alt="" /></td>');
	response.write('		<td width="187" height="115" bgcolor="#1B1B1B">');

	////  Bottom Right Box ///

strURL = 'http://' + strIPAddress + '/generate_pyc';
response.write('<form name="input" action="' + strURL + '" method="get">');
response.write('<input type="submit" value="Generate PYC from PY">');
response.write('</form>');

if(strZeroConfigName != 'trentsnano') {

  strURL = 'http://' + strIPAddress + '/clean_wpa';
  response.write('<form name="input" action="' + strURL + '" method="get">');
  response.write('<input type="submit" value="Clean wpa_supplicant File">');
  response.write('</form>');

  strURL = 'http://' + strIPAddress + '/delete_calibration';
  response.write('<form name="input" action="' + strURL + '" method="get">');
  response.write('<input type="submit" value="Delete Calibration.JSON">');
  response.write('</form>');

}

	/////  End : Bottom Right Box  //////



	response.write('	</td>');
	response.write('	</tr>');
	response.write('	<tr>');
	response.write('		<td>');
	response.write('			<img id="NanoHID_Body_Home_960x608_10" src="' + strFullPath + 'NanoHID_Body_Home_960x608_1.png" width="192" height="153" alt="" /></td>');
	response.write('		<td>');
	response.write('			<img id="NanoHID_Body_Home_960x608_11" src="' + strFullPath + 'NanoHID_Body_Home_960x60-08.png" width="187" height="153" alt="" /></td>');
	response.write('	</tr>');
	response.write('</table>');
	response.write('<!-- End Save for Web Slices -->');




	/*
	//////////////////////////////////////////////////////////////////////////////////////////////////////
	////  Back Button to Home ////
	///////////////////////////////////////////////////
	response.write('<br>');
	response.write('<form name="input" action="http://' + strIPAddress + '" method="get">');
	response.write('<input type="submit" value="Back">');
	response.write('</form>');
	*/

	//response.write('<br>Request Object:' + request.url)

	response.write('</table></center></body></html>');
	response.write('</FONT>');

	response.write('</body>');
	response.write('</html>');
	response.end();
}
exports.main = main;
exports.production_step_1 = production_step_1;
exports.production_step_2 = production_step_2;


//============ Modules from iBoxWebGUI.js, should probably be in some helper.js exports  //
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
	strFullPath = "http://" + strIPAddress + ':8000/images/' ;
	
	strZeroConfigName = os.hostname();
	//console.log('IP Address is:',strIPAddress)
	
}

function header_css (response, varRefreshLocation) {
  //var refreshLocation = "button_browse";
  refreshLocation = varRefreshLocation
  var header = require('./header');
  header.printHeader(response, strIPAddress, refreshLocation); //strIPAddress
}

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
      //  Reset permissions  //
      fs.chmodSync(targetFile, '777');
    }else{
      console.log('copyFileSync : ERROR : strSource_File [' + strSource_File + '] DOES NOT EXIST --> No Copy Performed')
    }


    			/*
			try { 
	    		var eXcOut = execSync('sudo chmod 777 ' + pathToModelZip);
				console.log(eXcOut);
			}catch (err) {
				console.log('ERROR [' + err + '] : executing execSync[sudo chmod 777 ' + pathToModelZip + ']')
			}
			*/

}

function fcn_upload_to_google_cloud_storage(req, res, file_name_source, file_name_destination) {
		///////////////////////////////////////////////////////////////////////////////
	////  Upload and Download OBJECTS for Google Cloud Storage  ////////////////////
	console.log('fcn_upload_to_google_cloud_storage : [' + file_name_source + '] : as : [' + file_name_destination + ']');  //  was .ibf 4/15/15
	load_google_cloud_storage_object();
	storage = gcloud.storage();
	//
	// UPLOAD - Buckets  ///
	//var bucket_packages = storage.bucket('bucket_nano_ibf_packages');
	//var bucket_metadata = storage.bucket('bucket_nano_ibf_metadata');
	//var bucket_images = storage.bucket('bucket_nano_ibf_images');
	var bucket_calibration = storage.bucket('bucket_nano_calibration_files');

	//////////////////////////////////////////////////////////////////////////////
	// Upload a local file to a new file to be created in your bucket.
	
	//  Calibration Files  //
	//strTarget = file_name

	if ( fs.existsSync( file_name_source ) ) {
		try { 
			//fs.createReadStream(file_name_source).pipe(bucket_calibration.file(file_name_destination).createWriteStream());
			//fs.createReadStream(file_name_source).pipe(bucket_calibration.file(file_name_destination).createWriteStream().on('complete', function() {
			console.log('Uploading [' + file_name_source + ']')
			res.write('<br>Uploading ' + file_name_source + ' as [' + file_name_destination + '] from Nano to Cloud')
			fs.createReadStream(file_name_source).pipe(bucket_calibration.file(file_name_destination).createWriteStream({
/*		    metadata: {
		      contentType: 'application/json',
		      metadata: {
		        Serial_Number: '' + mySystem.Serial_Number 
		        RPi_Serial_Number: '' + mySystem.RPi_Serial_Number 
		      }
		    }*/
			}).on('complete', function(){
				console.log('Finished Uploading [' + file_name_source + ']')
				//res.write('<br>Finished Uploading ' + file_name_source + ' as [' + file_name_destination + '] from Nano to Cloud')
				console.log('Now delete Mgnt Key')
				//res.write('<br>Now delete Mgnt Key')
				//  Delete GCS Key(s) for management:
				//strTarget = '/home/pi/ibox/keys/IBF_API_Download_Read_Write_Mgnt_07024746373d.json'
        //  7/22/2015 TRC
        strTarget = '/home/pi/ibox/keys/IBF_API_Download_Read_Write_Mgnt_2_3b1497f1d957.json'
			  	if ( fs.existsSync( strTarget ) ) {
			  		//  pyc exists, so lets delete it  //
					try { 
						strCMD = 'sudo rm ' + strTarget
						console.log('execSync: ' + strCMD)
						//res.write('<br>execSync: ' + strCMD);
						eXcOut = execSync(strCMD);
						console.log(eXcOut);
					}catch (err) {
						console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
						//res.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
					}
			  	}
          //  Also try deleting the old Mgnt Key, why not
          strTarget = '/home/pi/ibox/keys/IBF_API_Download_Read_Write_Mgnt_07024746373d.json'
          if ( fs.existsSync( strTarget ) ) {
            //  pyc exists, so lets delete it  //
          try { 
            strCMD = 'sudo rm ' + strTarget
            console.log('execSync: ' + strCMD)
            //res.write('<br>execSync: ' + strCMD);
            eXcOut = execSync(strCMD);
            console.log(eXcOut);
          }catch (err) {
            console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
            //res.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');
          }
          }
			}));




		}catch (err) {
		  //myModel.layer_count = -1;
		  console.log('=== ERR 404 ===>  The File does not exist in [' + file_name_source + ']')
		  console.log(err);
		  res.write('ERR [' + err + '] Trying to upload [' + file_name_source + '] to GCS')
		}
	}else{
		console.log('ERROR : File Not Found [' + file_name_source + ']')
		res.write('<br>ERROR : File Not Found: ' + file_name_source )
	}


	res.write('<br><br>Upload Completed.');


}

function load_google_cloud_storage_object() {
	console.log('load_google_cloud_storage_object');
	///////////////////////////////////////
	////  GoogleAPIs from : https://github.com/google/google-api-nodejs-client
	//var google = require('googleapis');
	//var gcloud = require('gcloud');
	//var projectId = process.env.api-project-529688790472 ; // E.g. 'grape-spaceship-123'
	//var projectId = process.env.529688790472 
	//// gcloud : https://cloud.google.com/solutions/nodejs/  /////////////////
	//  was var gcloud = require('gcloud')({


	gcloud = require('gcloud')({    
  	//  UPLOAD  Buckets  //
  	//keyFilename: '/home/pi/ibox/keys/IBF_API_Upload_Read_Write_200b15d98d32.json', //   READ/WRITE
    //projectId: 'api-project-529688790472'  //  Upload Bucket(s)

  	//  DOWNLOAD Buckets - Debug ONLY - Remove before flight //
  	//keyFilename: '/home/pi/ibox/keys/IBF_API_Download_Read_Write_Mgnt_07024746373d.json', //   READ/WRITE
    //  7/22/2015 Changed Key from 373d (fabc) to d957 (addd23)
    keyFilename: '/home/pi/ibox/keys/IBF_API_Download_Read_Write_Mgnt_2_3b1497f1d957.json', //   READ/WRITE
  	projectId: 'ibf-read-only-89818'  //  DOWNLOAD Bucket(s)

	});
}
function zeroPad(num, places) {
  //  Pad zeros; i.e. zeroPad(5, 4) will return 0005
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}

function create_restore_point(req, res) {
  console.log('create_restore_point')
  res.write('<br>Creating a Restore-Point [This takes some time]')
    res.write('<br><br>');
    res.write('<br>Starting...<br>');

    //setTimeout( function(){
      ///   ...But now we need to create the tar files that will be used for the restore process...
      //strCMD = "tar -zcvf iboxFullRestore.tar /home/pi/ibox --exclude='/home/pi/ibox/www/packages'"
      //strCMD = 'tar -zcvf iboxFullRestore2.tar -C / home/pi/ibox/';
      strCMD = "tar -zcvf iboxFullRestore.tar /home/pi/ibox --exclude=IBF_API_Download_Read_Write_Mgnt* --exclude=.AppleD*" //  Trent 7/22/2015
        try { 
        //strCMD = 'sudo rm ' + strTarget
        console.log('execSync: ' + strCMD)
        res.write('<br>execSync: ' + strCMD);
        eXcOut = execSync(strCMD);
        console.log(eXcOut);
      }catch (err) {
        strErr = err.message
        if( strErr.indexOf('Removing leading') == -1 ) {
          res.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');       
        }
        console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')

      }

      res.write('<br><br>');

      //strCMD = 'tar -zcvf iboxJSONRstore.tar ibox/mysystem.json ibox/mycalibration.json ibox/print_config_files/'
      strCMD = 'tar -zcvf iboxJSONRestore.tar /home/pi/ibox/mysystem.json /home/pi/ibox/mycalibration.json /home/pi/ibox/print_config_files'  //  Nano Kevin 5/27/2015
      try { 
        //strCMD = 'sudo rm ' + strTarget
        console.log('execSync: ' + strCMD)
        res.write('<br>execSync: ' + strCMD);
        eXcOut = execSync(strCMD);
        console.log(eXcOut);
      }catch (err) {
        strErr = err.message
        if( strErr.indexOf('Removing leading') == -1 ) {
          res.write('<br>ERROR [' + err + '] : executing execSync[' + strCMD + ']');       
        }
        console.log('ERROR [' + err + '] : executing execSync[' + strCMD + ']')
      }
      res.write('<br><br>Restore-Point Created and Saved')
    //}, 2000 );

}

exports.load_google_cloud_storage_object = load_google_cloud_storage_object
exports.create_restore_point = create_restore_point