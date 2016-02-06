//  ibp_create_model  // 
//  Created: 4/2/2015
//  Copyright iBox Printers Inc 2015

//  Includes
var dateFormat = require('dateformat');
var fs = require('fs');
var os = require('os');
var path = require("path"); //  for async file copy functions : copyFolderRecursiveSync
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
var strFont_White = 'c6c6c6';
var strHomeDirectory = '/home/pi/ibox/';
var strConfigDirectory = '/home/pi/ibox/print_config_files/';
var strSystem_File_Name = 'mysystem';
var strSettingsFile_Ext = '.json';
var strDefault_Model_Name = '_model';
var strModel_Name = '';
var strFull_Model_Path = '';
var strFull_Model_Dir_Path = '';
var strURL_Save_Create_Values = '';

var myModel = { 

    model_name: 'model name',
    model_description: 'model description',
    model_keywords: '',
    model_creation_date: '05/01/2015',
    model_file_name: 'file_name',
    printer_type: 'iBox Nano',
    printer_software_version: '0.0',
    printer_hardware_version: '0.0',
    author_name: 'author name',
    author_contact: 'author contact',
    license_type: 'Attribution NonCommercial ShareAlike 3.0',
    license_description: 'license description',
    license_date: '05/01/2015',
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

var myList = []; //  DEBUG 3/27/15 for myList _list.json testing

function save_model_data(req, res, url) {
	console.log("[create] save_model_data")
	fcnUpdate_IP_Address();
	fsSystem_Load();
	fsConfig_Load();

	res.write('<html><body bgcolor="#1B1B1B">');
	res.write('<center><table class="layout" border="0" width="960" bgcolor="#000000">');
	res.write('<head>');
	res.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#c6c6c6">');
	res.write('<title>iBox Nano - Share Models</title>');
	res.write('<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />');
	res.write('<link rel="icon" href="' + strApacheRootLink + 'favicon-32.png" sizes="32x32">');
	res.write('<link rel="shortcut icon" type="image/x-icon" href="' + strApacheRootLink + 'favicon.ico"/>');
	res.write('</head><p>');

	res.write('<body bgcolor="#FFFFFF">');

	res.write('<font color="#' + strFont_White + '">');
	res.write('<h3>Create Model:</h3>')
	//res.write('<br><br>This process will take what feels like an eternity...<br>')
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



	//  Step 5 - write to myConfig  from myQuery
	Object.keys(myQuery).forEach(function (key) {
	myModel[key] = myQuery[key];
	console.log("Key:[",key,"] = [", myQuery[key] ,"] => Config:[", myModel[key] ,"]");
	//console.log("Key:[",key,"] = [", myConfig[key] ,"]");
	});

	res.write('<br>Saving Model MetaData...<br>')
	myModel_Save(myModel.model_file_name);

	//  5/5/2015  //
	//  Set the Created Model name as the mySystem model name
	mySystem.lastFileName_FileName = myModel.model_file_name
	//  Save
	fsSystem_Save();

  res.write('<div id="header"><h3>Upload of SVG Complete</h3></div>');
  res.write('<div id="header"><h3>Saving of Model Meta Data Complete</h3></div>');
  res.write('');
  //res.write('<br><br>Your SVG will need to be converted from Vector to Raster.'); 
  //res.write('<br><br>This process will take 10+ minutes. The actual duration will depend on the height of the Model.');
  //res.write('<br><br>Your printers [Print] button will flash rapidly during the conversion.');
  //res.write('<br><br>Then preview images of the model will be created, this will also take several minutes to complete. There will not be blinking lights during this process.');
  //res.write('<br><br>For the moment there is no indication when the process is complete. So start it and be patient.');
  res.write('<br><br>');
  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Back Button to Home ////
  ///////////////////////////////////////////////////
  strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/create_model_images_python_start';
  res.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
  res.write('<input type="submit" value="Start Conversion">');
  res.write('</form>');

    res.write('</font>');


  //  Start Conversion from SVG to IBF  //
  //console.log("SVG_Convert_To_IBF : START");
  //iBoxPrintManager.stdin.write("SVG_Convert_To_IBF:" + lastFileName_FileName  + "\n" );  //mySystem.lastFileName_FileName
  //console.log("SVG_Convert_To_IBF : END");


	res.write('</table></center></body></html>');
	res.write('</FONT>');

	res.write('</body>');
	res.write('</html>');
	res.end();
}
      



function populate_json_data(request, response, lastFileName_FileName, lastFileName_FullPath) {
	console.log("Called: ibp_create_model->populate_json_data Function")
	fcnUpdate_IP_Address();

	//  Verify it was in fact an SVG file that was uploaded  //
	strExt = path.extname(lastFileName_FileName);
	if(lastFileName_FileName.indexOf(" ") > -1) {
		console.log('space found in name');
			console.log('ERROR : You can not have spaces in your file name :  File Uploaded [' + lastFileName_FileName + ']');
		response.writeHead(200, {'content-type': 'text/html'});
		response.write('<html><body bgcolor="#1B1B1B">');
		response.write('<center><table class="layout" border="0" width="960" bgcolor="#000000">');
		response.write('<head>');
		response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#c6c6c6">');
		response.write('<title>iBox Nano - Create Model</title>');
		response.write('<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />');
		response.write('<link rel="icon" href="' + strApacheRootLink + 'favicon-32.png" sizes="32x32">');
	  response.write('<link rel="shortcut icon" type="image/x-icon" href="' + strApacheRootLink + 'favicon.ico"/>');
		response.write('</head><p>');
		response.write('<body bgcolor="#FFFFFF">');
		response.write('You can not have spaces in your file name. <br>File Uploaded [' + lastFileName_FileName + '] has spaces.');

			//////////////////////////////////////////////////////////////////////////////////////////////////////
	////  Back Button to Home ////
	///////////////////////////////////////////////////
		response.write('<br><br>');
	response.write('<form name="input" action="http://' + strIPAddress + '/button_create_model" method="get">');
	response.write('<input type="submit" value="Try Again">');
	response.write('</form>');

	response.write('<br><br>');
	response.write('<form name="input" action="http://' + strIPAddress + '" method="get">');
	response.write('<input type="submit" value="Exit">');
	response.write('</form>');
	
		response.write('</FONT>');

		response.write('</body>');
		response.write('</html>');
		response.end();
		//  EXIT  //
		return;

	}else if(!strExt == ".svg") {
		console.log('ERROR : File Type Incorrect :  File Uploaded [' + lastFileName_FileName + '] has extension [' + strExt + ']');
		response.writeHead(200, {'content-type': 'text/html'});
		response.write('<html><body bgcolor="#1B1B1B">');
		response.write('<center><table class="layout" border="0" width="960" bgcolor="#000000">');
		response.write('<head>');
		response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#c6c6c6">');
		response.write('<title>iBox Nano - Create Model</title>');
		response.write('<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />');
		response.write('<link rel="icon" href="' + strApacheRootLink + 'favicon-32.png" sizes="32x32">');
	  response.write('<link rel="shortcut icon" type="image/x-icon" href="' + strApacheRootLink + 'favicon.ico"/>');
		response.write('</head><p>');
		response.write('<body bgcolor="#FFFFFF">');
		response.write('You selected an unsupported file type. <br>File Uploaded [' + lastFileName_FileName + '] has extension [' + strExt + '] Please select an SVG file created using a supported program such as Slic3r');

			//////////////////////////////////////////////////////////////////////////////////////////////////////
	////  Back Button to Home ////
	///////////////////////////////////////////////////
		response.write('<br><br>');
	response.write('<form name="input" action="http://' + strIPAddress + '/button_create_model" method="get">');
	response.write('<input type="submit" value="Try Again">');
	response.write('</form>');

	response.write('<br><br>');
	response.write('<form name="input" action="http://' + strIPAddress + '" method="get">');
	response.write('<input type="submit" value="Exit">');
	response.write('</form>');
	
		response.write('</FONT>');

		response.write('</body>');
		response.write('</html>');
		response.end();
		//  EXIT  //
		return;
	}

	fsSystem_Load();
	mySystem.lastFileName_FileName = lastFileName_FileName;
	mySystem.lastFileName_FullPath = lastFileName_FullPath;
	fsSystem_Save();
	fsConfig_Load();
	bResult = myModel_Load(lastFileName_FileName);  //  If this is false it means the _model.json does not exist, so populate myModel from myConfig and the currently selected model from mySystem
	if(bResult == false) {
		//  If this is false it means the _model.json does not exist, 
		//  so populate myModel from myConfig and the currently selected model from mySystem
		console.log('Loading as many parameters from the last print job in:' + strDefault_Model_Name + strSettingsFile_Ext)

		//  FROM: myConfig	
		myModel.layer_height = myConfig.iGlobal_Z_Layer_Thickness;
		myModel.exposure_time_base = myConfig.fExposure_Time_Initial_Model_Layers;
		myModel.base_layer_count = myConfig.iModel_Layers_To_Overexpose;
		myModel.exposure_time = myConfig.iExposure_Time;

		//  FROM: mySystem
		myModel.printer_software_version = mySystem.Version_NodeJS_Major + '.' + mySystem.Version_NodeJS_Minor + '.' + mySystem.Version_Python_Major + '.' + mySystem.Version_Python_Minor;
		myModel.printer_hardware_version = mySystem.Hardware_Version_Major + '.' + mySystem.Hardware_Version_Minor;

		//  Load Defaults for Nano  //
		myModel.printer_type = 'iBox Nano';
		myModel.print_area_width = 40;
		myModel.print_area_depth = 20;
		myModel.print_area_height = 90;

		//  Load Capt. Obvious
		var dDate=dateFormat(Date(), "mm/dd/yyyy");  //yyyy-mm-dd h:MM:ss
		myModel.model_creation_date = dDate;  // 4/15/05 was Date();
		myModel.license_date = dDate;

		//  Use File System to answer some questions
		myModel.layer_count = -1;
		//  How many files are in the directory?
		var strTmp_Model_Name = mySystem.lastFileName_FileName;
			strModel_Name = strTmp_Model_Name.replace('.svg','');  //  Just leaves Model Dir name
			strFull_SVG_Dir_Path = strHomeDirectory + 'www/packages/expanded/' + strModel_Name + '/'
			try { 
	    		aryFileList = fs.readdirSync(strFull_SVG_Dir_Path); //  returns array of file list
	    		//  Loop through and count the 0.png + 1.png... 9.png files  //
	    		iLayer_Count_Local = 0
	    		for(var i=0;i<aryFileList.length;i++) {
	    			if(aryFileList[i].indexOf("0.png") > -1 || aryFileList[i].indexOf("1.png") > -1 || aryFileList[i].indexOf("2.png") > -1 || aryFileList[i].indexOf("3.png") > -1 || aryFileList[i].indexOf("4.png") > -1 || aryFileList[i].indexOf("5.png") > -1 || aryFileList[i].indexOf("6.png") > -1 || aryFileList[i].indexOf("7.png") > -1 || aryFileList[i].indexOf("8.png") > -1 || aryFileList[i].indexOf("9.png") > -1 ) {
	    				iLayer_Count_Local = iLayer_Count_Local + 1;
	    			}
	    		}
	    		myModel.layer_count = iLayer_Count_Local;  // was aryFileList.length - 6; //  -6 is to adjust for  _models.json, thumbnail images x 5
	    	  }
	    	catch (err) {
	    	  myModel.layer_count = 0;
			  console.log('There has been an error trying to enumerate the directory: ' + strFull_SVG_Dir_Path + '. How would we know the number of files, the DIR has net been populated yet')
			  console.log(err);
			}

	 		myModel.model_name = strModel_Name;
	 		myModel.model_file_name = strModel_Name;

	 		//  We are almost sure that the model.json does not exist in this directory, or we would not be in this code. 
	 		//  So you need to create the directory in most cases. If we dont create the DIR here, then myModel_Save cant create the file because the dir will be MIA
	 		if (!fs.existsSync(strFull_Model_Dir_Path)){
	 			console.log("Creating directory: " + strFull_Model_Dir_Path)
			    fs.mkdirSync(strFull_Model_Dir_Path);
			}else{
				console.log('Directory already exists: ' + strFull_Model_Dir_Path)
			}

	 		//  After populating every parameter you can for the user, you are such a nice guy, then save it.
	 		myModel_Save(strModel_Name);
	}else{
		//  Model file already exists  //
		console.log('Model ' + strFull_Model_Path + ' already exists')
	}
	response.writeHead(200, {'content-type': 'text/html'});


	//  Use Text Wranglers TEXT->Prefix/SuffixLines to add res.write(' and ');
  //  Use TextWragler SEARCH->FIND to replace "images/" with "' + strFullPath + '"  
  //  The LCD section will need to use BACKGROUND images so we can put text on top. This is somewhat a manual process.
  //  Images will be served from Apache at /var/www/images/
  //  There is a script in /ibox/ that copies the images from /ibox/images to /var/www/images to assist with refreshes of images


	response.write('<html><body bgcolor="#1B1B1B">');
	response.write('<center><table class="layout" border="0" width="960" bgcolor="#000000">');
	response.write('<head>');
	response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#c6c6c6">');
	response.write('<title>iBox Nano - Create Model</title>');
	response.write('<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />');
	response.write('<link rel="icon" href="' + strApacheRootLink + 'favicon-32.png" sizes="32x32">');
  response.write('<link rel="shortcut icon" type="image/x-icon" href="' + strApacheRootLink + 'favicon.ico"/>');
  response.write('<link rel="stylesheet" type="text/css" href="http://' + strIPAddress + ':8000/Styles.css"/>');
	response.write('</head><p>');

	response.write('<body bgcolor="#FFFFFF">');

		///  Tab Bar with CSS : Start  ////////////////////////////////////
  	header_css( response, "button_create_model");
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
	response.write('<table class="tabs" border="0" cellspacing="0" cellpadding="0"><tr>'); //  CSS
	response.write('		<td>');
	response.write('			<a href="Button_Help">');
	response.write('				<img id="Button_Refresh_Header" src="' + strFullPath + 'Button_Refresh_Header.png" width="54" height="38" border="0" alt="Refresh" /></a></td>');
	response.write('		<td rowspan="2">');
	response.write('			<img id="NanoHID_Header_960x72_04" src="' + strFullPath + 'NanoHID_Header_960x72_04.png" width="46" height="64" alt="" /></td>');
	response.write('</tr></table>'); //  CSS
	response.write('<table class="tabs" border="0" cellspacing="0" cellpadding="0"><tr>'); //  CSS
	response.write('		<td>');
	response.write('			<a href="button_home">');
	response.write('				<img id="Button_Home" src="' + strFullPath + 'Button_Home.png" width="54" height="38" border="0" alt="Home" /></a></td>');
	response.write('		<td rowspan="2">');
	response.write('			<img id="NanoHID_Header_960x72_06" src="' + strFullPath + 'NanoHID_Header_960x72_06.png" width="6" height="64" alt="" /></td>');
	response.write('</tr></table>'); //  CSS
	response.write('<table class="tabs" border="0" cellspacing="0" cellpadding="0"><tr>'); //  CSS
	response.write('		<td>');
	response.write('			<a href="button_help">');
	response.write('				<img id="Button_Help_Header" src="' + strFullPath + 'Button_Help_Header.png" width="54" height="38" border="0" alt="Help" /></a></td>');
	response.write('		<td rowspan="2">');
	response.write('			<img id="NanoHID_Header_960x72_08" src="' + strFullPath + 'NanoHID_Header_960x72_08.png" width="6" height="64" alt="" /></td>');
	response.write('</tr></table>'); //  CSS
	response.write('<table class="tabs" border="0" cellspacing="0" cellpadding="0"><tr>'); //  CSS
	response.write('		<td>');
	response.write('			<a href="button_settings">');
	response.write('				<img id="Button_Settings_Header" src="' + strFullPath + 'Button_Settings_Header.png" width="54" height="38" border="0" alt="Settings" /></a></td>');
	response.write('		<td rowspan="2">');
	response.write('			<img id="NanoHID_Header_960x72_10" src="' + strFullPath + 'NanoHID_Header_960x72_10.png" width="6" height="64" alt="" /></td>');
	response.write('</tr></table>'); //  CSS
	response.write('<table class="tabs" border="0" cellspacing="0" cellpadding="0"><tr>'); //  CSS
	response.write('		<td>');
	response.write('			<a href="button_about">');
	response.write('				<img id="Button_About_Header" src="' + strFullPath + 'Button_About_Header.png" width="54" height="38" border="0" alt="About" /></a></td>');
	response.write('		<td rowspan="2">');
	response.write('			<img id="NanoHID_Header_960x72_12" src="' + strFullPath + 'NanoHID_Header_960x72_12.png" width="25" height="64" alt="" /></td>');
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

	*/

	/// BODY - Home/Main ////////////////////////////////////////////// : START

response.write('<font color="#' + strFont_White + '"><br><br>You have uploaded an SVG. Simply fill in the information below and then press [Create Model].</font>');
response.write('<font color="#' + strFont_White + '"> <br><br>Model Data: Autocreated where applicable</font>');

response.write('<font color="#' + strFont_White + '"><br>');

strFontColor_4r = '#adacac'
strINP = 'size="40"'
/////////////  Print to browser the contents of myModel  : START  ///////////////////////////////
response.write('<form name="input" action="' + strURL_Save_Create_Values + '" method="get">');
response.write('<table border="1" style="background-color:#242424;border-collapse:collapse;border:1px solid #FFCC00;color:#000000;width:60%" cellpadding="3" cellspacing="3">');
Object.keys(myModel).forEach(function (key) {
response.write('	<tr>');


if (key == "model_name") {
        //  Save as new Form  //
//response.write('		</td>');if (key == "model_name") {
  response.write('<td><font color="' + strFontColor_4r + '">Model Name: </font></td><td><input ' + strINP + ' type="text" name="' + key + '" value="' + myModel[key] + '"></td>');
  //  Save as new Form  //
  //res.write('<br>' + key + ': <input type="text" name="' + key + '" value="Change Form">');
  //res.write('<input type="submit" value="Save As New Config File">&nbsp;Enter new file name then press [Save As New Config File]');
}else if(key == "model_description") {
  response.write('<td><font color="' + strFontColor_4r + '">Model Description: </font></td><td><input ' + strINP + ' type="text" name="' + key + '" value="' + myModel[key] + '"></td>');
  response.write('');
}else if(key == "model_creation_date") {
  response.write('<td><font color="' + strFontColor_4r + '">Date Added: </font></td><td><input ' + strINP + ' type="text" name="' + key + '" value="' + myModel[key] + '"></td>');
}else if(key == "license_date") {
  response.write('<td><font color="' + strFontColor_4r + '">Date Created: </font></td><td><input ' + strINP + ' type="text" name="' + key + '" value="' + myModel[key] + '"></td>');

}else if(key == "model_file_name") {
  response.write('<td><font color="' + strFontColor_4r + '">Model File: </font></td><td><font color="#' + strFont_White + '">' + myModel[key] + '</font></td>');
}else if(key == "star_count_public") {
  response.write('<td><font color="' + strFontColor_4r + '">Star Rating (puclic): </font></td><td><font color="#' + strFont_White + '">' + myModel[key] + '</font></td>');

}else if(key == "star_count_private") {

}else if(key == "layer_count") {
	//  By having nothing here we are effectively "hiding" the parameter because it is always -1	

}else{
  strKey_Cleaned = 
  response.write('<td><font color="' + strFontColor_4r + '">' + key + ': </font></td><td><input ' + strINP + ' type="text" name="' + key + '" value="' + myModel[key] + '"></td>');
}
response.write('</tr>');
///response.write('<br>');
//console.log;
//console.log(key);
//console.log(myConfig[key]);
});
response.write('	</tr>');
response.write('</table>');
response.write('');

/////////////  Print to browser the contents of myModel  : STOP  ///////////////////////////////
response.write('</font>')

//////////////////////////////////////////////////////////////////////////////////////////////////////
////  SAVE Button for Model Information ////
///////////////////////////////////////////////////

response.write('<br>');
//response.write('<form name="input" action="http://' + strIPAddress + '" method="get">');
//response.write('<input type="submit" value="Save Values">');
response.write('<font color="#' + strFont_White + '">After you have added some information about your new model we can proceed to the next step.</font><br>');
response.write('<input type="submit" value="Save and Continue">');
response.write('</form>');

/// BODY - Home/Main ////////////////////////////////////////////// : END


//////////////////////////////////////////////////////////////////////////////////////////////////////
////  Back Button to Home ////
///////////////////////////////////////////////////

response.write('<br>');
response.write('<form name="input" action="http://' + strIPAddress + '" method="get">');
response.write('<input type="submit" value="Abort">');
response.write('</form>');


//response.write('<br>Request Object:' + request.url)

response.write('</table></center></body></html>');
response.write('</FONT>');

response.write('</body>');
response.write('</html>');
response.end();

}

function main(request, response) {
	console.log("Called: ibp_create_model->main Function")
	fcnUpdate_IP_Address();
	response.writeHead(200, {'content-type': 'text/html'});
	strFree_RAM = String(os.freemem()/1000000).substring(0,6);

	
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
	response.write('<FONT STYLE="' + strFontStyle + '" SIZE="-1" COLOR="#c6c6c6">');
	response.write('<title>iBox Nano - Create Model</title>');
	response.write('<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />');
	response.write('<link rel="icon" href="' + strApacheRootLink + 'favicon-32.png" sizes="32x32">');
  response.write('<link rel="shortcut icon" type="image/x-icon" href="' + strApacheRootLink + 'favicon.ico"/>');
	response.write('</head><p>');

	response.write('<body bgcolor="#FFFFFF">');

		///  Tab Bar with CSS : Start  ////////////////////////////////////
  	header_css( response, "button_create_model");
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
	response.write('		<td>');
	response.write('			<a href="Button_Help">');
	response.write('				<img id="Button_Refresh_Header" src="' + strFullPath + 'Button_Refresh_Header.png" width="54" height="38" border="0" alt="Refresh" /></a></td>');
	response.write('		<td rowspan="2">');
	response.write('			<img id="NanoHID_Header_960x72_04" src="' + strFullPath + 'NanoHID_Header_960x72_04.png" width="46" height="64" alt="" /></td>');
	response.write('		<td>');
	response.write('			<a href="button_home">');
	response.write('				<img id="Button_Home" src="' + strFullPath + 'Button_Home.png" width="54" height="38" border="0" alt="Home" /></a></td>');
	response.write('		<td rowspan="2">');
	response.write('			<img id="NanoHID_Header_960x72_06" src="' + strFullPath + 'NanoHID_Header_960x72_06.png" width="6" height="64" alt="" /></td>');
	response.write('		<td>');
	response.write('			<a href="button_help">');
	response.write('				<img id="Button_Help_Header" src="' + strFullPath + 'Button_Help_Header.png" width="54" height="38" border="0" alt="Help" /></a></td>');
	response.write('		<td rowspan="2">');
	response.write('			<img id="NanoHID_Header_960x72_08" src="' + strFullPath + 'NanoHID_Header_960x72_08.png" width="6" height="64" alt="" /></td>');
	response.write('		<td>');
	response.write('			<a href="button_settings">');
	response.write('				<img id="Button_Settings_Header" src="' + strFullPath + 'Button_Settings_Header.png" width="54" height="38" border="0" alt="Settings" /></a></td>');
	response.write('		<td rowspan="2">');
	response.write('			<img id="NanoHID_Header_960x72_10" src="' + strFullPath + 'NanoHID_Header_960x72_10.png" width="6" height="64" alt="" /></td>');
	response.write('		<td>');
	response.write('			<a href="button_about">');
	response.write('				<img id="Button_About_Header" src="' + strFullPath + 'Button_About_Header.png" width="54" height="38" border="0" alt="About" /></a></td>');
	response.write('		<td rowspan="2">');
	response.write('			<img id="NanoHID_Header_960x72_12" src="' + strFullPath + 'NanoHID_Header_960x72_12.png" width="25" height="64" alt="" /></td>');
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

	*/
	/// BODY - Home/Main //////////////////////////////////////////////

	//response.write('<FONT color="#c6c6c6">')
	//response.write('<FONT STYLE="' + strFontStyle + '" SIZE="+1" COLOR="#c6c6c6>');
	//response.write('<FONT SIZE="" COLOR="#c6c6c6>');

	response.write('<!-- Save for Web Slices (NanoHID_Body_Home_960x608.psd) -->');
	response.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0" align="top">');
	response.write('	<tr>');
	response.write('		<td colspan="6">');
	response.write('			<img id="NanoHID_Body_Home_960x608_01" src="' + strFullPath + 'NanoHID_Body_Home_960x608_0.png" width="960" height="69" alt="" /></td>');
	response.write('	</tr>');
	response.write('	<tr>');
	response.write('		<td rowspan="4">');
	response.write('			<img id="NanoHID_Body_Home_960x608_02" src="' + strFullPath + 'NanoHID_Body_Home_960x60-02.png" width="51" height="539" alt="" /></td>');
	response.write('		<td width="420" height="218" colspan="4" bgcolor="#1B1B1B"><font color="#c6c6c6">');
	response.write('<em><b>Create and print a model using the SVG file format:</em></b> <br>');
	response.write('Step 1: Find or Create an STL file. You can find them on thingiverse.com or similar site.<br>');
	response.write('Step 2: Convert it to SVG using a free program like Slic3r<br>');
	response.write('Step 3: Download the SVG to the Nano.<br>');
	response.write('Step 4: Then [Browse] and print it from the Home Page.');

	//////  Select and Download SVG File  /////////////////////////////////////////////////////////////////////
	response.write('<br>Choose a SVG File by pressing [Choose Files]')

  response.write('<form action="/upload_svg" enctype="multipart/form-data" method="post">')

  response.write('<input type="file" name="upload" multiple="multiple"><br>')
  response.write('<i><font size="-2">You will have likely created this SVG in Slic3r or similar modeling/slicing program.</font></i><br>')

  response.write('<br>Upload your selected file by pressing ')

  response.write('<input type="submit" value="UPLOAD">')
  response.write('</form>')
	    //response.write('<br><br>You can also upoad a SVG that you created using Slic3r by uploading it here:<br>')
	/*
  response.write('<form name="input" action="http://' + strIPAddress + '/button_download_file" method="get">');
	response.write('<input type="submit" value="UPLOAD SVG File">');
	response.write('</form>');
	//response.write('<br><br>Select a SVG that you have previously uploaded:<br>')
  response.write('<form name="input" action="http://' + strIPAddress + '/button_select_file" method="get">');
	response.write('<input type="submit" value="Select SVG File">');
	response.write('</form>');
*/
//response.write('<br>');



	response.write('</td>');
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

	
	/// Hardware Stats : END //////////////////////////////////////////////
	response.write('</td>');


	response.write('		<td rowspan="2">');
	response.write('			<img id="NanoHID_Body_Home_960x608_08" src="' + strFullPath + 'NanoHID_Body_Home_960x60-06.png" width="38" height="268" alt="" /></td>');
	//response.write('		<td width="187" height="115" bgcolor="#1B1B1B"><font align="center" color="#c6c6c6"><a color="#c6c6c6" href="http://wiki.iboxprinters.com">wiki.iboxprinters.com</a></font></td>');

		//////// Right Lower Bubble : START  ///////////////////////////////////////////
	response.write('		<td width="187" height="115" bgcolor="#1B1B1B">');
	response.write('<img id="NanoHUD_Window_187x115_Create_Model" src="' + strFullPath + 'NanoHUD_Window_187x115_Create_Model.png" width="187" height="115" alt="" />');
	response.write('</td>');
		//////// Right Lower Bubble : END  ///////////////////////////////////////////

	response.write('	</tr>');
	response.write('	<tr>');
	response.write('		<td>');
	response.write('			<img id="NanoHID_Body_Home_960x608_10" src="' + strFullPath + 'NanoHID_Body_Home_960x608_1.png" width="192" height="153" alt="" /></td>');
	response.write('		<td>');
	response.write('			<img id="NanoHID_Body_Home_960x608_11" src="' + strFullPath + 'NanoHID_Body_Home_960x60-08.png" width="187" height="153" alt="" /></td>');
	response.write('	</tr>');
	response.write('</table>');
	response.write('<!-- End Save for Web Slices -->');

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
	strURL_Save_Create_Values = 'http://' + strIPAddress + '/button_create_model_save_data'
	strZeroConfigName = os.hostname();
	//console.log('IP Address is:',strIPAddress)
	
}

function myList_Load() {  //  Really for Browse Function
  //  Load json IBF List FILE
  try {  
  	strFile_Path = '/home/pi/ibox/www/packages/_list.json';
    data = fs.readFileSync(strFile_Path) //  T2
    console.log("myList_Load : readFileSync=",strFile_Path)
    myList = JSON.parse(data);
    //fs.closeSync(data)
    console.log(myList);
  }
  catch (err) {
    console.log('There has been an error parsing your JSON. : myList')
    console.log(err);
    //  Create a new one with defaults
    ///console.log("Creating a new one with defaults"); #could wipe out valuable data
    ///fsSystem_Save();
  }
}

function myModel_Load(strModel_File_Name_Local) {  //////////////////   MODEL <==== LOAD     //////////
 	//var strTmp_Model_Name = mySystem.lastFileName_FileName;
 	strTmp_Model_Name = strModel_File_Name_Local;
	strModel_File_Name = strTmp_Model_Name.replace('.svg','');  //  Just leaves Model Dir name
	strFull_Model_Path = strHomeDirectory + 'www/packages/expanded/' + strModel_File_Name + '/' + strDefault_Model_Name + '.json';
	strFull_Model_Dir_Path = strHomeDirectory + 'www/packages/expanded/' + strModel_File_Name + '/';
  try {  //  T2
    data = fs.readFileSync(strFull_Model_Path) //  lastFileName_FileName
    console.log("myModel_Load : readFileSync=",strFull_Model_Path)
    myModel = JSON.parse(data);
    console.log(myModel);
    return true;
  }
  catch (err) {
    console.log('There has been an error parsing your JSON. : myModel from: ' + strFull_Model_Path)
    console.log(err);
    //  You tried to load it and failed, so we shall assume the model.json does not exist and create one.
    //  To do this we will need to populate myModel from the currently selected myConfig
    return false;
  }
}

function myModel_Save(strModel_File_Name_Local) {   ///////////////////////////     MODEL ==>> SAVE ///////
	//var strTmp_Model_Name = mySystem.lastFileName_FileName;
	strTmp_Model_Name = strModel_File_Name_Local;
	strModel_File_Name = strTmp_Model_Name.replace('.svg','');  //  Just leaves Model Dir name
	strFull_Model_Path = strHomeDirectory + 'www/packages/expanded/' + strModel_File_Name + '/' + strDefault_Model_Name + '.json'
	console.log('myModel_Save : Saving to: ' + strFull_Model_Path)
	//  Models will be saved in a Dir named after the model. i.e. Bunny will be in /ibox/www/packages/expanded/Bunny/_model.json
	data = JSON.stringify(myModel,null,2);
	fs.writeFile((strFull_Model_Path), data, function (err) { // T2
	  if (err) {
	    console.log('myModel_Save : There has been an error saving myModel in your _model.json File: ' + strFull_Model_Path);
	    console.log(err.message);
	    return;
	  }
	  console.log('myModel : Configuration saved successfully to: ' + strFull_Model_Path)
	});
}

function fsSystem_Load() {
  try {  //  T2
    data = fs.readFileSync(strHomeDirectory + strSystem_File_Name + strSettingsFile_Ext) //  T2
    console.log("fsSystem_Load : readFileSync=",strHomeDirectory + strSystem_File_Name + strSettingsFile_Ext)
    mySystem = JSON.parse(data);
    //console.log(mySystem);
  }
  catch (err) {
    console.log('There has been an error parsing your JSON. : mySystem')
    console.log(err);
  }
}

function fsSystem_Save() {
  //  Save Settings FILE  //
  //  T2
  data = JSON.stringify(mySystem,null,2);
  fs.writeFile((strHomeDirectory + strSystem_File_Name + strSettingsFile_Ext), data, function (err) { // T2
    if (err) {
      console.log('There has been an error saving your configuration data.: mySystem');
      console.log(err.message);
      return;
    }
    console.log('mySystem : Configuration saved successfully.')
    //console.log('Making a backup copy of mySystem')
    //copyFileSync(strHomeDirectory + strSystem_File_Name + strSettingsFile_Ext, strHomeDirectory + strSystem_File_Name + strSettingsFile_Ext + '_backup')
  });
  // Have printer reload System and Config files:
  //iBoxPrintManager.stdin.write('load_config\n');  #see notes in fsConfig_Save why we dont force Python to acces these files until needed
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

function update_model_information(strModel_Name) {
	console.log('update_model_information : strModel_Name=' + strModel_Name);
	//  Load Model Info
	myModel_Load(strModel_Name)
	//  Update Info
	strFull_SVG_Dir_Path = strHomeDirectory + 'www/packages/' + strModel_Name + '/'
	try { 
		aryFileList = fs.readdirSync(strFull_SVG_Dir_Path); //  returns array of file list
		//  Loop through and count the 0.png + 1.png... 9.png files  //
		iLayer_Count_Local = 0
		for(var i=0;i<aryFileList.length;i++) {
			if(aryFileList[i].indexOf("0.png") > -1 || aryFileList[i].indexOf("1.png") > -1 || aryFileList[i].indexOf("2.png") > -1 || aryFileList[i].indexOf("3.png") > -1 || aryFileList[i].indexOf("4.png") > -1 || aryFileList[i].indexOf("5.png") > -1 || aryFileList[i].indexOf("6.png") > -1 || aryFileList[i].indexOf("7.png") > -1 || aryFileList[i].indexOf("8.png") > -1 || aryFileList[i].indexOf("9.png") > -1 ) {
				iLayer_Count_Local = iLayer_Count_Local + 1;
			}
		}
		myModel.layer_count = iLayer_Count_Local;  // was aryFileList.length - 6; //  -6 is to adjust for  _models.json, thumbnail images x 5
	  }
	catch (err) {
	  myModel.layer_count = -1;
	  console.log('There has been an error trying to enumerate the directory: ' + strFull_SVG_Dir_Path + ' from: update_model_information')
	  console.log(err);
	}
	//  Save Model Info
	myModel_Save(strModel_Name)
}

function header_css (response, varRefreshLocation) {
  //var refreshLocation = "button_browse";
  refreshLocation = varRefreshLocation
  var header = require('./header');
  header.printHeader(response, strIPAddress, refreshLocation); //strIPAddress
}

exports.main = main;
exports.populate_json_data = populate_json_data;
exports.save_model_data = save_model_data;
exports.update_model_information = update_model_information;