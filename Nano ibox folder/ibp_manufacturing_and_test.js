//  ibp_manufacturing_and_test  // 
//  Created: 4/2/2015
//  Copyright iBox Printers Inc 2015

//  Includes
var iBoxWebGUI = require("./iBoxWebGUI.js")
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
var strHomeDirectory = '/home/pi/ibox/';
var strConfigDirectory = '/home/pi/ibox/print_config_files/';
var strConfigDirectory_WebDownload = '/ibox/print_config_files/';

var strSystem_File_Name = 'mysystem';
var strCalibration_File_Name = 'mycalibration';
var strConfig_File_Name = 'default';
var strUpdates_File_Name = 'updates';
var strUpdate_File_List_File_Name = "file_update_list";
var strSettingsFile_Ext = '.json';

var srrIP_MnT_default = 'Select MnT Unit'

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
	Print_Counter: 0,
	Print_Time: 0,
	Print_UV_Time: 0,
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

function main(request, response, url , iContrastAdjusted) {
	console.log("Called: ibp_manufacturing_and_test->main Function")
	fcnUpdate_IP_Address();
	response.writeHead(200, {'content-type': 'text/html'});
	strFree_RAM = String(os.freemem()/1000000).substring(0,6);

	
	var strRaw = String(os.loadavg())
	var aryCPU = strRaw.split(',');
	//strCPU = aryCPU[1].substring(0,3);
	strCPU = String(aryCPU[2]*100).substring(0,3) + "%"; //  1 , 5 , 15min lookback/avg of CPU i.e. [2] = 5min avg lookback of CPU

	//  Use Text Wranglers TEXT->Prefix/SuffixLines to add response.write(' and ');
  //  Use TextWragler SEARCH->FIND to replace "images/" with "' + strFullPath + '"  
  //  The LCD section will need to use BACKGROUND images so we can put text on top. This is somewhat a manual process.
  //  Images will be served from Apache at /var/www/images/
  //  There is a script in /ibox/ that copies the images from /ibox/images to /var/www/images to assist with refreshes of images


	response.write('<html><body bgcolor="#1B1B1B">');
	response.write('<center><table class="layout" border="0" width="960" bgcolor="#000000">');
	response.write('<head>');
	response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#c6c6c6">');
	//response.write('<title>iBox Nano - Manufacturing and Test Center - Ages 18 and Up</title>');
	response.write('<title>iBox Nano - Manufacturing and Test - ' + strZeroConfigName + '</title>');
	response.write('<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />');
	response.write('<link rel="icon" href="' + strApacheRootLink + 'favicon-32.png" sizes="32x32">');
  response.write('<link rel="shortcut icon" type="image/x-icon" href="' + strApacheRootLink + 'favicon.ico"/>');
  response.write('<link rel="stylesheet" type="text/css" href="http://' + strIPAddress + ':8000/Styles.css"/>');
	response.write('</head><p>');

	response.write('<body bgcolor="#FFFFFF">');

	  ///  Tab Bar with CSS : Start  ////////////////////////////////////
  header_css( response, "button_manufandtest");
  /////////// Tab Br with CSS : End  ////////////////////////////////////

	/*
	response.write('<!-- Save for Web Slices (NanoHID_Header_960x72.psd) -->');
	response.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0">');
	response.write('	<tr>');
	response.write('		<td colspan="11">');
	response.write('			<img id="NanoHID_Header_960x72_01" src="' + strFullPath + 'NanoHID_Header_960x72_01.png" width="960" height="8" alt="" /></td>');
	response.write('	</tr>');
	response.write('	<tr>');
	response.write('		<td rowspan="2">');
	response.write('			<img id="NanoHID_Header_960x72_02" src="' + strFullPath + 'NanoHID_Header_960x72_02.png" width="601" height="64" alt="" /></td>');
	//response.write('<td><table class="tabs" border="0" cellspacing="0" cellpadding="0"><tr>'); //  CSS
	response.write('		<td>');
	response.write('			<a href="button_manufandtest">');
	response.write('				<img id="Button_Refresh_Header" src="' + strFullPath + 'Button_Refresh_Header.png" width="54" height="38" border="0" alt="Refresh" /></a></td>');
	response.write('		<td rowspan="2">');
	response.write('			<img id="NanoHID_Header_960x72_04" src="' + strFullPath + 'NanoHID_Header_960x72_04.png" width="46" height="64" alt="" /></td>');
	//response.write('</tr></table></td>'); //  CSS
	//response.write('<td><table class="tabs" border="0" cellspacing="0" cellpadding="0"><tr>'); //  CSS
	response.write('		<td>');
	response.write('			<a href="button_home">');
	response.write('				<img id="Button_Home" src="' + strFullPath + 'Button_Home.png" width="54" height="38" border="0" alt="Home" /></a></td>');
	response.write('		<td rowspan="2">');
	response.write('			<img id="NanoHID_Header_960x72_06" src="' + strFullPath + 'NanoHID_Header_960x72_06.png" width="6" height="64" alt="" /></td>');
	//response.write('</tr></table></td>'); //  CSS
	//response.write('<td><table class="tabs" border="0" cellspacing="0" cellpadding="0"><tr>'); //  CSS
	response.write('		<td>');
	response.write('			<a href="button_help">');
	response.write('				<img id="Button_Help_Header" src="' + strFullPath + 'Button_Help_Header.png" width="54" height="38" border="0" alt="Help" /></a></td>');
	response.write('		<td rowspan="2">');
	response.write('			<img id="NanoHID_Header_960x72_08" src="' + strFullPath + 'NanoHID_Header_960x72_08.png" width="6" height="64" alt="" /></td>');
	//response.write('</tr></table></td>'); //  CSS
	//response.write('<td><table class="tabs" border="0" cellspacing="0" cellpadding="0"><tr>'); //  CSS
	response.write('		<td>');
	response.write('			<a href="button_settings">');
	response.write('				<img id="Button_Settings_Header" src="' + strFullPath + 'Button_Settings_Header.png" width="54" height="38" border="0" alt="Settings" /></a></td>');
	response.write('		<td rowspan="2">');
	response.write('			<img id="NanoHID_Header_960x72_10" src="' + strFullPath + 'NanoHID_Header_960x72_10.png" width="6" height="64" alt="" /></td>');
	//response.write('</tr></table></td>'); //  CSS
	//response.write('<td><table class="tabs" border="0" cellspacing="0" cellpadding="0"><tr>'); //  CSS
	response.write('		<td>');
	response.write('			<a href="button_about">');
	response.write('				<img id="Button_About_Header" src="' + strFullPath + 'Button_About_Header.png" width="54" height="38" border="0" alt="About" /></a></td>');
	response.write('		<td rowspan="2">');
	response.write('			<img id="NanoHID_Header_960x72_12" src="' + strFullPath + 'NanoHID_Header_960x72_12.png" width="25" height="64" alt="" /></td>');
	//response.write('</tr></table></td>'); //  CSS
	response.write('	</tr>');
	response.write('	<tr>');
	response.write('		<td>');
	response.write('			<img id="NanoHID_Header_960x72_13" src="' + strFullPath + 'NanoHID_Header_960x72_13.png" width="54" height="26" alt="" /></td>');
	response.write('		<td>');
	response.write('			<img id="NanoHID_Header_960x72_14" src="' + strFullPath + 'NanoHID_Header_960x72_14.png" width="54" height="26" alt="" /></td>');
	response.write('		<td>');
	response.write('			<img id="NanoHID_Header_960x72_15" src="' + strFullPath + 'NanoHID_Header_960x72_15.png" width="54" height="26" alt="" /></td>');
	response.write('		<td>');
	response.write('			<img id="NanoHID_Header_960x72_16" src="' + strFullPath + 'NanoHID_Header_960x72_16.png" width="54" height="26" alt="" /></td>');
	response.write('		<td>');
	response.write('			<img id="NanoHID_Header_960x72_17" src="' + strFullPath + 'NanoHID_Header_960x72_17.png" width="54" height="26" alt="" /></td>');
	response.write('	</tr>');
	response.write('</table>');
	response.write('<!-- End Save for Web Slices -->');
*/

	// TABS  ///////////////////////////////////////////////
////   NEW on 5/18/2015  ///////  Hover_Buttons : Start
 response.write('<!-- Save for Web Slices (NanoHID_Tabs_960x88.psd) -->');
 response.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0">');
 response.write('  <tr>');
 response.write('    <td>');
 response.write('      <img id="NanoHID_Tabs_960x88_01" src="' + strFullPath + 'NanoHID_Tabs_960x88_01.png" width="31" height="88" alt="" /></td>');
 response.write('<td>');
 response.write('<table class="tabs2" border="0" cellpadding="0" cellspacing="0">');
 response.write('<tr>');
 response.write('    <td>');
  response.write('      <a href="button_network_setup" target="">');
  response.write('        <img id="Button_Network_Setup" src="' + strFullPath + 'Button_Network_Setup.png" width="150" height="88" border="0" alt="User Guide" /></a></td>');
 response.write('    <td>');
  response.write('      <a href="https://www.youtube.com/channel/UCfHkl7-As8ycrRVbJ3I7Zvg" target="_blank">');
  response.write('        <img id="Button_YouTube" src="' + strFullPath + 'Button_YouTube.png" width="149" height="88" border="0" alt="YouTube" /></a></td>');
 response.write('    <td>');
  response.write('      <a href="button_updates" target="">');
  response.write('        <img id="Button_Updates" src="' + strFullPath + 'Button_Updates.png" width="150" height="88" border="0" alt="Check for software updates" /></a></td>');
 response.write('    <td>');
  response.write('      <a href="http://support.iboxprinters.com" target="_blank">');
  response.write('        <img id="Button_Forums" src="' + strFullPath + 'Button_Forums.png" width="151" height="88" border="0" alt="Forums" /></a></td>');
 response.write('    <td>');
  response.write('      <a href="button_manufandtest" target="">');
  response.write('        <img id="Button_Wiki" src="' + strFullPath + 'Button_ManufAndTest.png" width="149" height="88" border="0" alt="Manufacturing and Test" /></a></td>');
 response.write('    <td>');
  response.write('      <a href="button_settings_advanced" target="">');
  response.write('        <img id="Button_Settings_Advanced" src="' + strFullPath + 'Button_Settings_Advanced.png" width="150" height="88" border="0" alt="Advanced Settings" /></a></td>');
 response.write('</tr>');
 response.write('</table>');
 response.write('</td>');
 response.write('    <td>');
 response.write('      <img id="NanoHID_Tabs_960x88_08" src="' + strFullPath + 'NanoHID_Tabs_960x88_08.png" width="30" height="88" alt="" /></td>');
 response.write('  </tr>');
 response.write('</table>');
 response.write('<!-- End Save for Web Slices -->');

////   END NEW 5/18/2015  /////    Hover_Buttons : End

	/*
  // Settings TABS  ///////////////////////////////////////////////

  response.write('<!-- Save for Web Slices (NanoHID_Tabs_960x88.psd) -->');
  response.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0">');
  response.write('  <tr>');
  response.write('    <td>');
  response.write('      <img id="NanoHID_Tabs_960x88_01" src="' + strFullPath + 'NanoHID_Tabs_960x88_01.png" width="31" height="88" alt="" /></td>');
  response.write('    <td>');
  response.write('      <a href="' + strApacheRootLink + '/help/User_Instruction_Draft_2_5_15.htm" target="_blank">');
  response.write('        <img id="Button_User_Guide" src="' + strFullPath + 'Button_User_Guide.png" width="150" height="88" border="0" alt="User Guide" /></a></td>');
  response.write('    <td>');
  response.write('      <a href="https://www.youtube.com/channel/UCfHkl7-As8ycrRVbJ3I7Zvg" target="_blank">');
  response.write('        <img id="Button_YouTube" src="' + strFullPath + 'Button_YouTube.png" width="149" height="88" border="0" alt="YouTube" /></a></td>');
  response.write('    <td>');
  response.write('      <a href="button_updates" target="">');
  response.write('        <img id="Button_Updates" src="' + strFullPath + 'Button_Updates.png" width="150" height="88" border="0" alt="Check for software updates" /></a></td>');
  response.write('    <td>');
  response.write('      <a href="http://support.iboxprinters.com" target="_blank">');
  response.write('        <img id="Button_Forums" src="' + strFullPath + 'Button_Forums.png" width="151" height="88" border="0" alt="Forums" /></a></td>');
  response.write('    <td>');
  response.write('      <a href="button_manufandtest" target="">');
  response.write('        <img id="Button_Wiki" src="' + strFullPath + 'Button_ManufAndTest.png" width="149" height="88" border="0" alt="Manufacturing and Test" /></a></td>');
  response.write('    <td>');
  response.write('      <a href="button_settings_advanced" target="">');
  response.write('        <img id="Button_Settings_Advanced" src="' + strFullPath + 'Button_Settings_Advanced.png" width="150" height="88" border="0" alt="Advanced Settings" /></a></td>');
  response.write('    <td>');
  response.write('      <img id="NanoHID_Tabs_960x88_08" src="' + strFullPath + 'NanoHID_Tabs_960x88_08.png" width="30" height="88" alt="" /></td>');
  response.write('  </tr>');
  response.write('</table>');
  response.write('<!-- End Save for Web Slices -->');
  */

	/// BODY - Home/Main //////////////////////////////////////////////

	//response.write('<FONT color="#c6c6c6">')
	//response.write('<FONT STYLE="' + strFontStyle + '" SIZE="+1" COLOR="#c6c6c6>');
	//response.write('<FONT SIZE="" COLOR="#c6c6c6>');

	response.write('<!-- Save for Web Slices (NanoHID_Body_Home_960x608.psd) -->');
	response.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0" align="top">');
	/*
	response.write('	<tr>');
	response.write('		<td colspan="6">');
	response.write('			<img id="NanoHID_Body_Home_960x608_01" src="' + strFullPath + 'NanoHID_Body_Home_960x608_0.png" width="960" height="69" alt="" /></td>');
	response.write('	</tr>');
	response.write('	<tr>');
	response.write('		<td rowspan="4">');
	response.write('			<img id="NanoHID_Body_Home_960x608_02" src="' + strFullPath + 'NanoHID_Body_Home_960x60-02.png" width="51" height="539" alt="" /></td>');
	response.write('		<td width="420" height="218" colspan="4" bgcolor="#1B1B1B"><font color="#c6c6c6"><em>iBox Nano Manufacturing and Test. Please look down at your shirt. If it does not say iBox Team on it yu probably shoud not be here!</em><br><br>Please use the links above to get access to the User manual, Quick Start guide, YouTube help videos, our Support Forum, FAQ, and Wiki resources. External content requires an internet connection. iBox Support is handled via support forums where you can find help from iBox Team members and fellow users.<br><br>Sincerely,<br>The iBox Team</font></td>');
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
	//response.write('		<td width="192" height="115" bgcolor="#1B1B1B"><font align="center" color="#c6c6c6"><a href="http://support.iboxprinetrs.com">support.iboxprinetrs.com</a></font></td>');

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
	*/

	//////////////////////////////////////////////////////////////////////////////////////////////////////
	////  Manufacturing and Test ////
	///////////////////////////////////////////////////
	//response.write('<br>');

	////////////////  Contrast START  /////////////////////
	response.write('<table border="0" style="background-color:#1B1B1B;border-collapse:collapse;border:0px solid #FFCC00;color:#FFFFFF;width:960" cellpadding="0" cellspacing="0">');

	strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_on';
	response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
	response.write('<tr>');
	response.write('<td>'); 

		response.write('<input type="submit" value="Turn LEDs on for 60sec @ 100% PWM @ power found in Settings">');
		response.write('</form>');
	response.write('</td>'); 
	response.write('</tr>');

			strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_on_calpwr';
		response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
	response.write('<tr>');
	response.write('<td>'); 

		response.write('<input type="submit" value="Turn LEDs on for 60sec @ Calibrated PWM @ power found in Settings">');
		response.write('</form>');
	response.write('</td>'); 
	response.write('</tr>');

		strURL = 'http://' + strIPAddress + '/set_contrast';	
		response.write('<form name="input" action="' + strURL + '" method="get">');
	response.write('<tr>');////////  ROW Start
	response.write('<td>'); 
		//  Contrast Interface  //

		response.write('Contrast: <input type="text" name="contrast" value="' + myConfig.iLCD_Contrast + '" size="4">');
		response.write('<input type="submit" value="Set Contrast">');
		response.write('</form>');


	response.write('</td>');

	////   incrementing Contrast  ///
		response.write('<td>'); 

		strURL = 'http://' + strIPAddress + '/increment_contrast';	
		response.write('<form name="input" action="' + strURL + '" method="get">');
	response.write('<tr>');////////  ROW Start
	response.write('<td>'); 
		//  Contrast Interface  //
		//iContrast_From_JS = int(iBoxWebGUI.get_iContrastAdjusted())
		iContrast_Local = iContrastAdjusted-100
		console.log('iContrastAdjusted=' + iContrastAdjusted + ' : iContrast_Local=' + iContrast_Local);
		response.write('Contrast: <input type="text" name="contrast" value="' + iContrast_Local + '" size="4">');
		response.write('<input type="submit" value="Increment Contrast">');
		response.write('</form>');


	response.write('</td>');
	////////////////////////////////

			strURL = 'http://' + strIPAddress + '/turn_on_leds';	
		response.write('<form name="input" action="' + strURL + '" method="get">');
	response.write('<td>'); 
		response.write('<input type="submit" value="Turn LEDs ON">');
		response.write('</form>');
	
	response.write('</td>');
		strURL = 'http://' + strIPAddress + '/turn_off_leds';	
		response.write('<form name="input" action="' + strURL + '" method="get">');
	response.write('<td>'); 
		response.write('<input type="submit" value="Turn LEDs OFF">');
		response.write('</form>');
	response.write('</td>');  




	response.write('</tr>');////////  ROW END

		strURL = 'http://' + strIPAddress + '/contrast_screen_clear';
		response.write('<form name="input" action="' + strURL + '" method="get">');
		response.write('<tr>');
	response.write('<td>'); 

		response.write('<input type="submit" value="Clear LCD [transmissive]">');
		response.write('</form>');
	response.write('</td>'); 
	response.write('</tr>');

		strURL = 'http://' + strIPAddress + '/contrast_screen_opaque';
		response.write('<form name="input" action="' + strURL + '" method="get">');
		response.write('<tr>');
	response.write('<td>'); 

		response.write('<input type="submit" value="Black LCD [black]">');
		response.write('</form>');
	response.write('</td>'); 
	response.write('</tr>');

		strURL = 'http://' + strIPAddress + '/contrast_screen_scan';
		response.write('<form name="input" action="' + strURL + '" method="get">');
		response.write('<tr>');
	response.write('<td>'); 

		response.write('<input type="submit" value="Scan Contrast 1-100">');
		response.write('</form>');
	response.write('</td>'); 
	response.write('</tr>');

		strURL = 'http://' + strIPAddress + '/long_term_led_testing_on';
		response.write('<form name="input" action="' + strURL + '" method="get">');
		response.write('<tr>');
	response.write('<td>'); 

		response.write('<input type="submit" value="Start long term LED testing">');
		response.write('</form>');
	response.write('</td>'); 
	response.write('</tr>');


	strURL = 'http://' + strIPAddress + '/set_box_100';
		response.write('<form name="input" action="' + strURL + '" method="get">');
		response.write('<tr>');
	response.write('<td>'); 

		response.write('<input type="submit" value="Set box to 100 PWM">');
		response.write('</form>');
	response.write('</td>'); 
	response.write('</tr>');

	response.write('</table>');
	response.write('<br>');
	response.write('<br>');
	///////////////  Contrast END /////////////////////







/*
strURL = 'http://' + strIPAddress + '/manufacturing_and_test_on';
response.write('<form name="input" action="' + strURL + '" method="get">');
response.write('<input type="submit" value="Turn LEDs on for 60sec 100% PWM at power found in Settings">');
response.write('</form>');
*/

	//response.write('<br>');

	//response.write('<br>');
	/*
	//  Take 2
	response.write('<table border="0" style="background-color:#1B1B1B;border-collapse:collapse;border:0px solid #FFCC00;color:#000000;width:960" cellpadding="0" cellspacing="0">');
	response.write('<tr><td>');
		strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_on';
		response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
		response.write('<input type="submit" value="Manufacturing Mode - ON">');
		response.write('</form>');
	response.write('</td><td>');
		strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_on_calpwr';
		response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
		response.write('<input type="submit" value="Manufacturing Mode - ON - Cal PWR">');
		response.write('</form>');
	response.write('</td></tr><tr><td>');
		strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_calibrate_long';
		response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
		response.write('<input type="submit" value="Manufacturing Mode - CAL: Long">');
		response.write('</form>');
	response.write('</td><td>');
		strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_calibrate_quick';
		response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
		response.write('<input type="submit" value="Manufacturing Mode - CAL: Quick">');
		response.write('</form>');
	response.write('</td></tr><tr><td>');
		strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_calibrate_individual';
		response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
		response.write('<input type="submit" value="Manufacturing Mode - CAL: Individual Method">');
		response.write('</form>');
	response.write('</td><td>');
		strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_calibrate_converge';
		response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
		response.write('<input type="submit" value="Manufacturing Mode - CAL: Converge">');
		response.write('</form>');
	response.write('</td></tr><tr><td>');
		strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_generate_table';
		response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
		response.write('<input type="submit" value="Manufacturing Mode - Generate All Tables">');
		response.write('</form>');
	response.write('</td><td>');
		strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_generate_power';
		response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
		response.write('<input type="submit" value="Manufacturing Mode - Generate Power Table">');
		response.write('</form>');
	response.write('</td></tr>');

	response.write('</table>');

*/

	//response.write('<table border="1" style="background-color:#1B1B1B;border-collapse:collapse;border:0px solid #FFCC00;color:#FFFFFF;width:960" cellpadding="0" cellspacing="0">');
	//response.write('<tr>');
/*
	//		response.write('<td>'); ////////////////  1  ////////////////////////////////////////////////
	strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_on';
	response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
	response.write('<input type="submit" value="Manufacturing Mode - ON">');
	response.write('</form>');
	//		response.write('</td>'); ////////////////  1 END  /////////////////////
	//		response.write('<td>'); ////////////////  2  ////////////////////////////////////////////////
	strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_on_calpwr';
	response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
	response.write('<input type="submit" value="Manufacturing Mode - ON - Cal PWR">');
	response.write('</form>');
	//		response.write('</td>'); ////////////////  2  END /////////////////////
	//		response.write('<td>'); ////////////////  3  ////////////////////////////////////////////////
	strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_calibrate_long';
	response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
	response.write('<input type="submit" value="Manufacturing Mode - CAL: Long">');
	response.write('</form>');
	//		response.write('</td>'); ////////////////  3 END /////////////////////

	//	response.write('</tr>');
	//response.write('</table>');
//response.write('<br>');
///  2  ///
	//response.write('<table border="1" style="background-color:#1B1B1B;border-collapse:collapse;border:0px solid #FFCC00;color:#FFFFFF;width:960" cellpadding="0" cellspacing="0">');
	//	response.write('<tr>');

	//		response.write('<td>'); ////////////////  1  ////////////////////////////////////////////////
	strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_calibrate_quick';
	response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
	response.write('<input type="submit" value="Manufacturing Mode - CAL: Quick">');
	response.write('</form>');
	//		response.write('</td>'); ////////////////  1 END  /////////////////////
	//		response.write('<td>'); ////////////////  2  ////////////////////////////////////////////////
	strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_calibrate_individual';
	response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
	response.write('<input type="submit" value="Manufacturing Mode - CAL: Individual Method">');
	response.write('</form>');
	//		response.write('</td>'); ////////////////  2  END /////////////////////
	//		response.write('<td>'); ////////////////  3  ////////////////////////////////////////////////
	strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_calibrate_converge';
	response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
	response.write('<input type="submit" value="Manufacturing Mode - CAL: Converge">');
	response.write('</form>');
	//		response.write('</td>'); ////////////////  3 END /////////////////////

	//	response.write('</tr>');
	//response.write('</table>');

//response.write('<br>');
//  3  //
	//response.write('<table border="1" style="background-color:#1B1B1B;border-collapse:collapse;border:0px solid #FFCC00;color:#FFFFFF;width:960" cellpadding="0" cellspacing="0">');
	//	response.write('<tr>');

	//		response.write('<td>'); ////////////////  1  ////////////////////////////////////////////////
	strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_generate_table';
	response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
	response.write('<input type="submit" value="Manufacturing Mode - Generate All Tables">');
	response.write('</form>');
	//		response.write('</td>'); ////////////////  1 END  /////////////////////
	//		response.write('<td>'); ////////////////  2  ////////////////////////////////////////////////
	strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_generate_power';
	response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
	response.write('<input type="submit" value="Manufacturing Mode - Generate Power Table">');
	response.write('</form>');
	//		response.write('</td>'); ////////////////  2  END /////////////////////

	//		response.write('<td>'); ////////////////  3  ////////////////////////////////////////////////

	//		response.write('</td>'); ////////////////  3 END /////////////////////

	//	response.write('</tr>');
	//response.write('</table>');
*/

	//response.write('<br>');




		//response.write('<table>');
	response.write('<table border="0" style="background-color:#1B1B1B;border-collapse:collapse;border:0px solid #FFCC00;color:#FFFFFF;width:960" cellpadding="0" cellspacing="0">');


		strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_calibrate_lcd_quick_contrast';
			response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
			response.write('<tr>');
			response.write('<td>'); ////////////////  1  /////////////////////
			response.write('<input type="submit" value="Manufacturing Mode - Find Best LCD Setting">');
			response.write('</td>'); ////////////////  1 END  /////////////////////
			response.write('<td>'); ////////////////  2  /////////////////////

			response.write(' IP Address: <select name="ip_address">');
			strSelected = " selected"
			srrIP_MnT = srrIP_MnT_default
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			strSelected = ""
			srrIP_MnT = '192.168.1.120'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.19'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.140'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.150'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.160'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.170'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');

      		/// Option End ////
      		response.write('</select>');
      		response.write('</form>');
			response.write('</td>'); ////////////////  2  END /////////////////////
			response.write('<td>'); ////////////////  3  /////////////////////
			response.write('</td>'); ////////////////  3 END /////////////////////
			response.write('</tr>');  

			////////////////////////  S T A R T ///////////////////////////////////////////////////////////////////////////
		strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_calibrate_long';
		response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');

			response.write('<tr>');
			response.write('<td>'); ////////////////  1  /////////////////////
		response.write('<input type="submit" value="Manufacturing Mode - CAL: Long">');
			response.write('</td>'); ////////////////  1 END  /////////////////////
			response.write('<td>'); ////////////////  2  /////////////////////

			response.write(' IP Address: <select name="ip_address">');
			strSelected = " selected"
			srrIP_MnT = srrIP_MnT_default
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			strSelected = ""
			srrIP_MnT = '192.168.1.120'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.19'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.140'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.150'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.160'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.170'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');

      		/// Option End ////
      		response.write('</select>');
      		response.write('</form>');
			response.write('</td>'); ////////////////  2  END /////////////////////
			response.write('<td>'); ////////////////  3  /////////////////////
			response.write('</td>'); ////////////////  3 END /////////////////////
			response.write('</tr>');  
			///////////////////////////////////////////////////////////////////////////EEEEEENNNNNNNNDDDDDDD
						////////////////////////  S T A R T ///////////////////////////////////////////////////////////////////////////
		strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_calibrate_quick';
		response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');

			response.write('<tr>');
			response.write('<td>'); ////////////////  1  /////////////////////
		response.write('<input type="submit" value="Manufacturing Mode - CAL: Quick">');
			response.write('</td>'); ////////////////  1 END  /////////////////////
			response.write('<td>'); ////////////////  2  /////////////////////

			response.write(' IP Address: <select name="ip_address">');
			strSelected = " selected"
			srrIP_MnT = srrIP_MnT_default
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			strSelected = ""
			srrIP_MnT = '192.168.1.120'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.19'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.140'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.150'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.160'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.170'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');

      		/// Option End ////
      		response.write('</select>');
      		response.write('</form>');
			response.write('</td>'); ////////////////  2  END /////////////////////
			response.write('<td>'); ////////////////  3  /////////////////////
			response.write('</td>'); ////////////////  3 END /////////////////////
			response.write('</tr>');  
			///////////////////////////////////////////////////////////////////////////EEEEEENNNNNNNNDDDDDDD
						////////////////////////  S T A R T ///////////////////////////////////////////////////////////////////////////
		strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_calibrate_individual';
		response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');

			response.write('<tr>');
			response.write('<td>'); ////////////////  1  /////////////////////
		response.write('<input type="submit" value="Manufacturing Mode - CAL: Individual Method">');
			response.write('</td>'); ////////////////  1 END  /////////////////////
			response.write('<td>'); ////////////////  2  /////////////////////


			response.write(' IP Address: <select name="ip_address">');
			strSelected = " selected"
			srrIP_MnT = srrIP_MnT_default
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			strSelected = ""
			srrIP_MnT = '192.168.1.120'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.19'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.140'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.150'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.160'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.170'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');

      		/// Option End ////
      		response.write('</select>');
      		response.write('</form>');
			response.write('</td>'); ////////////////  2  END /////////////////////
			response.write('<td>'); ////////////////  3  /////////////////////
			response.write('</td>'); ////////////////  3 END /////////////////////
			response.write('</tr>');  
			///////////////////////////////////////////////////////////////////////////EEEEEENNNNNNNNDDDDDDD
						////////////////////////  S T A R T ///////////////////////////////////////////////////////////////////////////
		strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_calibrate_converge';
		response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');

			response.write('<tr>');
			response.write('<td>'); ////////////////  1  /////////////////////
		response.write('<input type="submit" value="Manufacturing Mode - CAL: Converge">');
			response.write('</td>'); ////////////////  1 END  /////////////////////
			response.write('<td>'); ////////////////  2  /////////////////////

			response.write(' IP Address: <select name="ip_address">');
			strSelected = " selected"
			srrIP_MnT = srrIP_MnT_default
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			strSelected = ""
			srrIP_MnT = '192.168.1.120'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.19'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.140'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.150'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.160'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.170'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');


      		/// Option End ////
      		response.write('</select>');
      		response.write('</form>');
			response.write('</td>'); ////////////////  2  END /////////////////////
			response.write('<td>'); ////////////////  3  /////////////////////
			response.write('</td>'); ////////////////  3 END /////////////////////
			response.write('</tr>');  
			///////////////////////////////////////////////////////////////////////////EEEEEENNNNNNNNDDDDDDD
						////////////////////////  S T A R T ///////////////////////////////////////////////////////////////////////////
		strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_generate_table';
		response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');

			response.write('<tr>');
			response.write('<td>'); ////////////////  1  /////////////////////
		response.write('<input type="submit" value="Manufacturing Mode - Generate All Tables">');
			response.write('</td>'); ////////////////  1 END  /////////////////////
			response.write('<td>'); ////////////////  2  /////////////////////

			response.write(' IP Address: <select name="ip_address">');
			strSelected = " selected"
			srrIP_MnT = srrIP_MnT_default
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			strSelected = ""
			srrIP_MnT = '192.168.1.120'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.19'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.140'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.150'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.160'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.170'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');

      		/// Option End ////
      		response.write('</select>');
      		response.write('</form>');
			response.write('</td>'); ////////////////  2  END /////////////////////
			response.write('<td>'); ////////////////  3  /////////////////////
			response.write('</td>'); ////////////////  3 END /////////////////////
			response.write('</tr>');  
			///////////////////////////////////////////////////////////////////////////EEEEEENNNNNNNNDDDDDDD
						////////////////////////  S T A R T ///////////////////////////////////////////////////////////////////////////
		strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_generate_power';
		response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');

			response.write('<tr>');
			response.write('<td>'); ////////////////  1  /////////////////////
		response.write('<input type="submit" value="Manufacturing Mode - Generate Power Table">');
			response.write('</td>'); ////////////////  1 END  /////////////////////
			response.write('<td>'); ////////////////  2  /////////////////////

			response.write(' IP Address: <select name="ip_address">');
			strSelected = " selected"
			srrIP_MnT = srrIP_MnT_default
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			strSelected = ""
			srrIP_MnT = '192.168.1.120'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.19'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.140'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.150'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.160'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.170'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');

      		/// Option End ////
      		response.write('</select>');
      		response.write('</form>');
			response.write('</td>'); ////////////////  2  END /////////////////////
			response.write('<td>'); ////////////////  3  /////////////////////
			response.write('</td>'); ////////////////  3 END /////////////////////
			response.write('</tr>');  
			///////////////////////////////////////////////////////////////////////////EEEEEENNNNNNNNDDDDDDD

			//  last new of 6

			////////////////////////  S T A R T ///////////////////////////////////////////////////////////////////////////
			strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_calibrate_percent_avg';
			response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
			response.write('<tr>');
			response.write('<td>'); ////////////////  1  /////////////////////
			response.write('<input type="submit" value="Manufacturing Mode - Calculate PWM using Percentage">');
			response.write('</td>'); ////////////////  1 END  /////////////////////
			response.write('<td>'); ////////////////  2  /////////////////////

			response.write(' IP Address: <select name="ip_address">');
			strSelected = " selected"
			srrIP_MnT = srrIP_MnT_default
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			strSelected = ""
			srrIP_MnT = '192.168.1.120'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.19'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.140'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.150'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.160'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.170'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');

      		/// Option End ////
      		response.write('</select>');
      		response.write('</form>');
			response.write('</td>'); ////////////////  2  END /////////////////////
			response.write('<td>'); ////////////////  3  /////////////////////
			response.write('</td>'); ////////////////  3 END /////////////////////
			response.write('</tr>');  
			///////////////////////////////////////////////////////////////////////////EEEEEENNNNNNNNDDDDDDD


	//response.write('</table>');

	
	



	strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_calibrate_percent_adjust';
	response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');

	//response.write('<table>');
	//response.write('<table border="0" style="background-color:#1B1B1B;border-collapse:collapse;border:0px solid #FFCC00;color:#FFFFFF;width:960" cellpadding="0" cellspacing="0">');
		response.write('<tr>');

			response.write('<td>'); ////////////////  1  /////////////////////

			response.write('<input type="submit" value="Manufacturing Mode - PWM using Add/Subt N PWM per Z uV">');

			response.write('</td>'); ////////////////  1 END  /////////////////////

			response.write('<td>'); ////////////////  2  /////////////////////

			response.write(' IP Address: <select name="ip_address">');
			strSelected = " selected"
			srrIP_MnT = srrIP_MnT_default
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			strSelected = ""
			srrIP_MnT = '192.168.1.120'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.19'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.140'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.150'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.160'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');
			srrIP_MnT = '192.168.1.170'
			response.write('  <option value=' + srrIP_MnT + '' + strSelected + '>' + srrIP_MnT + '</option>');

      /// Option End ////
      response.write('</select>');

			response.write('</td>'); ////////////////  2  END /////////////////////

			response.write('<td>'); ////////////////  3  /////////////////////

			      response.write(' Calibration Iterations: <select name="calibration_iterations">');
			      for(var i=0; i<20 ;i++){
			      	iKeyVal = 1;  //  Default
			        if(iKeyVal == i) {
			          response.write('  <option value="' + i + '" selected>' + i + '</option>');
			        }else{
			          response.write('  <option value="' + i + '">' + i + '</option>');
			        }
			      }
			      response.write('</select>');
			      response.write('</form>');
			      //1response.write(' Iterations');

			response.write('</td>'); ////////////////  3 END /////////////////////

		response.write('</tr>');
	response.write('</table>');

	



    //response.write('<br>');
    //response.write('<br> 0=Off : 1= UAP@Full_PWR : 2=UAP@OEM Cal PWR : 3=UAP@Equalized PWR : 4=UAP+AdjacentLED@OEM Cal PWR : 5=UAP+AdjacentLED@Full_PWR :: Key: UAP=Under Active Pixel'); 
    





	response.write('<br>');
	response.write('<br>');
	/*
	strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_off';
	response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
	response.write('<input type="submit" value="Manufacturing Mode - OFF">');
	response.write('</form>');
	response.write('<br>');
	*/



	fsSystem_Load();
	fsConfig_Load();
	fsCalibration_Load();
	response.write('<div id="nav">');
	response.write("</FONT>");
	response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">');
	strURL_Config_Submit = 'http://' + strIPAddress + '/submit_config';
	var fPercent_Deviation = 0.0;
	var fAverage = 0.0;
	var fSum = 0.0;
	var fMin = 0.0;
	var fMax = 0.0;
	//response.write('<form name="input" action="' + strURL_Config_Submit + '" method="get">');
	Object.keys(myConfig).forEach(function (key) {
		if(key == "iOEM_Calibrated_UV_LED_PWM") {
			response.write('Current Profile : UV-LED PWM Values : [0=Off : 100=Full Brightness]<br><input size="118" type="text" name="' + key + '" value="' + myConfig[key] + '">');

			  //response.write('<br>Use the table below to visualize the LEDs. LED 1=bottom right. LED 28=top left');        
				  
			////////////////// --- Table for calibration values for array: Notes:
			//  1. Center Pixels will be brighter than outer ones due to 15degree spread combination, thus coresponding inner LEDs ones will need to be "dimmed", reducing power on overexposed pixels
			//  2. Pixels at the rear of the screen are more transmissive than at the front due to LCD angle vs transmissiveness. Rear = 100% : center = 90% : front = 50% in refrence to radiation received at 45deg to pixel. See notes E7 in notebook 70s show
			//  1. Split iOEM_Calibrated_UV_LED_PWM to array/list
			response.write('<br>-----  Top View of LED array i.e. The closest row to this text is the back of the machine ----')
			var arrayOEM_Calibrated_UV_LED_PWM = String(myConfig[key]).split(',');
			response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">');
			response.write(' Avg= ' + Math.round(average_all_uvleds( arrayOEM_Calibrated_UV_LED_PWM )*10)/10 + ' PWM<br>')
			response.write('</FONT>');
			for (var i = 0; i <arrayOEM_Calibrated_UV_LED_PWM.length; i++) {
				arrayOEM_Calibrated_UV_LED_PWM[i] = Math.round(arrayOEM_Calibrated_UV_LED_PWM[i])//  Round to an integer
			}

			//  Options:
			//rgbify(maxval, minval, val, moreisgood) :: rgbify(fMax, fMin, fPercent_Deviation, false)
			//getGreenToRed(fPercent_Deviation) :: getGreenToRed(fPercent_Deviation)

			response.write('<table border="1" style="background-color:#000000;border-collapse:collapse;border:1px solid #0000FF;color:#FFFFFF;width:800" cellpadding="3" cellspacing="3" >')
			// 1  //
			response.write('<tr>')
			for (var i = 27; i >27-7; i--) {
				//console.log('fPercent_Deviation[' + fPercent_Deviation + '] = (int(arrayOEM_Calibrated_UV_LED_PWM[' + i + ']{' + arrayOEM_Calibrated_UV_LED_PWM[i] + '})/fAverage[' + fAverage + ']')
				response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
			}
			response.write('</tr>')
			//  2  //
			response.write('<tr>')
			for (var i = 27-7; i >27-7-7; i--) {
				//response.write('<td bgcolor="' + rgbify(fMax, fMin, fPercent_Deviation, true) + '" align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
			}
			response.write('</tr>')
			//  3  //
			  response.write('<tr>')
			for (var i = 27-7-7; i >27-7-7-7; i--) {
				///response.write('<td bgcolor="' + rgbify(fMax, fMin, fPercent_Deviation, true) + '" align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
			}
			response.write('</tr>')
			//  4  //
			response.write('<tr>')
			for (var i = 27-7-7-7; i >27-7-7-7-7; i--) {
				//response.write('<td bgcolor="' + rgbify(fMax, fMin, fPercent_Deviation, true) + '" align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
			}
			response.write('</tr>')
			//  Three more copies here
			response.write('</table>')
			response.write('<br>');
			//response.write('--------------------  Front of machine --------------------')
		}
	});
	response.write('</FONT>');

	//////////////////////////////////////////////////////////////////////////////////////////////////////
	////  Calibration Initial ////
	///////////////////////////////////////////////////
	response.write('<br>');
	response.write('<br>');
	response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#FFFF00">');
	Object.keys(myCalibration).forEach(function (key) {
	// ----------------- Pasted from showSettings --- BASIC ----- >>  START
		if(key == "iOEM_Calibrated_UV_LED_PWM") {
			response.write('Initial Calibration : UV-LED PWM Values : [0=Off : 100=Full Brightness]<br><input size="118" type="text" name="' + key + '" value="' + myCalibration[key] + '">');

			  //response.write('<br>Use the table below to visualize the LEDs. LED 1=bottom right. LED 28=top left');        
				  
			////////////////// --- Table for calibration values for array: Notes:
			//  1. Center Pixels will be brighter than outer ones due to 15degree spread combination, thus coresponding inner LEDs ones will need to be "dimmed", reducing power on overexposed pixels
			//  2. Pixels at the rear of the screen are more transmissive than at the front due to LCD angle vs transmissiveness. Rear = 100% : center = 90% : front = 50% in refrence to radiation received at 45deg to pixel. See notes E7 in notebook 70s show
			//  1. Split iOEM_Calibrated_UV_LED_PWM to array/list
			//response.write('<br>-----  Top View of LED array i.e. The closest row to this text is the back of the machine ----')
			var arrayOEM_Calibrated_UV_LED_PWM = String(myCalibration[key]).split(',');
			response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">');
			response.write(' Avg= ' + Math.round(average_all_uvleds( arrayOEM_Calibrated_UV_LED_PWM )*10)/10 + ' PWM<br>')
			response.write('</FONT>');
			for (var i = 0; i <arrayOEM_Calibrated_UV_LED_PWM.length; i++) {
				arrayOEM_Calibrated_UV_LED_PWM[i] = Math.round(arrayOEM_Calibrated_UV_LED_PWM[i])//  Round to an integer
			}

			response.write('<table border="1" style="background-color:#000000;border-collapse:collapse;border:1px solid #0000FF;color:#FFFFFF;width:800" cellpadding="3" cellspacing="3" >')
			// 1  //
			response.write('<tr>')
			for (var i = 27; i >27-7; i--) {
				response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
			}
			response.write('</tr>')
			//  2  //
			response.write('<tr>')
			for (var i = 27-7; i >27-7-7; i--) {
				response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
			}
			response.write('</tr>')
			//  3  //
			  response.write('<tr>')
			for (var i = 27-7-7; i >27-7-7-7; i--) {
				response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
			}
			response.write('</tr>')
			//  4  //
			response.write('<tr>')
			for (var i = 27-7-7-7; i >27-7-7-7-7; i--) {
				response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
			}
			response.write('</tr>')
			//  Three more copies here
			response.write('</table>')
			response.write('<br>');
			//response.write('--------------------  Front of machine --------------------')
		}
	});
	response.write('</FONT>');

	//////////////////////////////////////////////////////////////////////////////////////////////////////
	////  OEM Calibration at 9mA - Data in mV * 100 - Pre-Calibrtion ////
	///////////////////////////////////////////////////
	response.write('<br>');
	response.write('<br>');
	response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#FF0000">');
	Object.keys(myCalibration).forEach(function (key) {
	// ----------------- Pasted from showSettings --- BASIC ----- >>  START
		if(key == "iOEM_Calibrated_UV_LED_uV_at_9mA_Pre_Cal") {
			response.write('Millivolts : UV-LED mV @ 9mA * 100 : Pre-Cal<br><input size="118" type="text" name="' + key + '" value="' + myCalibration[key] + '">');

			  //response.write('<br>Use the table below to visualize the LEDs. LED 1=bottom right. LED 28=top left');        
				  
			////////////////// --- Table for calibration values for array: Notes:
			//  1. Center Pixels will be brighter than outer ones due to 15degree spread combination, thus coresponding inner LEDs ones will need to be "dimmed", reducing power on overexposed pixels
			//  2. Pixels at the rear of the screen are more transmissive than at the front due to LCD angle vs transmissiveness. Rear = 100% : center = 90% : front = 50% in refrence to radiation received at 45deg to pixel. See notes E7 in notebook 70s show
			//  1. Split iOEM_Calibrated_UV_LED_PWM to array/list
			//response.write('<br>-----  Top View of LED array i.e. The closest row to this text is the back of the machine ----')
			var arrayOEM_Calibrated_UV_LED_PWM = String(myCalibration[key]).split(',');
			response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">');
			response.write(' Avg= ' + Math.round(average_all_uvleds( arrayOEM_Calibrated_UV_LED_PWM )*10)/10 + ' uV<br>')
			response.write('</FONT>');
			for (var i = 0; i <arrayOEM_Calibrated_UV_LED_PWM.length; i++) {
				//  6/17/2015
				//arrayOEM_Calibrated_UV_LED_PWM[i] = Math.round(arrayOEM_Calibrated_UV_LED_PWM[i])//  Round to an integer
			}
			response.write('<table border="1" style="background-color:#000000;border-collapse:collapse;border:1px solid #0000FF;color:#FFFFFF;width:800" cellpadding="3" cellspacing="3" >')
			// 1  //
			response.write('<tr>')
			for (var i = 27; i >27-7; i--) {
				response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
			}
			response.write('</tr>')
			//  2  //
			response.write('<tr>')
			for (var i = 27-7; i >27-7-7; i--) {
				response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
			}
			response.write('</tr>')
			//  3  //
			  response.write('<tr>')
			for (var i = 27-7-7; i >27-7-7-7; i--) {
				response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
			}
			response.write('</tr>')
			//  4  //
			response.write('<tr>')
			for (var i = 27-7-7-7; i >27-7-7-7-7; i--) {
				response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
			}
			response.write('</tr>')
			//  Three more copies here
			response.write('</table>')
			response.write('<br>');
			//response.write('--------------------  Front of machine --------------------')
		}
	});
	response.write('</FONT>');

	//////////////////////////////////////////////////////////////////////////////////////////////////////
	////  OEM Calibration at 9mA - Data in mV * 100 - Post-Calibrtion ////
	///////////////////////////////////////////////////
	response.write('<br>');
	response.write('<br>');
	response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#FFFFFF">');
	Object.keys(myCalibration).forEach(function (key) {
	// ----------------- Pasted from showSettings --- BASIC ----- >>  START
		if(key == "iOEM_Calibrated_UV_LED_uV_at_9mA_Post_Cal") {
			response.write('Millivolts : UV-LED mV @ 9mA * 100 : Post-Cal <br><input size="118" type="text" name="' + key + '" value="' + myCalibration[key] + '">');

			  //response.write('<br>Use the table below to visualize the LEDs. LED 1=bottom right. LED 28=top left');        
				  
			////////////////// --- Table for calibration values for array: Notes:
			//  1. Center Pixels will be brighter than outer ones due to 15degree spread combination, thus coresponding inner LEDs ones will need to be "dimmed", reducing power on overexposed pixels
			//  2. Pixels at the rear of the screen are more transmissive than at the front due to LCD angle vs transmissiveness. Rear = 100% : center = 90% : front = 50% in refrence to radiation received at 45deg to pixel. See notes E7 in notebook 70s show
			//  1. Split iOEM_Calibrated_UV_LED_PWM to array/list
			//response.write('<br>-----  Top View of LED array i.e. The closest row to this text is the back of the machine ----')
			var arrayOEM_Calibrated_UV_LED_PWM = String(myCalibration[key]).split(',');
			response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">');
			response.write(' Avg= ' + Math.round(average_all_uvleds( arrayOEM_Calibrated_UV_LED_PWM )*10)/10 + ' uV<br>')
			response.write('</FONT>');
			for (var i = 0; i <arrayOEM_Calibrated_UV_LED_PWM.length; i++) {
				//  6/17/15 increasing display resolution
				//arrayOEM_Calibrated_UV_LED_PWM[i] = Math.round(arrayOEM_Calibrated_UV_LED_PWM[i])//  Round to an integer
			}
			////////////////////////  Find Average  //
			fSum = 0.0;
			fMax = 0.0;
			fMin = 10000.0;
			for(var y=0; y<arrayOEM_Calibrated_UV_LED_PWM.length; y++) {
				fSum = fSum + int(arrayOEM_Calibrated_UV_LED_PWM[y]);
				if(int(arrayOEM_Calibrated_UV_LED_PWM[y]) > fMax) fMax = int(arrayOEM_Calibrated_UV_LED_PWM[y]);
				if(int(arrayOEM_Calibrated_UV_LED_PWM[y]) < fMin) fMin = int(arrayOEM_Calibrated_UV_LED_PWM[y]);
				//console.log(y + ') fSum=[' + fSum + '] : int(arrayOEM_Calibrated_UV_LED_PWM[y]=[' + int(arrayOEM_Calibrated_UV_LED_PWM[y]) + ']')
			}
			fAverage = fSum / int(arrayOEM_Calibrated_UV_LED_PWM.length);
			/////////////////////////////////////////////////////////////////////
			response.write('<table border="1" style="background-color:#000000;border-collapse:collapse;border:1px solid #0000FF;color:#FFFFFF;width:800" cellpadding="3" cellspacing="3" >')
			// 1  //
			response.write('<tr>')
			for (var i = 27; i >27-7; i--) {
				fPercent_Deviation = (int(arrayOEM_Calibrated_UV_LED_PWM[i])/fAverage)*100.0
				response.write('<td bgcolor="' + getGreenToRed(fPercent_Deviation) + '" align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				///fPercent_Deviation = (int(arrayOEM_Calibrated_UV_LED_PWM[i])/fAverage)*100.0
				//response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				///response.write('<td bgcolor="' + rgbify(fMax, fMin, fPercent_Deviation, true) + '" align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
			}
			response.write('</tr>')
			//  2  //
			response.write('<tr>')
			for (var i = 27-7; i >27-7-7; i--) {
				fPercent_Deviation = (int(arrayOEM_Calibrated_UV_LED_PWM[i])/fAverage)*100.0
				response.write('<td bgcolor="' + getGreenToRed(fPercent_Deviation) + '" align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				///fPercent_Deviation = (int(arrayOEM_Calibrated_UV_LED_PWM[i])/fAverage)*100.0
				//response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				///response.write('<td bgcolor="' + rgbify(fMax, fMin, fPercent_Deviation, true) + '" align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
			}
			response.write('</tr>')
			//  3  //
			  response.write('<tr>')
			for (var i = 27-7-7; i >27-7-7-7; i--) {
				fPercent_Deviation = (int(arrayOEM_Calibrated_UV_LED_PWM[i])/fAverage)*100.0
				response.write('<td bgcolor="' + getGreenToRed(fPercent_Deviation) + '" align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				///fPercent_Deviation = (int(arrayOEM_Calibrated_UV_LED_PWM[i])/fAverage)*100.0
				//response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				///response.write('<td bgcolor="' + rgbify(fMax, fMin, fPercent_Deviation, true) + '" align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
			}
			response.write('</tr>')
			//  4  //
			response.write('<tr>')
			for (var i = 27-7-7-7; i >27-7-7-7-7; i--) {
				fPercent_Deviation = (int(arrayOEM_Calibrated_UV_LED_PWM[i])/fAverage)*100.0
				response.write('<td bgcolor="' + getGreenToRed(fPercent_Deviation) + '" align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				///fPercent_Deviation = (int(arrayOEM_Calibrated_UV_LED_PWM[i])/fAverage)*100.0
				//response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				///response.write('<td bgcolor="' + rgbify(fMax, fMin, fPercent_Deviation, true) + '" align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
			}
			response.write('</tr>')
			//  Three more copies here
			response.write('</table>')
			response.write('<br>');
			//response.write('--------------------  Front of machine --------------------')
		}
		
	});
	response.write('</FONT>');
	//////////////////////////////////////////////////////////////////////////////////////////////////////
	////  Individual LEDs @ 9mA - Pre Calibration ////
	///////////////////////////////////////////////////
	response.write('<br>');
	response.write('<br>');
	response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#33FF33">');
	Object.keys(myCalibration).forEach(function (key) {
	// ----------------- Pasted from showSettings --- BASIC ----- >>  START
		if(key == "iOEM_Calibrated_UV_LED_uV_at_9mA_Pre_Individual") {
			response.write('Individual LEDs @ 9mA - Pre Calibration<br><input size="118" type="text" name="' + key + '" value="' + myCalibration[key] + '">');

			  //response.write('<br>Use the table below to visualize the LEDs. LED 1=bottom right. LED 28=top left');        
				  
			////////////////// --- Table for calibration values for array: Notes:
			//  1. Center Pixels will be brighter than outer ones due to 15degree spread combination, thus coresponding inner LEDs ones will need to be "dimmed", reducing power on overexposed pixels
			//  2. Pixels at the rear of the screen are more transmissive than at the front due to LCD angle vs transmissiveness. Rear = 100% : center = 90% : front = 50% in refrence to radiation received at 45deg to pixel. See notes E7 in notebook 70s show
			//  1. Split iOEM_Calibrated_UV_LED_PWM to array/list
			//response.write('<br>-----  Top View of LED array i.e. The closest row to this text is the back of the machine ----')
			var arrayOEM_Calibrated_UV_LED_PWM = String(myCalibration[key]).split(',');
			response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">');
			response.write(' Avg= ' + Math.round(average_all_uvleds( arrayOEM_Calibrated_UV_LED_PWM )*10)/10 + ' uV<br>')
			response.write('</FONT>');
			for (var i = 0; i <arrayOEM_Calibrated_UV_LED_PWM.length; i++) {
				arrayOEM_Calibrated_UV_LED_PWM[i] = Math.round(arrayOEM_Calibrated_UV_LED_PWM[i])//  Round to an integer
			}
			response.write('<table border="1" style="background-color:#000000;border-collapse:collapse;border:1px solid #0000FF;color:#FFFFFF;width:800" cellpadding="3" cellspacing="3" >')
			// 1  //
			response.write('<tr>')
			for (var i = 27; i >27-7; i--) {
				response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
			}
			response.write('</tr>')
			//  2  //
			response.write('<tr>')
			for (var i = 27-7; i >27-7-7; i--) {
				response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
			}
			response.write('</tr>')
			//  3  //
			  response.write('<tr>')
			for (var i = 27-7-7; i >27-7-7-7; i--) {
				response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
			}
			response.write('</tr>')
			//  4  //
			response.write('<tr>')
			for (var i = 27-7-7-7; i >27-7-7-7-7; i--) {
				response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
			}
			response.write('</tr>')
			//  Three more copies here
			response.write('</table>')
			response.write('<br>');
			//response.write('--------------------  Front of machine --------------------')
		}
		
	});
	response.write('</FONT>');
	//////////////////////////////////////////////////////////////////////////////////////////////////////
	////  Individual LEDs balanced via PWM ////
	///////////////////////////////////////////////////
	response.write('<br>');
	response.write('<br>');
	response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#FF0000">');
	Object.keys(myCalibration).forEach(function (key) {
	// ----------------- Pasted from showSettings --- BASIC ----- >>  START
		if(key == "iOEM_Calibrated_UV_LED_PWM_Measured_Individualy") {
			response.write('Individual LEDs Balanced via PWM<br><input size="118" type="text" name="' + key + '" value="' + myCalibration[key] + '">');

			  //response.write('<br>Use the table below to visualize the LEDs. LED 1=bottom right. LED 28=top left');        
				  
			////////////////// --- Table for calibration values for array: Notes:
			//  1. Center Pixels will be brighter than outer ones due to 15degree spread combination, thus coresponding inner LEDs ones will need to be "dimmed", reducing power on overexposed pixels
			//  2. Pixels at the rear of the screen are more transmissive than at the front due to LCD angle vs transmissiveness. Rear = 100% : center = 90% : front = 50% in refrence to radiation received at 45deg to pixel. See notes E7 in notebook 70s show
			//  1. Split iOEM_Calibrated_UV_LED_PWM to array/list
			//response.write('<br>-----  Top View of LED array i.e. The closest row to this text is the back of the machine ----')
			var arrayOEM_Calibrated_UV_LED_PWM = String(myCalibration[key]).split(',');
			response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">');
			response.write(' Avg= ' + Math.round(average_all_uvleds( arrayOEM_Calibrated_UV_LED_PWM )*10)/10 + ' uW/cm^2<br>')
			response.write('</FONT>');
			for (var i = 0; i <arrayOEM_Calibrated_UV_LED_PWM.length; i++) {
				arrayOEM_Calibrated_UV_LED_PWM[i] = Math.round(arrayOEM_Calibrated_UV_LED_PWM[i])//  Round to an integer
			}
			response.write('<table border="1" style="background-color:#000000;border-collapse:collapse;border:1px solid #0000FF;color:#FFFFFF;width:800" cellpadding="3" cellspacing="3" >')
			// 1  //
			response.write('<tr>')
			for (var i = 27; i >27-7; i--) {
				response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
			}
			response.write('</tr>')
			//  2  //
			response.write('<tr>')
			for (var i = 27-7; i >27-7-7; i--) {
				response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
			}
			response.write('</tr>')
			//  3  //
			  response.write('<tr>')
			for (var i = 27-7-7; i >27-7-7-7; i--) {
				response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
			}
			response.write('</tr>')
			//  4  //
			response.write('<tr>')
			for (var i = 27-7-7-7; i >27-7-7-7-7; i--) {
				response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
				//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
			}
			response.write('</tr>')
			//  Three more copies here
			response.write('</table>')
			response.write('<br>');
			//response.write('--------------------  Front of machine --------------------')
		}
	});
	response.write('</FONT>');



	//////////////////////////////////////////////////////////////////////////////////////////////////////
	////  OEM Calibration uW @ X mA
	///////////////////////////////////////////////////
	response.write('<br>');
	response.write('<br>');
	
	Object.keys(myCalibration).forEach(function (key) {
		for(var n=0; n<14; n++) {
			
			iMilliamps = n+6
			strKeyVal = "uW_at_" + iMilliamps
			
			if(key == strKeyVal) {
				//console.log(n + ') strKeyVal=[' + strKeyVal + ']')
				response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00FF00">');
				//response.write('uW/cm^2 @ ' + iMilliamps +  ' : UV-LED mW @ ' + iMilliamps + 'mA : Post-Cal<br>');
				response.write('UV-LED : uW/cm^2 @ <b>' + iMilliamps +  ' mA</b> : Post-Cal<br>');
				response.write('</FONT>');
				var arrayOEM_Calibrated_UV_LED_PWM = String(myCalibration[key]).split(',');
				for (var i = 0; i <arrayOEM_Calibrated_UV_LED_PWM.length; i++) {
					arrayOEM_Calibrated_UV_LED_PWM[i] = Math.round(arrayOEM_Calibrated_UV_LED_PWM[i])//  Round to an integer
				}
				fAverage_uW = average_all_uvleds( arrayOEM_Calibrated_UV_LED_PWM );
				fDose = int(fAverage_uW * myConfig.iExposure_Time);
				response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">');
				response.write('UV-LED Avg= ' + Math.round(fAverage_uW*10)/10 + ' uW/cm^2 : Dose= ' + fDose + ' uJ/cm^2 @ ' + myConfig.iExposure_Time + ' sec exposure<br>')
				response.write('</FONT>');
				response.write('<input size="118" type="text" name="' + key + '" value="' + myCalibration[key] + '">');
				

				response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#10FF10">');
				  //response.write('<br>Use the table below to visualize the LEDs. LED 1=bottom right. LED 28=top left');        
					  
				////////////////// --- Table for calibration values for array: Notes:
				//  1. Center Pixels will be brighter than outer ones due to 15degree spread combination, thus coresponding inner LEDs ones will need to be "dimmed", reducing power on overexposed pixels
				//  2. Pixels at the rear of the screen are more transmissive than at the front due to LCD angle vs transmissiveness. Rear = 100% : center = 90% : front = 50% in refrence to radiation received at 45deg to pixel. See notes E7 in notebook 70s show
				//  1. Split iOEM_Calibrated_UV_LED_PWM to array/list
				//response.write('<br>-----  Top View of LED array i.e. The closest row to this text is the back of the machine ----')
				
				response.write('<table border="1" style="background-color:#000000;border-collapse:collapse;border:1px solid #0000FF;color:#FFFFFF;width:800" cellpadding="3" cellspacing="3" >')
				// 1  //
				response.write('<tr>')
				for (var i = 27; i >27-7; i--) {
					fPercent_Deviation = (int(arrayOEM_Calibrated_UV_LED_PWM[i])/fAverage)*100.0
					response.write('<td bgcolor="' + getGreenToRed(fPercent_Deviation) + '" align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
					//response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
					//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
				}
				response.write('</tr>')
				//  2  //
				response.write('<tr>')
				for (var i = 27-7; i >27-7-7; i--) {
					fPercent_Deviation = (int(arrayOEM_Calibrated_UV_LED_PWM[i])/fAverage)*100.0
					response.write('<td bgcolor="' + getGreenToRed(fPercent_Deviation) + '" align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
					//response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
					//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
				}
				response.write('</tr>')
				//  3  //
				  response.write('<tr>')
				for (var i = 27-7-7; i >27-7-7-7; i--) {
					fPercent_Deviation = (int(arrayOEM_Calibrated_UV_LED_PWM[i])/fAverage)*100.0
					response.write('<td bgcolor="' + getGreenToRed(fPercent_Deviation) + '" align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
					//response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
					//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
				}
				response.write('</tr>')
				//  4  //
				response.write('<tr>')
				for (var i = 27-7-7-7; i >27-7-7-7-7; i--) {
					fPercent_Deviation = (int(arrayOEM_Calibrated_UV_LED_PWM[i])/fAverage)*100.0
					response.write('<td bgcolor="' + getGreenToRed(fPercent_Deviation) + '" align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
					//response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
					//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
				}
				response.write('</tr>')
				//  Bottom of table text here  //

				response.write('</FONT>');
				response.write('</table>')
				
				response.write('<br>');
				//response.write('--------------------  Front of machine --------------------')
			}
			
		}
	});
	response.write('</FONT>');
	response.write('<br><br>--------------------  <<<<<  DOSE  >>>>>   --------------------')
	///////////////////////////////////////////////////////////////////////////////////////////////  DOSE Table -> START
	//////////////////////////////////////////////////////////////////////////////////////////////////////
	////  Dose uJ/cm^2 
	///////////////////////////////////////////////////
	response.write('<br>');
	response.write('<br>');
	
	Object.keys(myCalibration).forEach(function (key) {
		for(var n=0; n<14; n++) {
			
			iMilliamps = n+6
			strKeyVal = "uW_at_" + iMilliamps
			
			if(key == strKeyVal) {
				console.log(n + ') strKeyVal=[' + strKeyVal + ']')
				response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#FF0F0F">');
				//response.write('uW/cm^2 @ ' + iMilliamps +  ' : UV-LED mW @ ' + iMilliamps + 'mA : Post-Cal<br>');
				response.write('DOSE : uJ/cm^2 @ <b>' + iMilliamps +  ' mA</b> <br>');//@ ' + myConfig.iExposure_Time + ' sec exposure : Post-Cal<br>');
				response.write('</FONT>');
				var arrayOEM_Calibrated_UV_LED_PWM = String(myCalibration[key]).split(',');

				//  Convert uW to uJ Conver to DOSE
				for(var d=0 ; d<28 ; d++){
					arrayOEM_Calibrated_UV_LED_PWM[d] = arrayOEM_Calibrated_UV_LED_PWM[d] * myConfig.iExposure_Time
				}
				for (var p = 0; p <arrayOEM_Calibrated_UV_LED_PWM.length; p++) {
					arrayOEM_Calibrated_UV_LED_PWM[p] = Math.round(arrayOEM_Calibrated_UV_LED_PWM[p])//  Round to an integer
				}
				fAverage_uW = average_all_uvleds( arrayOEM_Calibrated_UV_LED_PWM );
				fDose = int(fAverage_uW * myConfig.iExposure_Time);
				response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">');
				response.write('UV-LED Avg= ' + Math.round(fAverage_uW*10)/10 + ' uJ/cm^2 @ ' + myConfig.iExposure_Time + ' sec exposure<br>')
				response.write('</FONT>');
				//response.write('<input size="118" type="text" name="' + key + '" value="' + myCalibration[key] + '">');
				

				response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#10FF10">');
				  //response.write('<br>Use the table below to visualize the LEDs. LED 1=bottom right. LED 28=top left');        
					  
				////////////////// --- Table for calibration values for array: Notes:
				//  1. Center Pixels will be brighter than outer ones due to 15degree spread combination, thus coresponding inner LEDs ones will need to be "dimmed", reducing power on overexposed pixels
				//  2. Pixels at the rear of the screen are more transmissive than at the front due to LCD angle vs transmissiveness. Rear = 100% : center = 90% : front = 50% in refrence to radiation received at 45deg to pixel. See notes E7 in notebook 70s show
				//  1. Split iOEM_Calibrated_UV_LED_PWM to array/list
				//response.write('<br>-----  Top View of LED array i.e. The closest row to this text is the back of the machine ----')
				
				response.write('<table border="1" style="background-color:#000000;border-collapse:collapse;border:1px solid #0000FF;color:#FFFFFF;width:800" cellpadding="3" cellspacing="3" >')
				// 1  //
				response.write('<tr>')
				for (var i = 27; i >27-7; i--) {
					fPercent_Deviation = (int(arrayOEM_Calibrated_UV_LED_PWM[i])/fAverage)*100.0
					fPercent_Deviation = arrayOEM_Calibrated_UV_LED_PWM[i];
					//response.write('<td bgcolor="' + getGreenToRed_Dose(fPercent_Deviation) + '" align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
					response.write('<td style="background-color: ' + getGreenToRed_Dose(fPercent_Deviation) + '" align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
					//response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
					//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
				}
				response.write('</tr>')
				//  2  //
				response.write('<tr>')
				for (var i = 27-7; i >27-7-7; i--) {
					fPercent_Deviation = (int(arrayOEM_Calibrated_UV_LED_PWM[i])/fAverage)*100.0
					fPercent_Deviation = arrayOEM_Calibrated_UV_LED_PWM[i];
					//response.write('<td bgcolor="' + getGreenToRed_Dose(fPercent_Deviation) + '" align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
					response.write('<td style="background-color: ' + getGreenToRed_Dose(fPercent_Deviation) + '" align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
					//response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
					//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
				}
				response.write('</tr>')
				//  3  //
				  response.write('<tr>')
				for (var i = 27-7-7; i >27-7-7-7; i--) {
					fPercent_Deviation = (int(arrayOEM_Calibrated_UV_LED_PWM[i])/fAverage)*100.0
					fPercent_Deviation = arrayOEM_Calibrated_UV_LED_PWM[i];
					//response.write('<td bgcolor="' + getGreenToRed_Dose(fPercent_Deviation) + '" align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
					response.write('<td style="background-color: ' + getGreenToRed_Dose(fPercent_Deviation) + '" align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
					//response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
					//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
				}
				response.write('</tr>')
				//  4  //
				response.write('<tr>')
				for (var i = 27-7-7-7; i >27-7-7-7-7; i--) {
					fPercent_Deviation = (int(arrayOEM_Calibrated_UV_LED_PWM[i])/fAverage)*100.0
					fPercent_Deviation = arrayOEM_Calibrated_UV_LED_PWM[i];
					//response.write('<td bgcolor="' + getGreenToRed_Dose(fPercent_Deviation) + '" align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
					response.write('<td style="background-color: ' + getGreenToRed_Dose(fPercent_Deviation) + '" align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
					//response.write('<td align="center">' + arrayOEM_Calibrated_UV_LED_PWM[i] + '</td>')
					//response.write('<td align="center"><input size="6" type="text" name="iOEM_Calibrated_UV_LED_PWM_' + i + '" value="' + arrayOEM_Calibrated_UV_LED_PWM[i] + '"></td>')
				}
				response.write('</tr>')
				//  Bottom of table text here  //

				response.write('</FONT>');
				response.write('</table>')
				
				response.write('<br>');
				//response.write('--------------------  Front of machine --------------------')
			}
			
		}
	});
	response.write('</FONT>');
	///////////////////////////////////////////////////////////////////////////////////////////////  DOSE Table -> END
	///////////////////////////////////////////////////////////////////////////////////////////////  DOSE Table -> END


strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/production';
response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
response.write('<input type="submit" value="Production Menu">');
response.write('</form>');
response.write('<br>');





//fsCalibration_Save(); //Debug : Create Calibration File

response.write(' </tr>');
response.write('</table>');
////////// SPLIT : END  ////////////////////////////////////
response.write('   </td>');
response.write('   <td width="30" height="" bgcolor="#242424">');
response.write('     <img src="' + strFullPath + 'spacer.gif" width="30" height="" alt="" /></td>');
response.write(' </tr>');
response.write('</table>');
response.write('<!-- End Save for Web Slices -->');





  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Back Button to Home ////
  ///////////////////////////////////////////////////
  
  response.write('<br>');
  response.write('<form name="input" action="http://' + strIPAddress + '" method="get">');
  response.write('<input type="submit" value=" Home ">');
  response.write('</form>');

  //response.write('<br>');
  response.write('<form name="input" action="http://' + strIPAddress + '/button_settings" method="get">');
  response.write('<input type="submit" value=" Back to Settings ">');
  response.write('</form>');
	
	/*
	/// Hardware Stats : END //////////////////////////////////////////////
	response.write('</td>');


	response.write('		<td rowspan="2">');
	response.write('			<img id="NanoHID_Body_Home_960x608_08" src="' + strFullPath + 'NanoHID_Body_Home_960x60-06.png" width="38" height="268" alt="" /></td>');
	//response.write('		<td width="187" height="115" bgcolor="#1B1B1B"><font align="center" color="#c6c6c6"><a color="#c6c6c6" href="http://wiki.iboxprinters.com">wiki.iboxprinters.com</a></font></td>');
	response.write('		<td width="187" height="115" bgcolor="#1B1B1B"><img id="NanoHUD_Window_187x115_AllG" src="' + strFullPath + 'NanoHUD_Window_187x115_AllG.png" width="187" height="115" alt="" /></td>');

	response.write('	</tr>');
	response.write('	<tr>');
	response.write('		<td>');
	response.write('			<img id="NanoHID_Body_Home_960x608_10" src="' + strFullPath + 'NanoHID_Body_Home_960x608_1.png" width="192" height="153" alt="" /></td>');
	response.write('		<td>');
	response.write('			<img id="NanoHID_Body_Home_960x608_11" src="' + strFullPath + 'NanoHID_Body_Home_960x60-08.png" width="187" height="153" alt="" /></td>');
	response.write('	</tr>');
	response.write('</table>');
	response.write('<!-- End Save for Web Slices -->');
	*/

	//response.write('</FONT>');
	/*
	response.write('<h1>Please select Help Option from list:</h1>');
	response.write('<br><br>User Installation Instructions:');
	response.write('<br><a href="' + strApacheRootLink + '/help/User_Instruction_Draft_2_5_15.htm" target="_blank">iBox Nano - Installation Guide</a>');

	response.write('<br><br>iBox Online Forums:');
	response.write('<br><a href="http://support.iboxprinters.com" target="_blank">iBox - Support Forums</a>');

	response.write('<br><br>iBox YouTube Videos:');
	response.write('<br><a href="https://www.youtube.com/channel/UCfHkl7-As8ycrRVbJ3I7Zvg" target="_blank">iBox - YouTube Videos</a>');
	*/

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

	response.write('</body>');
	response.write('</html>');
	response.end();
}
exports.main = main;


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
	//console.log(address); // 10.19.10.147
	strIPAddress = address; //"http://192.168.2.103"
	strApacheRootLink = 'http://' + address + ":8000/"
	strFullPath = "http://" + strIPAddress + ':8000/images/' ;
	
	strZeroConfigName = os.hostname();
	//console.log('IP Address is:',strIPAddress)
	
}

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
	//console.log('=== ERROR === : Restoring from a saved version of myCalibration');
	//copyFileSync(strHomeDirectory + strCalibration_File_Name + strSettingsFile_Ext + '_backup', strHomeDirectory + strCalibration_File_Name + strSettingsFile_Ext)
  }
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
function getGreenToRed(percent){
			percent = percent / 100.0
            r = percent<50 ? 255 : Math.floor(255-(percent*2-100)*255/100);
            g = percent>50 ? 255 : Math.floor((percent*2)*255/100);
            var strOut = 'rgb('+r+','+g+',0)'
            //console.log('percent=[' + percent + ' : strOut=' + strOut)
            return strOut;
}

function getGreenToRed_Dose(iMicroJoules){
		//percent = percent / 6;
		//percent = percent / 100.0
        //r = percent<50 ? 255 : Math.floor(255-(percent*2-100)*255/100);
        //g = percent>50 ? 255 : Math.floor((percent*2)*255/100);
        //b = percent>100 ? 255 : Math.floor((percent*2)*255/100);
        r=0;
        g=0;
        b=0;
        iTarget_uJ = 165;  //  5/3/25 nsno5 was 183uJ and TrentsNano was 165uJ
        iBuffer_uJ = iTarget_uJ * 0.20 ; //  like 20%
        iBuffer_uJ = int(iBuffer_uJ)
        if(iMicroJoules >= iTarget_uJ + iBuffer_uJ) {
        	r = Math.floor(iMicroJoules-iTarget_uJ);
        	if(r>255){
        		r=255
        	}
        	if(r<0){
        		r=0;
        	}
        }
        if(iMicroJoules <= iTarget_uJ - iBuffer_uJ) {
        	b = Math.floor(iTarget_uJ - iMicroJoules);
        	if(b>255){
        		b=255
        	}
        	if(b<0){
        		b=0;
        	}
        }
        //if(iMicroJoules <= iTarget_uJ + iBuffer_uJ && iMicroJoules > iTarget_uJ - iBuffer_uJ) {  //  Plus or Minus uJ buffer
        if(iMicroJoules <= iTarget_uJ + iBuffer_uJ && iMicroJoules > iTarget_uJ - iBuffer_uJ) {  //  Plus uJ buffer only because a little extra cure is better than a little under
        	g = Math.floor(255-(Math.abs(iMicroJoules-iTarget_uJ)));
        	if(g>255){
        		g=255
        	}
        	if(g<0){
        		g=0;
        	}
        }

        var strOut = 'rgb('+r+','+g+','+b+')'
        //console.log('iMicroJoules=[' + iMicroJoules + ' : strOut=' + strOut )
        return strOut;
}

function int(value) {
  //  Int Like Function : Trent
  return parseInt(value, 10);
}

function rgbify_old(maxval, minval, val, moreisgood) {
	//val = val / 100.0
	//maxval = maxval / 100.0
	//minval = minval / 100.0
    var intnsty = (val - minval) / (maxval - minval);
    var r, g;
    if (moreisgood) {
        if (intnsty > 0.5) {
            g = 255;
            r = Math.round(2 * (1 - intnsty) * 255);
        } else {
            r = 255;
            g = Math.round(2 * intnsty * 255);
        }

    } else { //lessisgood
        if (intnsty > 0.5) {
            r = 255;
            g = Math.round(2 * (1 - intnsty) * 255);
        } else {
            g = 255;
            r = Math.round(2 * intnsty * 255);
        }
    }
    var strOut = "rgb(" + r.toString() + ", " + g.toString() + ", 0)";
    console.log('val=[' + val + '] : min[' + minval + '] : max=[' + maxval + '] : strOut=' + strOut)
    return strOut
}

function rgbify(maxval, minval, val, moreisgood) {
	//val = val / 100.0
	//maxval = maxval / 100.0
	//minval = minval / 100.0
    var intnsty = (val - minval) / (maxval - minval);
    var r, g;
    if (moreisgood) {
        if (intnsty > 0.5) {
            g = 255;
            r = Math.round(2 * (1 - intnsty) * 255);
        } else {
            r = 255;
            g = Math.round(2 * intnsty * 255);
        }

    } else { //lessisgood
        if (intnsty > 0.5) {
            r = 255;
            g = Math.round(2 * (1 - intnsty) * 255);
        } else {
            g = 255;
            r = Math.round(2 * intnsty * 255);
        }
    }
    var strOut = "rgb(" + r.toString() + ", " + g.toString() + ", 0)";
    console.log('val=[' + val + '] : min[' + minval + '] : max=[' + maxval + '] : strOut=' + strOut)
    return strOut
}

function average_center_nine_uvleds(aryLED_Values_28) {
	fAverage = 0.0;
	fSum = 0.0
	//  Alreasy an array : var arrayUV_uW_Raw = String(aryLED_Values_28).split(',');
	for(var i=0 ; i<28 ; i++) {
		if( i==2 || i==3 || i==4 ) {
			fSum = int(fSum) + int(aryLED_Values_28[i]);
		}else if( i==9 || i==10 || i==11) {
			fSum = int(fSum) + int(aryLED_Values_28[i]);
		}else if( i==16|| i==17 || i==18) {
			fSum = int(fSum) + int(aryLED_Values_28[i]);
		}else if( i==23 || i==24 || i==25) {
			fSum = int(fSum) + int(aryLED_Values_28[i]);
		}
		//console.log(i + ' : fSum=' + fSum)
	}
	fAverage = int(fSum) / 12.0;
	return fAverage
}

function average_all_uvleds(aryLED_Values_28) {
	fAverage = 0.0;
	fSum = 0.0
	//  Alreasy an array : var arrayUV_uW_Raw = String(aryLED_Values_28).split(',');
	for(var i=0 ; i<28 ; i++) {
		fSum = int(fSum) + int(aryLED_Values_28[i]);
		//console.log(i + ' : fSum=' + fSum)
	}
	fAverage = int(fSum) / 28.0;
	return fAverage
}

function header_css (response, varRefreshLocation) {
  //var refreshLocation = "button_browse";
  refreshLocation = varRefreshLocation
  var header = require('./header');
  header.printHeader(response, strIPAddress, refreshLocation); //strIPAddress
}
