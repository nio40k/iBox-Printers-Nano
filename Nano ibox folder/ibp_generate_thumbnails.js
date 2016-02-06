//  ibp_generate_thumbnails  // 
//  Created: 3/29/2015
//  Copyright iBox Printers Inc 2015
//  Trent Carter

//  Includes
//var AdmZip = require('adm-zip'); // https://www.npmjs.com/package/adm-zip
//var im = require('imagemagick');
var ibp_create_model = require("./ibp_create_model")
var start = process.hrtime(); //  To get elapsed time in Node.js from: http://stackoverflow.com/questions/10617070/how-to-measure-execution-time-of-javascript-code-with-callbacks

var execSync = require('exec-sync'); //  4/7/2015 so I can nest a Imagemagick shell loop
//var user = execSync('echo $USER');
//console.log(user);
var path = require("path"); //  for async file copy functions : copyFolderRecursiveSync
var fs = require('fs');
var os = require('os');
//var diskspace = require('diskspace');
var strFontStyle = ('font-family: "Arial Black", "Arial Bold", Gadget, sans-serif;');
var strIPAddress = '127.0.0.1';
var strFullPath = "http://" + strIPAddress + ':8000/images/' ; //  Apache is on port 8000 just to serve files FAST, Node.js is set up to also serve the files, but its slow.
var strFontStyle = ('font-family: lucida sans typewriter, courier new, monospace;');
var strApacheRootLink = ''
var strFont_White = 'c6c6c6';
var strHomeDirectory = '/home/pi/ibox/';
var strConfigDirectory = '/home/pi/ibox/print_config_files/';
var strSystem_File_Name = 'mysystem';
var strSettingsFile_Ext = '.json';
var strDefault_Model_Name = '_model';
var strModel_Name = '';
var strFull_Model_Path = '';
var strFull_Model_Dir_Path = '';
var strURL_Save_Share_Values = '';

/////////////////
var strTmp_Model_Name = '';
var strIBF = '';
var strIBF_Raw_Data_Folder = '';
var strIBF_Expanded_Folder = '';
var strDir = '';
var strLocal_WWW_Path = ''

//  =========  DEBUG  ============
var bDebug_Elapsed_Time = true;
var bDebug_ImageMagick = true;
var bDebug_Exec = true;

var bOne_Call_At_A_Time = false;

