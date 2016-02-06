//  ibp_share  // 
//  Created: 3/16/2015
//  Copyright iBox Printers Inc 2015
//  Trent Carter

//  Includes
var dateFormat = require('dateformat');
var ibp_generate_thumbnails = require("./ibp_generate_thumbnails")
var path = require("path"); //  for async file copy functions : copyFolderRecursiveSync
var fs = require('fs');
var os = require('os');
var gcloud

//var AdmZip = require('adm-zip'); // ==> CRAP => Corrupted ZIPS on Zip (did not tru UNZip) https://www.npmjs.com/package/adm-zip
var archiver = require('archiver');

//var archive = archiver('zip');//  4/14/2015 Moved to point of use. Was crashing


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
var strTmp_Model_File_Name = '';
var strFull_Model_Path = '';
var strFull_Model_Dir_Path = '';
var strURL_Save_Share_Values = '';

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
    iPixel_Over_LED_Power: 0,
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

 /////////////////////////////////////////////////////////////////////////////////////
 ///////////  gcloud : aka Google Cloud Storge and Datastore  ////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
// Authorizing on a global basis.
/*
var projectId = process.env.api-project-529688790472 ; // E.g. 'grape-spaceship-123'
var gcloud = require('gcloud')({
  projectId: projectId
});
var storage;
*/
/////////////// gcloud : END  ///////////////////////////////////////////////////////


/// ///  GoogleAPIs END  ///////////////

var myList = []; //  DEBUG 3/27/15 for myList _list.json testing