var myModel = { 

    model_name: 'model name',
    model_description: 'model description',
    model_creation_date: '01/01/2015',
    model_file_name: 'file_name',
    printer_type: 'iBox Nano',
    printer_software_version: '0.0',
    printer_hardware_version: '0.0',
    author_name: 'author name',
    author_contact: 'author contact',
    license_type: 'license type',
    license_description: 'license description',
    license_date: '01/01/2015',
    print_area_width: 40,
    print_area_depth: 20,
    print_area_height: 90,
    layer_height: 100,
    layer_count: -1,
    exposure_time_base: 15,
    base_layer_count: 3,
    exposure_time: 15,
    exposure_power: 5.5,
    resin_brand: "MakerJuice",
    resin_type: "G+",
    resin_color: "Green",
    print_counter: 0,
    star_count_public: 5,
    star_count_private: 5

 };

 var mySystem = { // T2 : They will be dynamically appended to the end of the file. This list helps facilitate quick reference and autocomplete
    Serial_Number: '000000',
    RPi_Serial_Number: '0000000000000000',
    Print_Counter: 0,
    Print_Time: 0,
    Print_UV_Time: 0,
    Load_Counter_NodeJS: 0,
    Load_Counter_Python: 0,

    bSoundEnabled: true,
    bPrinting_Option_Direct_Print_With_Z_Homing: true,
    bUse_Endstop: true,
    bLEDs_Enabled: true,
    bFast_Z: true,
    
    //  No Default Parameters  //
    lastFileName_FullPath: " ",
    lastFileName_FileName: " ",
    Selected_Config_File: "default",
    
    //  Updates  //
    Hardware_Version_Major: 1,
    Hardware_Version_Minor: 0,
    Version_NodeJS_Major: 1,
    Version_NodeJS_Minor: 0,
    Version_Python_Major: 1,
    Version_Python_Minor: 0,
    Last_Update_Date: "12/18/2014",

    //  Calibration Data  // UV LED Output power in uW/cm^2 LED1->28
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

  var myConfig = { // T2 : They will be dynamically appended to the end of the file. This list helps facilitate quick reference and autocomplete

    config_name: "default",
    config_description: "Default Config File : Recreated from Node.js",
    
    iGlobal_Z_Layer_Thickness: 100,
    iExposure_Time: 15,
    iExposure_Time_First_Layer: 18,
    intNumber_Of_Base_Layers: 3,
    fExposure_Power_mA: 5.5,
    iPixel_Over_LED_Mode: 0,
    iLCD_Contrast: 23,
    iGlobal_Z_Height_Retract: 30,
    iGlobal_Z_Height_Peel_Stage_1: 500,
    iGlobal_Z_Height_Peel_Stage_2: 500,
    iSteps_Per_100_Microns: 52,
    iPixel_Over_LED_Mode: 0, //0=Off : 1=Under_Pixel_Only_Full_Power : 2=Under_Px_Only_QACalibrated_Pwr : 3=Under_Px_Pnly_Equalized_Pwr : 4=Adjacent_Pix_Also_QA_Cal_Pwr
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
    fGlobal_Speed_Up_Print: 0.004
    
  };

  function initialize_class() {
  	console.log('initialize_class : ibp_generate_thumbnails : START');
		fcnUpdate_IP_Address();
		fsSystem_Load();
		fsConfig_Load();
		strTmp_Model_Name = mySystem.lastFileName_FileName;
		strModel_Name = strTmp_Model_Name.replace('.svg','');  //  Just leaves Model Dir name
		strIBF = strHomeDirectory + 'www/packages/compressed/' + strModel_Name + '.ibf'
		strIBF_Raw_Data_Folder = strHomeDirectory + 'www/packages/expanded/' + strModel_Name + '/'
		strIBF_Expanded_Folder = strHomeDirectory + 'www/packages/expanded/'
		strDir = strIBF_Raw_Data_Folder
		strLocal_WWW_Path = '/home/pi/ibox/www/model_images/';
		console.log('initialize_class : ' + strModel_Name + ' :: END')
  }

  function model_generate_images() { //req, res, url
  	initialize_class();
  	console.log('model_generate_images for [' + strModel_Name + ']'); // 

	///////////////////////////////////////////////////////////////////////////////
	  /////  Things we will need to reuse  //
	  //  IBF Path+Name  //
	  //  Convert average mean sudo convert imega1.png image2.png -evaluate-sequence mean  average.png'; from: http://www.imagemagick.org/Usage/layers/
	  //  Side is rotate 90 deg then flatten. Here is rotate:: convert koala.gif  -background skyblue -virtual-pixel background -distort ScaleRotateTranslate '64,32  .1,1.0  -90' koala_srt_center.png
	  //  Note that the 0.1 flaten is relative to te axis and target total height. So 450px is 90mm or 900 layers. So every layer is 1/2 Pixel.
	  //  Front is scale y to 
	  //  Imagemagick Notes:
	  //  Coordibates: These points are called control points, and are more usually defined by giving 4 floating point values (2 pairs of coordinates) for each single control point. So often a distortion is defined in terms of multiple sets of 4 values. For example....
	  //  X1,Y1 I1,J1     X2,Y2 I2,J2     X3,Y3 I3,J3     X4,Y4 I4,J4 . . . .
	  //  Where the control point Xi,Xi in the source image (relative it its virtual canvas), is mapped to Ii,Ji on the distorted destination image.
	  //  Resize: -resize 64x64\!   Note: The "!" means to ignore aspect ratio.
	  var exec = require('child_process').exec;
	  var iFile_Counter = 0;
	  var iCnt = 0;
	  var strIM_Top = 'sudo convert -stroke red -draw "line 3,61 125,61" -stroke green -draw "line 3,61 3,3" ';  //  Zero is Top Left
	  var strIM_Iso = 'sudo montage';
	  //var strIM_Front = 'sudo convert -page 128x450'; //sudo montage'
	  var strIM_Front = 'sudo montage'; //sudo montage'
	  var strIM_Side = 'sudo montage';
	  var iBase = 0;
	  var iFile_Last = 0;
	  var strFirstFileName = '';

	  		///////////////////////////////////////////////////////////////////////////////
	  /////  Check to see if images already exist, if not create them ==> Create Images for Model  
	  /////
	  /////
	  ////////////////////////////////////////////////////////////////////////////////
	  //  Folder /home/pi/ibox/www/packages/expanded/model_name/   == strIBF_Raw_Data_Folder
	  //  Model Name selectd = model_name == strModel_Name   
	  //  Model sample files .jpg
	  if (fs.existsSync(strDir + '_iso.jpg')) {
		  console.log('Found file [' + strDir + '_iso.jpg] ==> Should EXIT the model_generate_images Function ');
		  //if(res.hasOwnProperty(write)) res.write('The model images for [' + strModel_Name + '] already exist')

		  //return; //  Let it regenerate. Just in case they were generated with an ncorrect Profile layer height
		  console.log(' ==> Should EXIT the model_generate_images Function :: But regenerating instead');
		  //console.log('should UNCOMMENT the [return;] for production :: DEBUG ============>>>>>>>>>>')

		}else{
			console.log('Did NOT find file [' + strDir + '_iso.jpg] => Creating it and all of its friends. This will take ~30sec');
		}

	  //  Check to see if files exist, of so BAIL
	  //fs.existsSync( strDir + '_side.jpg' ) {
	  //	console.log('It seems this Model already has images, exit. Checked for [' + strDir + '_side.jpg]'])
	  //}

	  // ImageMagick Spped and Resource Allocation  ///////////////////////////////////////////////////////////////
	  //  Attempt to reduce memory //  From: http://www.imagemagick.org/script/command-line-options.php#limit
	    //strIM_Front = strIM_Front + ' -limit area 10MB -limit disk 500MB '
	  strIM_Front = strIM_Front + ' -limit memory 32MiB -limit map 64MiB area 10MB ' //  UNTESTED
	  //  From: http://www.imagemagick.org/Usage/api/#speed
	  // You may also like to look at MAGICK_THROTTLE to get ImageMagick to relinquish control of the CPU's more often at more appropriate points.
	  //  Real ImageMagick performance data on RPi : http://blog.sunekaae.com/2013/04/imagemagick-resize-speed-on-raspberry-pi.html


	  //  Create a BASE _Top                   ------------------------------->>>>-----  TOP
	  strIM_Top = 'sudo convert -size 128x64 xc:transparent ' + strDir + '_top.png';
		try { 
			if(bDebug_Elapsed_Time) elapsed_time('start '  + strIM_Top);
    	eXcOut = execSync(strIM_Top);
    	if(bDebug_Elapsed_Time) elapsed_time('end '  + strIM_Top);
			console.log(eXcOut);
		}catch (err) {
			console.log('ERROR [' + err + '] : executing execSync[' + strIM_Top + ']')
		}

		//  Create a BASE _Front   ======-=========-=========-===========================  FRONT
	  strIM_Front = 'sudo convert -size 200x450 xc:black ' + strDir + '_front.jpg';
	  //strIM_Front = 'sudo convert -size 128x288 xc:black ' + strDir + '_front.jpg'; //  128x288, 128 so the X does not need to be changed, 288 is the ratio between 128->200 0.64x
		try { 
			if(bDebug_Elapsed_Time) elapsed_time('start '  + strIM_Front);
    	eXcOut = execSync(strIM_Front);
    	if(bDebug_Elapsed_Time) elapsed_time('end '  + strIM_Front);
			console.log(eXcOut);
		}catch (err) {
			console.log('ERROR [' + err + '] : executing execSync[' + strIM_Front + ']')
		}

				//  Create a BASE _SIDE   ======-=========-=========-===========================  S S S  :; SIDE
	  strIM_Side = 'sudo convert -size 100x450 xc:black ' + strDir + '_side.jpg';
		try { 
			if(bDebug_Elapsed_Time) elapsed_time('start '  + strIM_Side);
    	eXcOut = execSync(strIM_Side);
    	if(bDebug_Elapsed_Time) elapsed_time('end '  + strIM_Side);
			console.log(eXcOut);
		}catch (err) {
			console.log('ERROR [' + err + '] : executing execSync[' + strIM_Side + ']')
		}


	  console.log('Listing currently selected Model [' + strIBF_Expanded_Folder + '] ==> START');


	  //strDir + '_top.jpg'
	  //strDir + '_front.jpg'
	  //strDir + '_side.jpg'

	  fix_directory_permissions(strDir);

	  try { 
	    aryFileList = fs.readdirSync(strIBF_Raw_Data_Folder); //  returns array of file list
	    //  Sort the list alphavetically
	    console.log('Unsorted aryFileList: ' + aryFileList)
	    //aryFileList.sort();
	    //console.log('Sorted Aplphabetically: ' + aryFileList)
	  }catch (err) {  //// from aryFileList = fs.readdirSync(strIBF_Raw_Data_Folder); 
	    console.log('ERROR [' + err + '] :: Cant enumerate DIR [' + strIBF_Raw_Data_Folder + '] ====>>>  EXITING!!!')
	    return;
	  }
	    //  Count files  //
	    for(var i in aryFileList) {
	      var fnm = aryFileList[i];
	      if(fnm != '.AppleDouble' && fnm != '.DS_Store') {
	        if(fnm.indexOf("0.png") > 1 || fnm.indexOf("1.png") > 1 || fnm.indexOf("2.png") > 1 || fnm.indexOf("3.png") > 1 || fnm.indexOf("4.png") > 1 || fnm.indexOf("5.png") > 1 || fnm.indexOf("6.png") > 1 || fnm.indexOf("7.png") > 1 || fnm.indexOf("8.png") > 1 || fnm.indexOf("9.png") > 1){
	          iFile_Counter = iFile_Counter + 1;
	          if(iFile_Counter == 1) {
	            strFirstFileName = fnm;
	          }
	        }
	      }
	    }
	    //  For front view the Y is 450px out of a max of 90mm. i.e. @ 100microns each image should have a Y height of 450/(90/layer_thickness_In_Microns)
	    fPixels_Front_Y = 450.0 / ( 90.0 / ((myConfig.iGlobal_Z_Layer_Thickness)/1000.0));
	    //  You cant do this, we need the float ==>> if(fPixels_Front_Y < 1.0) fPixels_Front_Y = 1;  // minimum needs to be 1x pixel
	    fTotal_Y_Increments = ( 90.0 / ((myConfig.iGlobal_Z_Layer_Thickness)/1000.0));

	    console.log('Enumeration : Success : aryFileList.length=[' + aryFileList.length + '] : iFile_Counter=' + iFile_Counter + ' : fPixels_Front_Y=' + fPixels_Front_Y + ' : fTotal_Y_Increments=' + fTotal_Y_Increments)
	    //  Reverse Array
	    aryFileList.reverse();

	    //return;
	    if(bDebug_Elapsed_Time) elapsed_time('start Top_Plus_Front_LOOP');

	    /*
	    for(var i in aryFileList) {
	      var fnm = aryFileList[i];
	      if(fnm != '.AppleDouble' && fnm != '.DS_Store') {
	        //  Only add images that end with a number and are PNGs. i.e. Image1.png or image_0001.png
	        if(fnm.indexOf("0.png") > 1 || fnm.indexOf("1.png") > 1 || fnm.indexOf("2.png") > 1 || fnm.indexOf("3.png") > 1 || fnm.indexOf("4.png") > 1 || fnm.indexOf("5.png") > 1 || fnm.indexOf("6.png") > 1 || fnm.indexOf("7.png") > 1 || fnm.indexOf("8.png") > 1 || fnm.indexOf("9.png") > 1){
	          //console.log('...adding [' + strIBF_Raw_Data_Folder + fnm + ']')
	          //response.write('...adding [' + strIBF_Raw_Data_Folder + fnm + ']<br>')
	          //  Image Magick -> TOP  //
	          iCnt = iCnt + 1;
	        }
	      }
	    }
			*/
			//if(res.hasOwnProperty(write)) res.write('Processing Images [ ')
			var iRes_Write_CNT = 0;

	    for(var i = 0; i < iFile_Counter; i++) {
	    	var fnm = strModel_Name + '_' + i + '.png';
	    	strFileToCheck = strIBF_Raw_Data_Folder + fnm
	    	if (fs.existsSync(strFileToCheck)) {
	    		if(bDebug_ImageMagick) {
	    			console.log('>> ' + i + ' << :: Processing [' + strFileToCheck + ']');
	    		}else{
	    			console.log(i);
	    		}
	    	}else{
	    		console.log('ERROR  ::  ----- :: Exiting FOR loop because this file is MISSING: ' + strFileToCheck)
	    		continue; //  skip one in loop, to exit if a reoccuring error use "break;""
	    	}


			  iPX_Y = ( fTotal_Y_Increments * fPixels_Front_Y ) - iCnt;

		      //  OLD Top ////  Build string forImgemagick
		      ///strIM_Top = strIM_Top + ' ' + strIBF_Raw_Data_Folder + fnm;

		      
		      //  NEW Top  ///////////////////////////////////// START
		      //strIM_Top = 'sudo convert ' + strIBF_Raw_Data_Folder + fnm + ' ' + strDir + '_top.jpg' + ' -evaluate-sequence mean ' + strDir + '_top.jpg' 
		      //strIM_Top = 'sudo convert ' + strIBF_Raw_Data_Folder + fnm  + ' ' + strDir + '_top.jpg' + ' -alpha on -compose dissolve -define compose:args=50 -composite ' + strDir + '_top.jpg' //  Dissolve
			//4/10/15 strIM_Top = 'sudo convert ' + strIBF_Raw_Data_Folder + fnm  + ' ' + strDir + '_top.jpg' + ' -alpha on -compose blend -define compose:args=50 -composite ' + strDir + '_top.jpg' //  Blend
			//strIM_Top = 'sudo composite ' + strIBF_Raw_Data_Folder + fnm  + ' ' + strDir + '_top.jpg' + ' ' + strDir + '_top.jpg' //  => Result: All black => Fail
			//strIM_Top = 'sudo convert ' + strIBF_Raw_Data_Folder + fnm  + ' ' + strDir + '_top.jpg' + ' -evaluate-sequence mean ' + strDir + '_top.jpg' //  ==> 215 sec for 243 layers, stil only see top of head =>Fail
			///strIM_Top = 'sudo convert ' + strIBF_Raw_Data_Folder + fnm  + ' ' + strDir + '_top.jpg' + ' -evaluate-sequence max ' + strDir + '_top.jpg' //  ==> Worked, 193sec / 243 layers
			iPercent_Done = (i/iFile_Counter) ;
			iModu = (iPercent_Done * 60) + 20;  // start at 20 end at 90
			strModu = ' -modulate ' + iModu + ' ' //  -modulate 0 = all black, 100 = normal, 200 is blown out
			strIM_Top = 'sudo convert ' + strIBF_Raw_Data_Folder + fnm  + ' -fuzz 5% -transparent black ' + strModu + ' '  + strDir + '_top.png' + ' -evaluate-sequence max ' + strDir + '_top.png' //  ==> 204sec Best yet, no xray :()

	      	if(bDebug_ImageMagick) console.log('strIM_Top=[' + strIM_Top + ']');
		    //response.write('strIM_Top=[' + strIM_Top + ']');
		    //  pipe to imagemagick
		    //var exec = require('child_process').exec;
		    //exec(strIM_Top, function (error, stdout, stderr) {
		    //  console.log('strIM_Top stdout=[' + stdout + '] : error=[' + error + '] : stderr=[' + stderr + ']');
		    //});
			//if(bDebug_Elapsed_Time) elapsed_time('start '  + strIM_Top);
			try { 
	    	eXcOut = execSync(strIM_Top);
				if(bDebug_Exec) console.log(eXcOut);
			}catch (err) {
				console.log('ERROR [' + err + '] : executing execSync[' + strIM_Top + ']')
			}
			//if(bDebug_Elapsed_Time) elapsed_time('end '+ strIM_Top);

		    //strIM_Top = 
		    //  NEW Top  ///////////////////////////////////// END

			//strIM_Iso = strIM_Iso
			//strIM_Front = strIM_Front + ' -resize 200x' + fPixels_Front_Y + '\! ' + strIBF_Raw_Data_Folder + fnm;
			//  Async FRONT
			///strIM_Front = strIM_Front + ' ' + strIBF_Raw_Data_Folder + fnm;  //  Known Good pre Sync Exec
			//  Sync Front
			//strIM_Front = 'sudo montage ' + strIBF_Raw_Data_Folder + fnm + ' -mode Concatenate  -tile 1x  -geometry 128x1\!+0+0 ' + strDir + '_front.jpg'; 
			//eXcOut = execSync(strIM_Front);
			//console.log(eXcOut);

			/////  FRONT  //////////////////////////////////////////////////////////////////////////////
			//  -resize , -adaptive-resize, -liquid-rescale or -scale (options: -filter box,triangle) //
			sPath = strIBF_Raw_Data_Folder + fnm
			iPxY = Math.round(fPixels_Front_Y)
			imgFnt = strDir + '_front.jpg'
			sRSType = '-rescale'
			sRSType = '-scale'
			sRSType = '-adaptive-resize'
			//sRSType = '-liquid-rescale' //  300-900ms/front image
			iGeoCalc = Math.round(450 - (fPixels_Front_Y * i));
			strGeo = '-geometry ' + '200x'  + iPxY + '\!' + '+0+' + iGeoCalc
			//  Tested using Terminal : sudo composite -geometry 128x1\!+0+420  .../Groot24A_6.png ..._front.jpg ..._front.jpg  ==> WORKED! 4/11/15

			//5/1/2015 Flip the front image first
			/*
			//  Flip was causing a top to bottom, aka Horizontal X axis flip. We wanted a left to right flip.
			strIM_Front_Flip = 'sudo convert  ' + strDir + '_front.jpg -flip ' + strDir + '_front.jpg';
			try { 
	    	eXcOut = execSync(strIM_Front_Flip);
				if(bDebug_Exec) console.log(eXcOut);
			}catch (err) {
				console.log('ERROR [' + err + '] : executing execSync[' + strIM_Front_Flip + ']')
			} //  end flip
			*/

			strIM_Front = 'sudo composite ' + strGeo + ' ' + ' ' + sPath + ' ' + imgFnt + ' ' + imgFnt

			//if(bDebug_Elapsed_Time) elapsed_time('start '  + strIM_Front);
			if(bDebug_ImageMagick) console.log('strIM_Front=[' + strIM_Front + ']');
			try { 
	    	eXcOut = execSync(strIM_Front);
				if(bDebug_Exec) console.log(eXcOut);
			}catch (err) {
				console.log('ERROR [' + err + '] : executing execSync[' + strIM_Front + ']')
			}
			//eXcOut = execSync(strIM_Front);
			//if(bDebug_Elapsed_Time) elapsed_time('end '  + strIM_Front);
			//if(bDebug_ImageMagick) console.log(eXcOut);


			//strIM_Iso = strIM_Iso + ' ' + strIBF_Raw_Data_Folder + fnm + ' -distort ScaleRotateTranslate \'45,42  .4,.01  40  64,' + iPX_Y + '\' '; 
			///strIM_Iso = strIM_Iso + ' ' + strIBF_Raw_Data_Folder + fnm //+ ' -alpha set -virtual-pixel transparent -affine 1,-.3,.3,0.1,0,0 -transform  +repage '
			//strIM_Front = strIM_Front + ' ' + strIBF_Raw_Data_Folder + fnm  + ' -resize 200x' + fPixels_Front_Y + '\! ' ;

			//if(iCnt == 1){
			//strIM_Front = strIM_Front + '+0+' + iPX_Y + ' ' + strIBF_Raw_Data_Folder + fnm  + ' -resize 200x' + fPixels_Front_Y + '\! ' ;
			//  strIM_Front = strIM_Front + '+0+' + iCnt + ' ' + strIBF_Raw_Data_Folder + fnm  + ' -resize 128x10\! ' ;
			//}else{
			//strIM_Front = strIM_Front + '-page +0+' + iPX_Y + ' ' + strIBF_Raw_Data_Folder + fnm  + ' -resize 200x' + fPixels_Front_Y + '\! ' ;
			//strIM_Front = strIM_Front + ' +page +0+' + iCnt + ' ' + strIBF_Raw_Data_Folder + fnm  + ' -resize 128x' + fPixels_Front_Y + '\! ' ;
			//}

			//  Side
			//strIM_Side = strIM_Side + ' -rotate 90 -resize 100x' + fPixels_Front_Y + '\! ' + strIBF_Raw_Data_Folder + fnm;
			//strIM_Side = strIM_Side + ' ' + strIBF_Raw_Data_Folder + fnm  + ' -rotate 90 -resize 100x' + fPixels_Front_Y + '\! ' ;
			/////strIM_Side = strIM_Side + ' ' + strIBF_Raw_Data_Folder + fnm  //+ ' -rotate 90'; //  Last used, memory issue=> runs out of it
			if(i<iFile_Counter){
					//if(res.hasOwnProperty(write)) res.write(i + ',')
			}else{
				//if(res.hasOwnProperty(write)) res.write(i + ' ]')
			}
			iRes_Write_CNT = iRes_Write_CNT + 1
			if(iRes_Write_CNT >25) {
				//if(res.hasOwnProperty(write)) res.write('<br>')
	    	}
	      
	    }



	    if(bDebug_Elapsed_Time) elapsed_time('end '+ strIM_Top);
	    console.log('Exit Thumbnail Arry LOOP ==>>  About to convert Top');

	    //  Check to see of the file list is base 0 or 1
	    if(strFirstFileName.indexOf("0.png") > 1) {
	      iBase = 0;
	      iFile_Last = iFile_Counter - 1;
	    }else if(strFirstFileName.indexOf("1.png") > 1) {
	      iBase = 1;
	      iFile_Last = iFile_Counter;
	    }else{
	      iBase = 0;
	      iFile_Last = iFile_Counter - 1;
	      console.log('iBase NOT 0 or 1 : Investigate : aryFileList[0]=[' + strFirstFileName + ']');
	    }

	    //  Add outfut filename to str  //
	    /////////////////////////////////////////////////////////////////////////////
	    ///  TOP  ////
	    ///////////////
	    ///////////////////////////////////////////////////////////////////////////////////
	    //strIM_Top = strIM_Top + ' -evaluate-sequence mean ' + strDir + '_top.jpg' //  fnown good 3/30/15
	    //strIM_Top = strIM_Top + ' -evaluate-sequence mean ' + strDir + '_top.jpg' 
	    //  Add Green , Red , Blue Z, Y, Z Lines
	    ///strIM_Top = 'sudo convert  ' + strDir + '_top.png -stroke red -draw "line 3,61 125,61" -stroke green -draw "line 3,61 3,3" ' + strDir + '_top.jpg'; : Known Good 4/12/15
	    strIM_Top_Flip = 'sudo convert  ' + strDir + '_top.png -flip ' + strDir + '_top.png';
	    strIM_Top = 'sudo convert  ' + strDir + '_top.png -stroke red -draw "line 1,63 127,63" -stroke green -draw "line 1,63 1,1" ' + strDir + '_top.jpg';
	    strIM_Top2 = 'sudo convert ' + strDir + '_top.jpg -resize 200x100 ' + strDir + '_top.jpg'
	    strOp = '0.3'
	    strGrid_Top = ' -stroke white -draw "stroke-opacity ' + strOp + ' path \'M 5,50 L 195,50\' " ' // 1

	    strGrid_Top = strGrid_Top + ' -draw "stroke-opacity ' + strOp + ' path \'M 50,5 L 50,95\' " ' // 4
	    strGrid_Top = strGrid_Top + ' -draw "stroke-opacity ' + strOp + ' path \'M 100,5 L 100,95\' " ' // 4
	    strGrid_Top = strGrid_Top + ' -draw "stroke-opacity ' + strOp + ' path \'M 150,5 L 150,95\' " ' // 4
	    //  Box around parameter 4/12/15
	    strGrid_Top = strGrid_Top + ' -draw "stroke-opacity ' + strOp + ' path \'M 1,1 L 199,1\' " '
	    strGrid_Top = strGrid_Top + ' -draw "stroke-opacity ' + strOp + ' path \'M 199,1 L 199,99\' " '
	    strGrid_Top = strGrid_Top + ' -draw "stroke-opacity ' + strOp + ' path \'M 199,99 L 1,99\' " '
	    strGrid_Top = strGrid_Top + ' -draw "stroke-opacity ' + strOp + ' path \'M 1,99 L 1,1\' " '

	    strIM_Top3 = 'sudo convert ' + strDir + '_top.jpg ' + strGrid_Top +  strDir + '_top.jpg'

	    strIM_Top4 = 'sudo convert  -size 128x64 xc:black ' + strDir + '_top.jpg ' +  strDir + '_top.jpg'

	    try { 
	    	eXcOut = execSync(strIM_Top_Flip);
				console.log(eXcOut);
			}catch (err) {
				console.log('ERROR [' + err + '] : executing execSync[' + strIM_Top_Flip + ']')
			}

	    try { 
	    	eXcOut = execSync(strIM_Top);
				console.log(eXcOut);
			}catch (err) {
				console.log('ERROR [' + err + '] : executing execSync[' + strIM_Top + ']')
			}

	    try { 
	    	eXcOut = execSync(strIM_Top2);
				console.log(eXcOut);
			}catch (err) {
				console.log('ERROR [' + err + '] : executing execSync[' + strIM_Top2 + ']')
			}

	    try { 
	    	eXcOut = execSync(strIM_Top3);
				console.log(eXcOut);
			}catch (err) {
				console.log('ERROR [' + err + '] : executing execSync[' + strIM_Top3 + ']')
			}

			try { 
	    	eXcOut = execSync(strIM_Top4);
				console.log(eXcOut);
			}catch (err) {
				console.log('ERROR [' + err + '] : executing execSync[' + strIM_Top4 + ']')
			}

			strFile = '_top.jpg'
			try { 
			copyFileSync(strDir + strFile, strLocal_WWW_Path + strFile)
			}catch (err) {
				console.log('ERROR [' + err + '] : executing copyFileSync[' + strDir + strFile, strLocal_WWW_Path + strFile + ']')
			}

			// Delete Top.png so the file count of PNGs is correct  //
			strConsole = 'sudo rm ' + strDir + '_top.png';
			try { 
	    	eXcOut = execSync(strConsole);
				console.log(eXcOut);
			}catch (err) {
				console.log('ERROR [' + err + '] : executing execSync[' + strConsole + ']')
			}


	    ///console.log('strIM_Top=[' + strIM_Top + ']');
	    //response.write('strIM_Top=[' + strIM_Top + ']');
	    //  pipe to imagemagick
	    //var exec = require('child_process').exec;
	    ///exec(strIM_Top, function (error, stdout, stderr) {
	      // output is in stdout
	      /*
	      ///console.log('strIM_Top stdout=[' + stdout + '] : error=[' + error + '] : stderr=[' + stderr + ']');
		  //var exec = require('child_process').exec;
		    exec(strIM_Top2, function (error, stdout, stderr) {
		      // output is in stdout
		      console.log('strIM_Top2 stdout=[' + stdout + '] : error=[' + error + '] : stderr=[' + stderr + ']');
		      	//var exec = require('child_process').exec;
			    exec(strIM_Top3, function (error, stdout, stderr) {
			      // output is in stdout
			      console.log('strIM_Top3 stdout=[' + stdout + '] : error=[' + error + '] : stderr=[' + stderr + ']');
			      strFile = '_top.jpg'
						copyFileSync(strDir + strFile, strLocal_WWW_Path + strFile)
			    });
		    });
	    //});
*/

			console.log('About to convert Front .............................................')
	    /////////////////////////////////////////////////////////////////////////////
	    /////////////////////////////////////////////////////////////////////////////
	    ///
	    ///  FRONT  ////  F R O N T
	    ///
	    /////////////////////////////////////////////////////////////////////////////
	    //strIM_Front = strIM_Front + ' -mode Concatenate  -tile 1x  -geometry 128x1\!+0+0 ' + strDir + '_front.jpg'; 

	    //-//  Pipeline to convert to the correct height  //
	    // We used 1x pixel for the geometery because itround to 1x pixel. So now we need to compress if fPixels_Front_Y != 1
	    //if(fPixels_Front_Y != 1) {
      fRatio_RS1 = fPixels_Front_Y / 1.0;
      fRatio_Layers = fRatio_RS1 * iFile_Counter;
      iHeight_Calc = 450 - (iFile_Counter * fPixels_Front_Y);
	    //strGrid_Front = ' -stroke red -draw "line 3,61 125,61" -stroke green -draw "line 3,61 3,3" '
	    ///strGrid_Front = ' -stroke red -draw "line 3,448 190,448"  -stroke blue -draw "line 3,448 3,10 " -stroke green -draw "line 3,448 25,425 " ';  //  Zero is Top Left : Known good 4/12/15
	    strGrid_Front = ' -stroke red -draw "line 1,449 199,449"  -stroke blue -draw "line 1,449 1,10 " -stroke green -draw "line 1,449 25,425 " ';  //  Zero is Top Left
	    strFloodFill = ' '// -tile pattern:left30   -floodfill +0+' + fRatio_Layers + ' black '
	    //strIM_Front2 = 'sudo convert -size 200x450 xc:skyblue  ' + strDir + '_front.jpg ' + '-resize 200x' + fRatio_Layers + '\! ' + strDir + '_front.jpg -geometry +100+225 -composite ' + strDir + '_front.jpg'; 
	    strIM_Front2 = 'sudo convert ' + strDir + '_front.jpg ' + ' -resize 200x' + fRatio_Layers + '\! ' + strFloodFill + strDir + '_front.jpg'; 
	    //}
	    //strIM_Front3 = 'sudo convert -size 200x450 xc:black -gravity east ' + strDir + '_front.jpg -layers flatten ' + strDir + '_front.jpg'; 

	    ///strIM_Front3 = 'sudo convert ' + strGrid_Front + strFloodFill + ' -size 200x450 xc:black -page +0+' + iHeight_Calc + ' ' + strDir + '_front.jpg -layers flatten ' + strDir + '_front.jpg'; //  KnownGood 3/30/15
	    //strIM_Front3 = 'sudo convert -size 200x450 xc: -sparse-color barycentric \'100,10 blue 100,440 red\' -page +0+' + iHeight_Calc + strGrid_Front + strDir + '_front.jpg -layers flatten ' + strDir + '_front.jpg';
	    //strIM_Front3 = 'sudo convert ' + strDir + '_front.jpg ' + strGrid_Front + strFloodFill + ' -size 200x450 xc:black -page +0+' + iHeight_Calc + ' -layers flatten ' + strDir + '_front.jpg'; //  KnownGood 3/30/15
	   	///strIM_Front3 = 'sudo convert ' + ' -size 200x450 xc:black -page +0+' + iHeight_Calc + ' ' + strDir + '_front.jpg -layers flatten ' + strGrid_Front + ' ' + strDir + '_front.jpg'; //  KnownGood 3/30/15
	    //strIM_Front3 = 'sudo convert -size 200x450 -page +0+' + iHeight_Calc + ' ' + strDir + '_front.jpg -fill blue -opaque black -layers flatten ' + strDir + '_front.jpg';
	    strIM_Front3 = 'sudo convert ' + strDir + '_front.jpg -modulate 240 ' + strGrid_Front + ' ' + strDir + '_front.jpg';
	          //  Generate ISO  //
	          ///strIM_Iso = 'sudo composite  -gravity north ' + strDir + '_top.jpg ' + strDir + '_front.jpg ' + strDir + '_iso.jpg';
	          ///strIM_Iso2 = 'sudo convert -size 250x450 xc:black -gravity center ' + strDir + '_iso.jpg -stroke blue -draw "line 3,448 3,10 " -stroke green -draw "line 3,448 40,429 " ' + strDir + '_iso.jpg';  //  Zero is Top Left
	          strIM_Iso = 'sudo convert -size 250x450 xc:black ' + strDir + '_iso.jpg';  //  Make a 250x450 Black Box
	          //strIM_Iso = 'sudo composite  -gravity north ' + strDir + '_top.jpg ' + strDir + '_front.jpg ' + strDir + '_iso.jpg';
	          //strIM_Iso2 = 'sudo composite  -gravity center ' + strDir + '_iso.jpg' + ' -gravity north ' + strDir + '_top.jpg -gravity center ' + strDir + '_front.jpg ' + strDir + '_iso.jpg';  //  Zero is Top Left
	          strIM_Iso2 = 'sudo composite  -gravity center ' + strDir + '_front.jpg ' + strDir + '_iso.jpg ' + strDir + '_iso.jpg';  //  Zero is Top Left
	          strIM_Iso3 = 'sudo composite  -gravity north ' + strDir + '_top.jpg ' + strDir + '_iso.jpg ' + strDir + '_iso.jpg';  //  Zero is Top Left
	    //strIM_Front = strIM_Front + ' -mode Concatenate  -tile 1x  -geometry 128x' + fPixels_Front_Y + '\!+0+0 ' + strDir + '_front.jpg'; //' + fPixels_Front_Y + '
	    //strIM_Front = strIM_Front + '-background none  -compose DstOver  -flatten ' + strDir + '_front.jpg';
	    //strIM_Front = strIM_Front + ' -tile 1x' + iFile_Counter + ' -geometry 100x' + fPixels_Front_Y + '+0+0 ' + strDir + '_front.jpg'
	    //strIM_Front = strIM_Front + ' -tile 1x' + iFile_Counter + ' -geometry 200x' + fPixels_Front_Y + '+0+0 -evaluate-sequence mean  ' + strDir + '_front.jpg'
	    //strIM_Front = strIM_Front + ' -tile 1x' + iFile_Counter + ' -geometry 200x' + fPixels_Front_Y + '+0+0 ' + strDir + '_front.jpg'
	    //strIM_Front = strIM_Front + ' ' + strIBF_Raw_Data_Folder + strModel_Name + '_[' + iBase + '-' + iFile_Last + '].png -tile 1x' + iFile_Counter + ' ' + strDir + '_front.jpg'
	    //console.log('strIM_Front=[' + strIM_Front + ']');
	    //response.write('strIM_Front=[' + strIM_Front + ']');
	    /*
	    try { 
	    	eXcOut = execSync(strIM_Front2);
				console.log(eXcOut);
			}catch (err) {
				console.log('ERROR [' + err + '] : executing execSync[' + strIM_Front2 + ']')
			}
*/
	    try { 
	    	eXcOut = execSync(strIM_Front3);
				console.log(eXcOut);
			}catch (err) {
				console.log('ERROR [' + err + '] : executing execSync[' + strIM_Front3 + ']')
			}
			
	    try { 
	    	eXcOut = execSync(strIM_Iso);
				console.log(eXcOut);
			}catch (err) {
				console.log('ERROR [' + err + '] : executing execSync[' + strIM_Iso + ']')
			}

	    try { 
	    	eXcOut = execSync(strIM_Iso2);
				console.log(eXcOut);
			}catch (err) {
				console.log('ERROR [' + err + '] : executing execSync[' + strIM_Iso2 + ']')
			}

	    try { 
	    	eXcOut = execSync(strIM_Iso3);
				console.log(eXcOut);
				//console.log('strIM_Iso3 [' + strIM_Iso3 + '] stdout=[' + stdout + '] : error=[' + error + '] : stderr=[' + stderr + ']');
      	strFile = '_iso.jpg'
			  copyFileSync(strDir + strFile, strLocal_WWW_Path + strFile)
			  //  For now make copies of the iso as main, main_thumb and model_name.jpg
			  strFileNew = '_main.jpg'
			  copyFileSync(strDir + strFile, strDir + strFileNew)
			  strFileNew = '_main_thumb.jpg'
			  copyFileSync(strDir + strFile, strDir + strFileNew)
			  strFileNew = '_' + strModel_Name + '.jpg'
			  copyFileSync(strDir + strFile, strDir + strFileNew)
				strFileNew = '_' + strModel_Name + '_Thumb.jpg'
			  copyFileSync(strDir + strFile, strDir + strModel_Name + '.jpg')
			  
			}catch (err) {
				console.log('ERROR [' + err + '] : executing execSync[' + strIM_Iso3 + ']')
			}


			//  DEBUG  //
			//strFileNew = '_side.jpg'
			//copyFileSync(strDir + strFile, strDir + strFileNew)

			model_copy_images_to_www();

			/*
	    //  pipe to imagemagick
	    //var exec = require('child_process').exec;
	    //exec(strIM_Front, function (error, stdout, stderr) {
	      // output is in stdout
	      //console.log('strIM_Front stdout=[' + stdout + '] : error=[' + error + '] : stderr=[' + stderr + ']');
	      //  Post process Image  // You can pipeline . i.e. montage image.png  | convert -resize...
	      //var exec = require('child_process').exec;
	      exec(strIM_Front2, function (error, stdout, stderr) {
	        console.log('strIM_Front2 stdout=[' + stdout + '] : error=[' + error + '] : stderr=[' + stderr + ']');
	        //var exec = require('child_process').exec;
	        strFile = '_front.jpg'
					copyFileSync(strDir + strFile, strLocal_WWW_Path + strFile)
	        exec(strIM_Front3, function (error, stdout, stderr) {
	          console.log('strIM_Front3 stdout=[' + stdout + '] : error=[' + error + '] : stderr=[' + stderr + ']');
	          //  Generate ISO  //
	          ///strIM_Iso = 'sudo composite  -gravity north ' + strDir + '_top.jpg ' + strDir + '_front.jpg ' + strDir + '_iso.jpg';
	          ///strIM_Iso2 = 'sudo convert -size 250x450 xc:black -gravity center ' + strDir + '_iso.jpg -stroke blue -draw "line 3,448 3,10 " -stroke green -draw "line 3,448 40,429 " ' + strDir + '_iso.jpg';  //  Zero is Top Left
	          strIM_Iso = 'sudo convert -size 250x450 xc:black ' + strDir + '_iso.jpg';  //  Make a 250x450 Black Box
	          //strIM_Iso = 'sudo composite  -gravity north ' + strDir + '_top.jpg ' + strDir + '_front.jpg ' + strDir + '_iso.jpg';
	          //strIM_Iso2 = 'sudo composite  -gravity center ' + strDir + '_iso.jpg' + ' -gravity north ' + strDir + '_top.jpg -gravity center ' + strDir + '_front.jpg ' + strDir + '_iso.jpg';  //  Zero is Top Left
	          strIM_Iso2 = 'sudo composite  -gravity center ' + strDir + '_front.jpg ' + strDir + '_iso.jpg ' + strDir + '_iso.jpg';  //  Zero is Top Left
	          strIM_Iso3 = 'sudo composite  -gravity north ' + strDir + '_top.jpg ' + strDir + '_iso.jpg ' + strDir + '_iso.jpg';  //  Zero is Top Left
	          

	          exec(strIM_Iso, function (error, stdout, stderr) {
			      	// output is in stdout
			      	console.log('strIM_Iso [' + strIM_Iso + '] stdout=[' + stdout + '] : error=[' + error + '] : stderr=[' + stderr + ']');
		          exec(strIM_Iso2, function (error, stdout, stderr) {
				      	// output is in stdout
				      	console.log('strIM_Iso2 [' + strIM_Iso2 + '] stdout=[' + stdout + '] : error=[' + error + '] : stderr=[' + stderr + ']');
				      	exec(strIM_Iso3, function (error, stdout, stderr) {
					      	// output is in stdout
					      	console.log('strIM_Iso3 [' + strIM_Iso3 + '] stdout=[' + stdout + '] : error=[' + error + '] : stderr=[' + stderr + ']');
					      	strFile = '_iso.jpg'
								  copyFileSync(strDir + strFile, strLocal_WWW_Path + strFile)
								  //  For now make copies of the iso as main, main_thumb and model_name.jpg
								  strFileNew = '_main.jpg'
								  copyFileSync(strDir + strFile, strDir + strFileNew)
								  strFileNew = '_main_thumb.jpg'
								  copyFileSync(strDir + strFile, strDir + strFileNew)
								  strFileNew = '_' + strModel_Name + '.jpg'
								  copyFileSync(strDir + strFile, strDir + strFileNew)
									 strFileNew = '_' + strModel_Name + '_Thumb.jpg'
								  copyFileSync(strDir + strFile, strDir + strModel_Name + '.jpg')
								  model_copy_images_to_www();
								});
		      		});
	      		});
	        });
	      });
	    //});

*/
/*
	    /////////////////////////////////////////////////////////////////////////////
	    /////////////////////////////////////////////////////////////////////////////
	    ///  Side  ////  S I D E
	    strGrid_Side = ' -stroke green -draw "line 3,448 95,448"  -stroke blue -draw "line 3,448 3,10 " -stroke red -draw "line 3,448 13,438 " ';  //  Zero is Top Left
	    strIM_Side = strIM_Side + ' -mode Concatenate  -tile x1  -geometry 1x64\!+0+0 ' + strDir + '_side.jpg'; 
	    //strIM_Side2 = ''
	    strIM_Side2 = 'sudo convert ' + strDir + '_side.jpg ' + '-rotate 90 -resize ' + fRatio_Layers + 'x100\! ' + strDir + '_side.jpg';  //  
	    strIM_Side3 = 'sudo convert -size 100x450 xc:black -page +0+' + iHeight_Calc + ' ' + strDir + '_side.jpg -layers flatten ' + strGrid_Side + ' ' + strDir + '_side.jpg'; 
	    //strIM_Side4 = 'sudo convert ' + strDir + '_side.jpg -rotate 90 ' + strDir + '_side.jpg'; 
	    //strIM_Side4 = 'sudo convert ' + strDir + '_side.jpg' + ' -fuzz 60% -fill grey -opaque yellow  ' + strDir + '_side.jpg'
	    strIM_Side4 = ' ';

	    //  pipe to imagemagick
	    //var exec = require('child_process').exec;
	    exec(strIM_Side, function (error, stdout, stderr) {
	      // output is in stdout
	      console.log('strIM_Side stdout=[' + stdout + '] : error=[' + error + '] : stderr=[' + stderr + ']');
	      //  Post process Image  // You can pipeline . i.e. montage image.png  | convert -resize...
	      //var exec = require('child_process').exec;
	      exec(strIM_Side2, function (error, stdout, stderr) {
	        console.log('strIM_Side2 stdout=[' + stdout + '] : error=[' + error + '] : stderr=[' + stderr + ']');
	        //var exec = require('child_process').exec;
	        exec(strIM_Side3, function (error, stdout, stderr) {
	          console.log('strIM_Side3 stdout=[' + stdout + '] : error=[' + error + '] : stderr=[' + stderr + ']');
	          //var exec = require('child_process').exec;
	          exec(strIM_Side4, function (error, stdout, stderr) {
	            console.log('strIM_Side4 stdout=[' + stdout + '] : error=[' + error + '] : stderr=[' + stderr + ']');
	            strFile = '_side.jpg'
							copyFileSync(strDir + strFile, strLocal_WWW_Path + strFile)
	          });
	        });
	      });
	      
	    });
	    /////////////////////////////////////////////////////////////////////////////

	    */

	    /////////////////////////////////////////////////////////////////////////////
	    /////////////////////////////////////////////////////////////////////////////======================///====///====> ISO
	    ///  Iso View  ////  I S O
	    //  ScaleRotateTranslate : X,Y     Scale     Angle  NewX,NewY  -> scale, rotate and translate coord
	    //strIM_Iso = strIM_Iso + ' -distort ScaleRotateTranslate \'45,42  .4,.6  40  64,32\' ' + ' -mode Concatenate  -tile 1x  -geometry 128x1\!+0+0 ' + strDir + '_iso.jpg'; //  VERY VERY FAST
	     /*strIM_Iso = 'convert  ' + strDir + '_top.jpg -alpha set -virtual-pixel transparent +distort Affine \'0,512 0,0   0,0 -87,-50  512,512 87,-50\'  '
	     strIM_Iso = strIM_Iso + ' ' + strDir + '_side.jpg -alpha set -virtual-pixel transparent +distort Affine \'512,0 0,0   0,0 -87,-50  512,512 0,100\'  '
	     strIM_Iso = strIM_Iso + ' ' + strDir + '_front.jpg -alpha set -virtual-pixel transparent +distort Affine \'  0,0 0,0   0,320 0,100    320,0 87,-50\'  '
	     */
	 
	     //strIM_Iso = strIM_Iso + ' -background none -compose plus -layers merge +repage '
	     //strIM_Iso = strIM_Iso + ' -bordercolor black -compose over -border 5x2  ' + strDir + '_iso.jpg'
	    //strGrid_Iso = ' '// -stroke red -draw "line 3,445 190,445" -stroke green -draw "line 3,445 5,443 "  -stroke blue -draw "line 3,445 3,10 " ';  //  Zero is Top Left
	 	
	    ////strIM_Iso = strIM_Iso + ' -mode Concatenate  -tile 1x  -geometry 128x1\!+0+0 ' + strDir + '_iso.jpg'; //  3/30/15 this works but only with no Z change. i.e. we want rear Z lifted.
	    //strIM_Iso2 = '' //-rotate 35 
	    //strIM_Iso3 = ''
	    //strIM_Iso2 = 'sudo convert ' + strDir + '_iso.jpg ' + '-background black -virtual-pixel background -distort ScaleRotateTranslate \'64,32  .4,.6  15  64,32\' -resize 250x' + fRatio_Layers + '\! ' + strDir + '_iso.jpg';
	    /////strIM_Iso2 = 'sudo convert ' + strDir + '_iso.jpg ' + '  -resize 250x' + fRatio_Layers + '\! ' + strGrid_Iso + strDir + '_iso.jpg'; //  Known Good
	    /////strIM_Iso3 = 'sudo convert -size 250x450 xc:black -page +0+' + iHeight_Calc + ' ' + strDir + '_iso.jpg -layers flatten ' + strDir + '_iso.jpg'; //  KnownGood 3/30/15
	    //console.log('strIM_Iso=[' + strIM_Iso + ']');
	    //response.write('strIM_Iso=[' + strIM_Iso + ']');
	    //  pipe to imagemagick
	   
	   /*  //  Geneated in Front3s EXEC
	    var exec = require('child_process').exec;
	    exec(strIM_Iso, function (error, stdout, stderr) {
	      // output is in stdout
	      console.log('strIM_Iso stdout=[' + stdout + '] : error=[' + error + '] : stderr=[' + stderr + ']');
	      response.write('strIM_Iso stdout=[' + stdout + '] : error=[' + error + '] : stderr=[' + stderr + ']');
	      //  Post process Image  // You can pipeline . i.e. montage image.png  | convert -resize...
	      var exec = require('child_process').exec;
	      exec(strIM_Iso2, function (error, stdout, stderr) {
	        console.log('strIM_Iso2 stdout=[' + stdout + '] : error=[' + error + '] : stderr=[' + stderr + ']');
	        response.write('strIM_Iso2 stdout=[' + stdout + '] : error=[' + error + '] : stderr=[' + stderr + ']');
	        var exec = require('child_process').exec;
	        exec(strIM_Iso3, function (error, stdout, stderr) {
	          console.log('strIM_Iso3 stdout=[' + stdout + '] : error=[' + error + '] : stderr=[' + stderr + ']');
	          response.write('strIM_Iso3 stdout=[' + stdout + '] : error=[' + error + '] : stderr=[' + stderr + ']');
	          fcn_close_html(request, response, url);
	        });
	      });
	    });
	*/
	    /////////////////////////////////////////////////////////////////////////////
	    /////////////////////////////////////////////////////////////////////////////======================///====///====> ISO :: END
	    /////////////////////////////////////////////////////////////////////////////


	  /////
	  ////////////////////////////////////////////////////////////////////////////////   
	  fix_directory_permissions(strDir);

	  //  Add number of files to model.json
	  ibp_create_model.update_model_information(strModel_Name);

  }

  function fix_directory_permissions (strDir) {
  	console.log('fix_directory_permissions on ' + strDir);
  		  //  Fix permissions on directory  //
	  console.log('Fixing Permissions Issues on [' + strDir + ']')
	  strIM_Fix_Permissions = 'sudo chmod 777 ' + strDir
  	try { 
    	eXcOut = execSync(strIM_Fix_Permissions);
			console.log(eXcOut);
		}catch (err) {
			console.log('ERROR [' + err + '] : executing execSync[' + strIM_Fix_Permissions + ']')
		}
  }

  function model_copy_images_to_www () {
  	console.log('model_copy_images_to_www : This is also done upon convert');
  	initialize_class();
	//  Copy images to WWW/model_images/ directory
	

		strFile = '_iso.jpg'
		try { 
			copyFileSync(strDir + strFile, strLocal_WWW_Path + strFile)
		}catch (err) {
			console.log('ERROR [' + err + '] : executing copyFileSync[' + strDir + strFile, strLocal_WWW_Path + strFile + ']')
		}

		strFile = '_top.jpg'
		try { 
			copyFileSync(strDir + strFile, strLocal_WWW_Path + strFile)
		}catch (err) {
			console.log('ERROR [' + err + '] : executing copyFileSync[' + strDir + strFile, strLocal_WWW_Path + strFile + ']')
		}

		strFile = '_side.jpg'
		try { 
			copyFileSync(strDir + strFile, strLocal_WWW_Path + strFile)
		}catch (err) {
			console.log('ERROR [' + err + '] : executing copyFileSync[' + strDir + strFile, strLocal_WWW_Path + strFile + ']')
		}

		strFile = '_front.jpg'
		try { 
			copyFileSync(strDir + strFile, strLocal_WWW_Path + strFile)
		}catch (err) {
			console.log('ERROR [' + err + '] : executing copyFileSync[' + strDir + strFile, strLocal_WWW_Path + strFile + ']')
		}

		strFile = '_main.jpg'
		try { 
			copyFileSync(strDir + strFile, strLocal_WWW_Path + strFile)
		}catch (err) {
			console.log('ERROR [' + err + '] : executing copyFileSync[' + strDir + strFile, strLocal_WWW_Path + strFile + ']')
		}

		strFile = '_main_thumb.jpg'
		//copyFileSync(strDir + strFile, strLocal_WWW_Path + strFile)

		strFile = '_iso.jpg'
		try { 
		strFileNew = strModel_Name + '.jpg'
			copyFileSync(strDir + strFile, strLocal_WWW_Path + strFileNew)
		}catch (err) {
			console.log('ERROR [' + err + '] : executing copyFileSync[' + strDir + strFile, strLocal_WWW_Path + strFile + ']')
		}
		

		strFileNew = strModel_Name + '_Thumb.jpg'
		try { 
			copyFileSync(strDir + strFile, strLocal_WWW_Path + strFileNew)
		}catch (err) {
			console.log('ERROR [' + err + '] : executing copyFileSync[' + strDir + strFile, strLocal_WWW_Path + strFile + ']')
		}

		//  Cleanup
		//  1. Delete all SVG images in the /expanded/model_name/ folder that may have been left behind if this was a SVG->IBP process
		//var exec = require('child_process').exec;
	  strExec = 'sudo rm ' + strDir + '*.svg';
		try { 
    	var eXcOut = execSync(strExec);
			console.log(eXcOut);
		}catch (err) {
			console.log('ERROR [' + err + '] : executing execSync[' + strExec + ']')
		}

		console.log('strExec [' + strExec + '] = [' + eXcOut + ']');

  }




  function fsSystem_Load() {
  try {  //  T2
    data = fs.readFileSync(strHomeDirectory + strSystem_File_Name + strSettingsFile_Ext) //  T2
    console.log("fsSystem_Load : readFileSync=",strHomeDirectory + strSystem_File_Name + strSettingsFile_Ext)
    mySystem = JSON.parse(data);
    //console.log(mySystem);
  }
  catch (err) {
    console.log('There has been an error [' + err + '] parsing your JSON. : mySystem')
  }
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
    console.log('There has been an error [' + err + '] parsing your JSON. : myConfig')
  }
}

function model_images_show(request, response, url) {
  console.log("Called: model_images_show Function")
  initialize_class();
  


  response.write('<html><body bgcolor="#1B1B1B">');
  response.write('<center><table class="layout" border="0" width="960" bgcolor="#000000">');
  response.write('<head>');
  response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#c6c6c6">');
  response.write('<title>iBox Nano - Share Models</title>');
  response.write('<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />');
  response.write('<link rel="icon" href="' + strApacheRootLink + 'favicon-32.png" sizes="32x32">');
    response.write('<link rel="shortcut icon" type="image/x-icon" href="' + strApacheRootLink + 'favicon.ico"/>');
  response.write('</head><p>');

  //  Images are stored in the /packages/expanded/model_name/ dir. Which is NOT visible from WWW on port 8000.
  //  So we need to first move them.
  model_copy_images_to_www();


  response.write('<body bgcolor="#FFFFFF">');
  	response.write('<h2>Images in [' + strApacheRootLink + 'model_images/]</h1><br><br>');
  	strFile = '_iso.jpg'

	response.write('<img src="' + strApacheRootLink + 'model_images/' + strFile + '" alt="' + strFile + '">&nbsp');

	strFile = '_top.jpg'

	response.write('<img src="' + strApacheRootLink + 'model_images/' + strFile + '" alt="' + strFile + '">&nbsp');

	strFile = '_side.jpg'

	response.write('<img src="' + strApacheRootLink + 'model_images/' + strFile + '" alt="' + strFile + '">&nbsp');

	strFile = '_front.jpg'

	response.write('<img src="' + strApacheRootLink + 'model_images/' + strFile + '" alt="' + strFile + '"><br>');

////////////////////////////////// BODY START  //////////////////

  




	response.write('    </td>');
	response.write('  </tr>');
	response.write('</table>');

	response.write('    </td>');
	response.write('  </tr>');
	response.write('</table>');
	response.write('<!-- End Save for Web Slices -->');

	
		  //////////////////////////////////////////////////////////////////////////////////////////////////////
		  ////  Back Button to Home ////
		  ///////////////////////////////////////////////////
		  /*
		  response.write('<br>');
		  response.write('<form name="input" action="http://' + strIPAddress + '" method="get">');
		  response.write('<input type="submit" value="Back">');
		  response.write('</form>');
	  */

	  //response.write('<br>Request Object:' + request.url)

	  response.write('</table></center></body></html>');
	  response.write('</FONT>');

	    //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Back Button to Home ////
  ///////////////////////////////////////////////////
  
	  response.write('<br>');
	  response.write('<form name="input" action="http://' + strIPAddress + '" method="get">');
	  response.write('<input type="submit" value="Home">');
	  response.write('</form>');

	  response.write('</body>');
	  response.write('</html>');
	  response.end();

}







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
  strURL_Save_Share_Values = 'http://' + strIPAddress + '/button_share_save';
  strZeroConfigName = os.hostname();
  //console.log('IP Address is:',strIPAddress)
  
}