function myModel_Load() {  //////////////////   MODEL <==== LOAD     //////////
 	var strTmp_Model_File_Name = mySystem.lastFileName_FileName;
	strModel_File_Name = strTmp_Model_File_Name.replace('.svg','');  //  Just leaves Model Dir name
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
function myModel_Save() {   ///////////////////////////     MODEL ==>> SAVE ///////
	var strTmp_Model_File_Name = mySystem.lastFileName_FileName;
	strModel_File_Name = strTmp_Model_File_Name.replace('.svg','');  //  Just leaves Model Dir name
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

function share_save_model_data(req, res, url) {
	console.log("[share] save_model_data")
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
  	res.write('<h3>Model Sharing:</h3>')
  	res.write('<br><br>This process will take several minutes...<br>')
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
      myModel_Save();
      res.write('<br>Saving Model MetaData...<br>')
      /*
      console.log('/////////////////////////////////////////////////////////////////');
      console.log('Request.body:' + req.body);
      console.log('Request.Method:' + req.method);
      console.log('Request.Headers[submit]:' + req.headers['submit']);
      console.log('Request.Headers[submitButtons:' + req.headers['submitButtons']);
      console.log('Request.Status:' + req.statusCode);
      console.log('Request.Headers[input]:' + req.headers['input']);
      console.log('Request.Headers[get]:' + req.headers['get']);
      console.log('Request.Headers:' + req.headers);
      console.log('Request' + req);
      console.log('URL' + url);
      console.log('/////////////////////////////////////////////////////////////////');
      //  Save ends here
      */

      /*
If Request.Form("submitButton") = "Previous Page" Then
    ' Code for Previous Page
ElseIf Request.Form("submitButton") = "Next Page" Then
    ' Code for Next Page
    */
      // Share Model => Now you have to package the IBF and Upload it.

    ///////////////////////////////////////////////////////////////////////////
    //////  Google Datastore  ////////////////
    ////////////////////////////////////////////////////////////////////////////
    ///  Google Datastore Documentation:
    // 
    // https://googlecloudplatform.github.io/gcloud-node/#/docs/v0.12.0/datastore/dataset
    //  https://googlecloudplatform.github.io/gcloud-node/#/docs/v0.12.0/datastore/query
    ////  Retreive DATA  ///////////////////////////
    /*
    console.log("gcloud : 1");
    var dataset = gcloud.datastore.dataset();
    //var dataset = gcloud.datastore.dataset({
	//	keyFilename: '/home/pi/IBF API Project-200b15d98d32.json',
  	//	projectId: 'api-project-529688790472'
	//});
    console.log("gcloud : 2");
	//var IBF_Key = dataset.key(['IBF_KeyValue', 'IBF_Key']);
	var IBF_Key = dataset.key('Company');  //  did not crash 3/27/15
	//var IBF_Key = dataset.key(['IBF_KeyValue', 'IBF_Key']);
	console.log("gcloud : 3");
	
	dataset.save({
		key: IBF_Key,
		data: {
			value1: 'value1',
			value2: 'value2'
		}
	}, function(err) {
		if(err) {
			console.log('ERROR On [dataset.save]: ' + err);
		}
		console.log('data_id=: ' + data.id);
	});
	
	console.log("gcloud : 4");

	dataset.get(IBF_Key, function(err, entity) {
	  console.log('Google dataset.get: ERROR[ ' + err + ' ] :::::  ENTITY:[ ' + entity + ']');
	  //resp.write('Google Datastore : ' + entity);
	});



	/////  TODO : START  //////
	var keystore = require('gcloud-keystore');
	var dataset = gcloud.datastore.dataset();

	var keystore = keystore(dataset);

	// Set an item.
	keystore.set('todos', ['eat', 'sleep', 'repeat'], function(err, key) {
		console.log('Err=[' + err + ']  :: key=[' + key + ']');
	});

	// Get an item.
	keystore.get('todos', function(err, todos) {
	  // todos:
	  //   ['eat', 'sleep', 'repeat']
	  console.log('ToDos from keystore.get: [' + todos + ']')
	});

	// Delete an item.
	keystore.delete('todos', function(err) {});

	////////////////////////
	*/

    /*

    		  data: [
			   {
			    model_name: 'Test Model Name',
			    model_description: 'Test Model Desc',
			    model_creation_date: 'Test Date',
			    model_file_name: 'Test File name .ibf'
			   }
			]


    	      model_name: myModel.model_name,
	      model_description: myModel.model_description,
	      model_creation_date: myModel.model_creation_date,
	      model_file_name: myModel.model_file_name

      //  Save model to Google Datastore
    dataset = gcloud.datastore.dataset({
		keyFilename: '/home/pi/ibox/www/packages/client_secrets.json',
  		projectId: 'api-project-529688790472'
	});
	// Save data to your dataset.
	var blogPostData = {
	  title: 'How to make the perfect homemade pasta',
	  tags: ['pasta', 'homemade'],
	  author: 'Andrew Chilton',
	  isDraft: true,
	  wordCount: 450
	};
	
	/// gcloud File I/O  ///
	storage = gcloud.storage({
		keyFilename: '/home/pi/client_secrets.json',  ///home/pi/ibox/www/packages/client_secrets.json',
  		projectId: 'api-project-529688790472'
	});
	*/
	//x


	///////////////////////////////////////////////////////////////////////////////
	/////  Things we will need to reuse  //
	//  IBF Path+Name  //
    strIBF = strHomeDirectory + 'www/packages/compressed/' + strModel_File_Name + '.zip' //  4/15/15 was .ibf
    strIBF_Compressed_Folder = strHomeDirectory + 'www/packages/compressed/' 
    strIBF_Raw_Data_Folder = strHomeDirectory + 'www/packages/expanded/' + strModel_File_Name + '/'
    strIBF_Expanded_Folder = strHomeDirectory + 'www/packages/expanded/'

 	///////////////////////////////////////////////////////////////////////////////
	/////  Move Files and Housekeeping 
	/////
	strFull_SVG_Dir_Path = strHomeDirectory + 'uploads/data/' + strModel_File_Name + '/'
	console.log('Copying [' + strFull_SVG_Dir_Path + '] to [' + strIBF_Expanded_Folder + '] ==> START');
	try { 
		copyFolderRecursiveSync(strFull_SVG_Dir_Path, strIBF_Expanded_Folder);
		console.log('Copy : END')
		///aryFileList = fs.readdirSync(strFull_SVG_Dir_Path); //  returns array of file list
		//myModel.layer_count = aryFileList.length - 6; //  -6 is to adjust for  _models.json, thumbnail images x 5
		//  Move files from /uploads/data/model_name/ to /packages/expanded/model_name/
	  }
	catch (err) {
	  //myModel.layer_count = -1;
	  console.log('The model does not exist in [' + strFull_SVG_Dir_Path + '], so lets hope it exists in [' + strIBF_Raw_Data_Folder + ']')
	  console.log(err);
	}

	//  Make the dir pi RW
	//console.log('Changing permisions on [' + strIBF_Raw_Data_Folder + ']')
	//fs.chmodSync(strIBF_Raw_Data_Folder, 0755)  //  locks me out??
	/////
	////////////////////////////////////////////////////////////////////////////////   

	///////////////////////////////////////////////////////////////////////////////
	/////  Create Images for Model  
	/////
	/////
	////////////////////////////////////////////////////////////////////////////////


	///////////////////////////////////////////////////////////////////////////////
	/////  Create ZIP of Model Dir using ADM_ZIP ==> orrupted ZIPS
	/////
	// creating archives 
	/*
    var zip = new AdmZip();
    console.log('Adding Files from [' + strIBF_Raw_Data_Folder + '] to ZIP')
    // add local file 
    //zip.addLocalFolder( strIBF_Raw_Data_Folder );  //  BUMMER Seems it does not work, get a 60k file instead of the expected 300k and it wont unzip on OSX
    //  Switching t add Local File

	try { 
		aryFileList = fs.readdirSync(strIBF_Raw_Data_Folder); //  returns array of file list
		console.log('Enumeration : Success : aryFileList.length=[' + aryFileList.length + ']')
		for(var i in aryFileList) {
			var fileName = aryFileList[i];
			if(fileName != '.AppleDouble' && fileName != '.DS_Store') {
				console.log('...adding [' + strIBF_Raw_Data_Folder + fileName + ']')
				zip.addLocalFile( strIBF_Raw_Data_Folder + fileName , strIBF);
			}else{
				console.log('skipping [' + fileName + ']')
			}

		}
	}catch (err) {
	  console.log('Cant enumerate DIR [' + strIBF_Raw_Data_Folder + ']')
	  console.log(err);
	}


    console.log('Zip Write : Writing ZIP:[' + strIBF + '] START')
    //  Write Zip  //
    zip.writeZip( strIBF );
    console.log('Zip Write : END')
	*/
	/////
	////////////////////////////////////////////////////////////////////////////////

	///////////////////////////////////////////////////////////////////////////////
	/////  Create ZIP of Model Dir using Archiver :  https://www.npmjs.com/package/archiver
	/////  http://stackoverflow.com/questions/15641243/need-to-zip-an-entire-directory-using-node-js
	/////
  var archive = archiver('zip');
	res.write('<br>Compressing Model...')
	strFull_IBF_Path_N_Name = strHomeDirectory + 'www/packages/compressed/' + strModel_File_Name + '.zip'  //  was .ibf 4/15/15
	var output = fs.createWriteStream(strFull_IBF_Path_N_Name);

	console.log('archive Zip Write : START')
	output.on('close', function () {
	    console.log(strFull_IBF_Path_N_Name + ': ' + archive.pointer() + ' total bytes');
	    console.log('archiver has been finalized and the output file descriptor has closed. => Upload [' + strFull_IBF_Path_N_Name + '] to GCS NOW......');
	    fcn_upload_to_google_cloud_storage(req, res, url);
	});

  archive.on('error', function(err){
    console.log('ZIP : ERROR : [' + err + ']');
    res.write('<br><b>Error encountered while Saving ZIP : Error [' + err + ' </b><br>')
      //throw err;
  });

	archive.pipe(output);
	archive.bulk([
		{ expand: true, cwd: strIBF_Raw_Data_Folder, src: ['**']}
	    //{ expand: true, cwd: strIBF_Raw_Data_Folder, src: ['**'], dest: strIBF_Raw_Data_Folder}
	]);
	archive.finalize();
	console.log('archive Zip Write : END')
	/////
	////////////////////////////////////////////////////////////////////////////////





	//////////////////////////////////////////////////////////////////////////////
	// Download Google Cloud Storage file from Cloud -> Nano
	// Download a remote file to a new local file.
	//bucket_images.file('file.txt').createReadStream().pipe(fs.createWriteStream('/home/pi/ibox/scrap/file_downloaded_from_GCS.txt'));

	//  Test :: 3/27/2015
	//  Scroll through list.json => For Browse Function  //
	/*
	myList_Load();
	//console.log('myList[0].model_name=[' + myList.indexOf(0).model_name + ']');
	//console.log('myList.indexOf(0).model_name=[' + myList.indexOf(0).model_name + ']');
	console.log('myList.models[0].model_name=[' + myList.models[0].model_name + ']');
	console.log('myList.models[1].model_name=[' + myList.models[1].model_name + ']');
	console.log('myList.models[2].model_name=[' + myList.models[2].model_name + ']');
	*/
      //  load main page
    //main(req, resp);
}

function fcn_upload_to_google_cloud_storage(req, res, url) {
		///////////////////////////////////////////////////////////////////////////////
	////  Upload and Download OBJECTS for Google Cloud Storage  ////////////////////
	console.log('fcn_upload_to_google_cloud_storage : [' + strModel_File_Name + '.zip' + ']');  //  was .ibf 4/15/15
	storage = gcloud.storage();
	//
	// UPLOAD - Buckets  ///
	var bucket_packages = storage.bucket('bucket_nano_ibf_packages');
	var bucket_metadata = storage.bucket('bucket_nano_ibf_metadata');
	var bucket_images = storage.bucket('bucket_nano_ibf_images');

	//  DOWNLOAD - Buckets - For easy testing - debug - Remove before flight  //
	//var bucket_packages = storage.bucket('bucket_nano_ibf_packages_download');
	//var bucket_metadata = storage.bucket('bucket_nano_ibf_metadata_download');
	//var bucket_images = storage.bucket('bucket_nano_ibf_images_download');

	//////////////////////////////////////////////////////////////////////////////
	// Upload a local file to a new file to be created in your bucket.
	//fs.createReadStream('/home/pi/ibox/scrap/file.txt').pipe(bucket.file('file.txt').createWriteStream());
	
	//  MetaData  //
	strTarget = strFull_Model_Path
	console.log('Uploading [' + strTarget + ']')
	res.write('<br>Uploading MetaData from Nano to Cloud')
	if ( fs.existsSync( strTarget ) ) {
		try { 
			fs.createReadStream(strTarget).pipe(bucket_metadata.file(strModel_File_Name + '.json').createWriteStream());
		}catch (err) {
		  //myModel.layer_count = -1;
		  console.log('=== ERR 404 ===>  The File does not exist in [' + strFull_Model_Path + ']')
		  console.log(err);
		}
	}



	//  Images  //
	strTarget = strHomeDirectory + 'www/packages/expanded/' + strModel_File_Name + '/_' + strModel_File_Name + '.jpg'
	console.log('Uploading [' + strTarget + ']')
	res.write('<br>Uploading [' + strModel_File_Name + '.jpg' + '] from Nano to Cloud')
	if ( fs.existsSync( strTarget ) ) {
		try { 
			fs.createReadStream(strTarget).pipe(bucket_images.file(strModel_File_Name + '.jpg').createWriteStream());
		}catch (err) {
		  //myModel.layer_count = -1;
		  console.log('=== ERR 404-2 ===>  The File does not exist in [' + strHomeDirectory + 'www/packages/expanded/' + strModel_File_Name + '/_' + strModel_File_Name + '.jpg' + ']')
		  console.log(err);
		}
	}
	strTarget = strHomeDirectory + 'www/packages/expanded/' + strModel_File_Name + '/_'  + strModel_File_Name + '_Thumb.jpg'
	console.log('Uploading [' + strTarget + ']')
	res.write('<br>Uploading [' + strModel_File_Name + '_Thumb.jpg' + '] from Nano to Cloud')
	if ( fs.existsSync( strTarget ) ) {
		try { 
			fs.createReadStream(strTarget).pipe(bucket_images.file(strModel_File_Name + '_Thumb.jpg').createWriteStream());
		}catch (err) {
		  //myModel.layer_count = -1;
		  console.log('=== ERR 404-3 ===>  The File does not exist in [' + strHomeDirectory + 'www/packages/expanded/' + strModel_File_Name + '/_'  + strModel_File_Name + '_Thumb.jpg' + ']')
		  console.log(err);
		}
	}

	//  IBF  //
	strTarget = strIBF
	console.log('Uploading [' + strTarget + ']')
	res.write('<br>Uploading [' + strModel_File_Name + '.zip] from Nano to Cloud');  //  was .ibf 4/15/15
	if ( fs.existsSync( strTarget ) ) {
		try { 
			fs.createReadStream( strTarget ).pipe(bucket_packages.file(strModel_File_Name + '.zip').createWriteStream()); //  was .ibf 4/15/15
		}catch (err) {
		  //myModel.layer_count = -1;
		  console.log('=== ERR 404-1===>  The File does not exist in [' + strIBF + ']')
		  console.log(err);
		}
	}


	res.write('<br><br>Upload Completed.</font>');


		//////////////////////////////////////////////////////////////////////////////////////////////////////
	  ////  Back Button to Home ////
	  ///////////////////////////////////////////////////
	  
	  res.write('<br>');
	  res.write('<form name="input" action="http://' + strIPAddress + '" method="get">');
	  res.write('<input type="submit" value="Done">');
	  res.write('</form>');

	  	res.write('</table></center></body></html>');
	res.write('</FONT>');

	res.write('</body>');
	res.write('</html>');

	res.end();


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

function main(request, response, url) {
	console.log("Called: ibp_share->main Function")
	fcnUpdate_IP_Address();
	fsSystem_Load();
  	fsConfig_Load();
  	bResult = myModel_Load();  //  If this is false it means the _model.json does not exist, so populate myModel from myConfig and the currently selected model from mySystem
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
    	myModel.model_creation_date = dDate;
    	myModel.license_date = dDate;

    	//  Use File System to answer some questions
    	//  How many files are in the directory?
    	var strTmp_Model_File_Name = mySystem.lastFileName_FileName;
		strModel_File_Name = strTmp_Model_File_Name.replace('.svg','');  //  Just leaves Model Dir name
		strFull_SVG_Dir_Path = strHomeDirectory + 'uploads/data/' + strModel_File_Name + '/'
		try { 
    		aryFileList = fs.readdirSync(strFull_SVG_Dir_Path); //  returns array of file list
          iLayer_Count_Local = 0
          for(var i=0;i<aryFileList.length;i++) {
            if(aryFileList[i].indexOf("0.png") > -1 || aryFileList[i].indexOf("1.png") > -1 || aryFileList[i].indexOf("2.png") > -1 || aryFileList[i].indexOf("3.png") > -1 || aryFileList[i].indexOf("4.png") > -1 || aryFileList[i].indexOf("5.png") > -1 || aryFileList[i].indexOf("6.png") > -1 || aryFileList[i].indexOf("7.png") > -1 || aryFileList[i].indexOf("8.png") > -1 || aryFileList[i].indexOf("9.png") > -1 ) {
              iLayer_Count_Local = iLayer_Count_Local + 1;
            }
          }
          myModel.layer_count = iLayer_Count_Local;
    	  }
    	catch (err) {
    	  myModel.layer_count = -1;
		  console.log('There has been an error trying to enumerate the directory: ' + strFull_SVG_Dir_Path)
		  console.log(err);
		}

 		myModel.model_name = strModel_File_Name;
 		myModel.model_file_name = strModel_File_Name;

 		//  We are almost sure that the model.json does not exist in this directory, or we would not be in this code. 
 		//  So you need to create the directory in most cases. If we dont create the DIR here, then myModel_Save cant create the file because the dir will be MIA
 		if (!fs.existsSync(strFull_Model_Dir_Path)){
 			console.log("Creating directory: " + strFull_Model_Dir_Path)
		    fs.mkdirSync(strFull_Model_Dir_Path);
		}else{
			console.log('Directory already exists: ' + strFull_Model_Dir_Path)
		}

 		//  After populating every parameter you can for the user, you are such a nice guy, then save it.
 		myModel_Save();
  	}else{ 
  		// //////////////////////////////////////////////////////////////////////////////////////////// Model file already exists  //
  		console.log('Model ' + strFull_Model_Path + ' already exists')
      //   Some items we will always update, such as Date and File Count
      //  FROM: myConfig  
      myModel.layer_height = myConfig.iGlobal_Z_Layer_Thickness;
      myModel.exposure_time_base = myConfig.fExposure_Time_Initial_Model_Layers;
      myModel.base_layer_count = myConfig.iModel_Layers_To_Overexpose;
      myModel.exposure_time = myConfig.iExposure_Time;
      //  Load Capt. Obvious
      var dDate=dateFormat(Date(), "mm/dd/yyyy");  //yyyy-mm-dd h:MM:ss
      myModel.model_creation_date = dDate;
      //myModel.license_date = dDate;

      //  Use File System to answer some questions
      //  How many files are in the directory?
      var strTmp_Model_File_Name = mySystem.lastFileName_FileName;
      strModel_File_Name = strTmp_Model_File_Name.replace('.svg','');  //  Just leaves Model Dir name
      strFull_SVG_Dir_Path = strHomeDirectory + 'www/packages/expanded/' + strModel_File_Name + '/'
      try { 
          aryFileList = fs.readdirSync(strFull_SVG_Dir_Path); //  returns array of file list
            iLayer_Count_Local = 0
            for(var i=0;i<aryFileList.length;i++) {
              if(aryFileList[i].indexOf("0.png") > -1 || aryFileList[i].indexOf("1.png") > -1 || aryFileList[i].indexOf("2.png") > -1 || aryFileList[i].indexOf("3.png") > -1 || aryFileList[i].indexOf("4.png") > -1 || aryFileList[i].indexOf("5.png") > -1 || aryFileList[i].indexOf("6.png") > -1 || aryFileList[i].indexOf("7.png") > -1 || aryFileList[i].indexOf("8.png") > -1 || aryFileList[i].indexOf("9.png") > -1 ) {
                iLayer_Count_Local = iLayer_Count_Local + 1;
              }
            }
            myModel.layer_count = iLayer_Count_Local;
          }
        catch (err) {
          myModel.layer_count = -1;
        console.log('There has been an error trying to enumerate the directory: ' + strFull_SVG_Dir_Path)
        console.log(err);
      }
  	}
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
	response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#c6c6c6">');
	response.write('<title>iBox Nano - Share Models</title>');
	response.write('<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />');
	response.write('<link rel="icon" href="' + strApacheRootLink + 'favicon-32.png" sizes="32x32">');
  	response.write('<link rel="shortcut icon" type="image/x-icon" href="' + strApacheRootLink + 'favicon.ico"/>');
	response.write('</head><p>');

	response.write('<body bgcolor="#FFFFFF">');

    ///  Tab Bar with CSS : Start  ////////////////////////////////////
    header_css( response, "button_share");
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
	response.write('			<a href="button_share">');
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



response.write('<!-- Save for Web Slices (NanoHID_Tabs_Share_960x88.psd) -->');
response.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0">');
response.write('	<tr>');
response.write('		<td>');
response.write('			<img id="NanoHID_Tabs_Share_960x88_01" src="' + strFullPath + 'NanoHID_Tabs_Share_960x88_0.png" width="31" height="88" alt="" /></td>');
response.write('		<td>');
response.write('			<img id="Button_Share_Model" src="' + strFullPath + 'Button_Share_Model.png" width="150" height="88" alt="Share Model" /></td>');
response.write('		<td>');
response.write('			<img id="Button_Share_2" src="' + strFullPath + 'Button_Share_2.png" width="149" height="88" alt="" /></td>');
response.write('		<td>');
response.write('			<img id="Button_Share_3" src="' + strFullPath + 'Button_Share_3.png" width="150" height="88" alt="" /></td>');
response.write('		<td>');
response.write('			<img id="Button_Share_4" src="' + strFullPath + 'Button_Share_4.png" width="151" height="88" alt="" /></td>');
response.write('		<td>');
response.write('			<img id="Button_Share_5" src="' + strFullPath + 'Button_Share_5.png" width="149" height="88" alt="" /></td>');
response.write('		<td>');
response.write('			<img id="Button_Share_6" src="' + strFullPath + 'Button_Share_6.png" width="150" height="88" alt="" /></td>');
response.write('		<td>');
response.write('			<img id="NanoHID_Tabs_Share_960x88_08" src="' + strFullPath + 'NanoHID_Tabs_Share_960x8-08.png" width="30" height="88" alt="" /></td>');
response.write('	</tr>');
response.write('</table>');
response.write('<!-- End Save for Web Slices -->');
*/
	/// BODY - Home/Main //////////////////////////////////////////////

response.write('<!-- Save for Web Slices (NanoHID_Body_Infinity_960xInfinity.psd) -->');
response.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0">');
response.write('	<tr>');
response.write('		<td width="23" height="100%" rowspan="2" bgcolor="#242424">');
response.write('			<img src="' + strFullPath + 'spacer.gif" width="23" height="608" alt="" /></td>');
response.write('		<td bgcolor="#1B1B1B">');
response.write('			<img id="NanoHID_Body_Infinity_960xInfinity_02" src="' + strFullPath + 'NanoHID_Body_Infinity_960xI.png" width="907" height="27" alt="" /></td>');
response.write('		<td width="30" height="608" rowspan="2" bgcolor="#242424">');
response.write('			<img src="' + strFullPath + 'spacer.gif" width="30" height="608" alt="" /></td>');
response.write('	</tr>');
response.write('	<tr>');
//response.write('		<td width="907" height="581" bgcolor="#1B1B1B">INF TEXT BODY</td>');
response.write('		<td width="907" height="581" bgcolor="#1B1B1B" valign="top">');

response.write('<table id="Table_01" width="100%" border="0" cellpadding="10" cellspacing="0" valign="top">');
response.write('	<tr>');
response.write('		<td width="100%" height="100%" rowspan="2" bgcolor="#1B1B1B" valign="top">');

//////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
response.write('<font color="#' + strFont_White + '"> You printed a model and now you want to share it with the world. Simply fill in the information below and then select. If you would like to share a different model, browse the model as if you were going to print it, then press [Share].</font>');
response.write('<font color="#' + strFont_White + '"> <br><br>Model Data: Autocreated where applicable</font>');

response.write('<font color="#' + strFont_White + '"><br>');

strFontColor_4r = '#adacac'
strINP = 'size="40"'
/////////////  Print to browser the contents of myModel  : START  ///////////////////////////////
response.write('<form name="input" action="' + strURL_Save_Share_Values + '" method="get">');
response.write('<table border="1" style="background-color:#242424;border-collapse:collapse;border:1px solid #FFCC00;color:#000000;width:60%" cellpadding="3" cellspacing="3">');
Object.keys(myModel).forEach(function (key) {
response.write('	<tr>');

if (key == "model_name") {
        //  Save as new Form  //
//response.write('    </td>');if (key == "model_name") {
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
  response.write('<td><font color="' + strFontColor_4r + '">Star Rating (puclic): </font></td><td><font color="#' + strFont_White + '">' + myModel[key] + ' Stars</font></td>');

}else if(key == "star_count_private") {
  //response.write('<td><font color="' + strFontColor_4r + '">Star Rating (your personal rating): </font></td><td><input ' + strINP + ' type="text" name="' + key + '" value="' + myModel[key] + '"></td>');
  response.write('<td><font color="' + strFontColor_4r + '">Star Rating (your personal rating): </font></td>');
  response.write('<td>')
  response.write('<select name="' + key + '">')
  
  if(myModel[key] == '1') {
    strSelected = " selected"
  }else{
    strSelected = ""
  }
  response.write('  <option value="1"' + strSelected + '>1</option>');

  if(myModel[key] == '2') {
    strSelected = " selected"
  }else{
    strSelected = ""
  }
  response.write('  <option value="2"' + strSelected + '>2</option>');

  if(myModel[key] == '3') {
    strSelected = " selected"
  }else{
    strSelected = ""
  }
  response.write('  <option value="3"' + strSelected + '>3</option>');

  if(myModel[key] == '4') {
    strSelected = " selected"
  }else{
    strSelected = ""
  }
  response.write('  <option value="4"' + strSelected + '>4</option>');

  if(myModel[key] == '5') {
    strSelected = " selected"
  }else{
    strSelected = ""
  }
  response.write('  <option value="5"' + strSelected + '>5</option>');
  response.write('</select>');
  response.write('<font color="' + strFontColor_4r + '"> Stars</font>');
  response.write('</td>')

}else{
  response.write('<td><font color="' + strFontColor_4r + '">' + key + ': </font></td><td><input ' + strINP + ' type="text" name="' + key + '" value="' + myModel[key] + '"></td>');
}
    response.write('</tr>');
    ///response.write('<br>');
    //console.log;
    //console.log(key);
    //console.log(myConfig[key]);
  });
//response.write('		</td>');
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
	response.write('<font color="#' + strFont_White + '">This may take several minutes to compress and upload. Please be patient</font><br>');
	response.write('<input type="submit" value="Share Your Model">');
	response.write('</form>');
/*
//response.write('<font color="#' + strFont_White + '"> <br><br>Dropdown box to select print directory. Default to last print from mySystem.json</font>');
//response.write('<font color="#' + strFont_White + '"> <br><br>Dropdown box to select print config to import parameters, or just use the currently selected config. Default to last print from mySystem.json</font>');
//response.write('<font color="#' + strFont_White + '"> <br><br>All done; press [SHARE] (insert button here)</font>');
//response.write('<font color="#' + strFont_White + '"> <br><br>Add code to save model.json</font>');
response.write('<font color="#' + strFont_White + '"> <br><br>Add code to generate preview images using imagemagick</font>');
response.write('<font color="#' + strFont_White + '"> <br><br>Add code to create zip with all files</font>');
response.write('<font color="#' + strFont_White + '"> <br><br>Add code to rename zip to IBF</font>');
response.write('<font color="#' + strFont_White + '"> <br><br>Add code to upload JSON to models.iboxprinters.com</font>');
response.write('<font color="#' + strFont_White + '"> <br><br>Add code to upload JSON to thingiverse.com</font>');
*/
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////

response.write('		</td>');
response.write('	</tr>');
response.write('</table>');

response.write('		</td>');
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
	strURL_Save_Share_Values = 'http://' + strIPAddress + '/button_share_save';
	strZeroConfigName = os.hostname();
	//console.log('IP Address is:',strIPAddress)
	
}

function copyFileSync( source, target ) {
	//  From: http://stackoverflow.com/questions/13786160/copy-folder-recursively-in-node-js
    var targetFile = target;

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

function load_google_cloud_storage_object() {
	console.log('');
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
  	keyFilename: '/home/pi/ibox/keys/IBF_API_Upload_Read_Write_200b15d98d32.json', //   READ/WRITE
    projectId: 'api-project-529688790472'  //  Upload Bucket(s)

  	//  DOWNLOAD Buckets - Debug ONLY - Remove before flight //
  	//keyFilename: '/home/pi/ibox/keys/IBF_API_Download_Read_Write_Mgnt_07024746373d.json', //   READ/WRITE
  	//projectId: 'ibf-read-only-89818'  //  Upload Bucket(s)
	});
}

function header_css (response, varRefreshLocation) {
  //var refreshLocation = "button_browse";
  refreshLocation = varRefreshLocation
  var header = require('./header');
  header.printHeader(response, strIPAddress, refreshLocation); //strIPAddress
}

exports.main = main;
exports.share_save_model_data = share_save_model_data;
exports.load_google_cloud_storage_object = load_google_cloud_storage_object