function copyFileSync( source, target ) {
	//  From: http://stackoverflow.com/questions/13786160/copy-folder-recursively-in-node-js
    var targetFile = target;
    console.log('copyFileSync :: Source=[' + source + '] : Target=[' + target + ']');
    //if target is a directory a new file with the same name will be created
    if ( fs.existsSync( target ) ) {
        if ( fs.lstatSync( target ).isDirectory() ) {
            targetFile = path.join( target, path.basename( source ) );
        }
    }

    fs.createReadStream( source ).pipe( fs.createWriteStream( targetFile ) );
}

function copyFolderRecursiveSync( source, target ) {
    var files = [];
    console.log('copyFolderRecursiveSync :: Source=[' + source + '] : Target=[' + target + ']');
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

var elapsed_time = function(note){
    var precision = 3; // 3 decimal places
    var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
    console.log(process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note); // print message + time
    start = process.hrtime(); // reset the timer
}


exports.model_images_show = model_images_show;
exports.model_generate_images = model_generate_images

/*
//  ImageMagick Defaults from /etc/ImageMagick/policy.xml

Check set reources:
identify -list resource

Was:
pi@nano ~ $ identify -list resource
File         Area       Memory          Map         Disk    Thread         Time
-------------------------------------------------------------------------------
 768      480.5MB     229.1MiB     458.2MiB    unlimited         1    unlimited

Check Version
identify -version
pi@nano ~ $ identify -version
Version: ImageMagick 6.7.7-10 2014-04-09 Q16 http://www.imagemagick.org
Copyright: Copyright (C) 1999-2012 ImageMagick Studio LLC
Features: OpenMP    

Maybe more than one policy.xml?
sudo find | grep "policy.xml"

pi@nano / $ sudo find | grep "policy.xml"
./usr/share/doc/java-common/policy.xml.gz
./etc/ImageMagick/policy.xml

<policymap>
  <!-- <policy domain="system" name="precision" value="6"/> -->
  <!-- <policy domain="resource" name="temporary-path" value="/tmp"/> -->
  <!-- <policy domain="resource" name="memory" value="2GiB"/> -->
  <!-- <policy domain="resource" name="map" value="4GiB"/> -->
  <!-- <policy domain="resource" name="area" value="1GiB"/> -->
  <!-- <policy domain="resource" name="disk" value="16EB"/> -->
  <!-- <policy domain="resource" name="file" value="768"/> -->
  <!-- <policy domain="resource" name="thread" value="4"/> -->
  <!-- <policy domain="resource" name="throttle" value="0"/> -->
  <!-- <policy domain="resource" name="time" value="3600"/> -->
</policymap>

Changed To 4/10/2015

<policymap>
  <!-- <policy domain="system" name="precision" value="6"/> -->
  <!-- <policy domain="resource" name="temporary-path" value="/tmp"/> -->
  <!-- <policy domain="resource" name="memory" value="76MiB"/> -->
  <!-- <policy domain="resource" name="map" value="75MiB"/> -->
  <!-- <policy domain="resource" name="area" value="100MiB"/> -->
  <!-- <policy domain="resource" name="disk" value="1GiB"/> -->
  <!-- <policy domain="resource" name="file" value="768"/> -->
  <!-- <policy domain="resource" name="thread" value="4"/> -->
  <!-- <policy domain="resource" name="throttle" value="100"/> -->
  <!-- <policy domain="resource" name="time" value="600"/> -->
</policymap>

Also tried MB instead of MiB (but still love the movie)
Also uncommented LOL
<policymap>
   <policy domain="system" name="precision" value="6"/>    
   <policy domain="resource" name="temporary-path" value="/tmp"/>    
   <policy domain="resource" name="memory" value="76MB"/>    
   <policy domain="resource" name="map" value="75MB"/>    
   <policy domain="resource" name="area" value="100MB"/>    
   <policy domain="resource" name="disk" value="1GB"/>    
   <policy domain="resource" name="file" value="768"/>    
   <policy domain="resource" name="thread" value="4"/>    
   <policy domain="resource" name="throttle" value="100"/>    
   <policy domain="resource" name="time" value="600"/>    
</policymap>

File         Area       Memory          Map         Disk    Thread         Time
-------------------------------------------------------------------------------
 768         44MB     20.03MiB     19.07MiB     190.7MiB         1          600

 30-50% CPU at 100M ram used of 229
 828 seconds for the main convert loop Top + Front

4/11/15
<policymap>
   <policy domain="system" name="precision" value="4"/>
   <policy domain="resource" name="temporary-path" value="/tmp"/>
   <policy domain="resource" name="memory" value="41MB"/>
   <policy domain="resource" name="map" value="40MB"/>
   <policy domain="resource" name="area" value="84MB"/>
   <policy domain="resource" name="disk" value="800MB"/>
   <policy domain="resource" name="file" value="768"/>
   <policy domain="resource" name="thread" value="4"/>
   <policy domain="resource" name="throttle" value="0"/>
   <policy domain="resource" name="time" value="600"/>
</policymap>

177 sec
186 sec 

*/