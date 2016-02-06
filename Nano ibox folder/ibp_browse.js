//  ibp_browse  // 
//  Created: 3/11/2015
//  Copyright iBox Printers Inc 2015

//  Includes
var fs = require('fs');
var strFontStyle = ('font-family: "Arial Black", "Arial Bold", Gadget, sans-serif;');
var strIPAddress = '127.0.0.1';
var strFullPath = "http://" + strIPAddress + ':8000'; //  Apache is on port 8000 just to serve files FAST, Node.js is set up to also serve the files, but its slow.
var myList;
var modelName;
var thumbPath;
var thumbNameJPG;
var mainEndCalled = false;
var response2;
var urlArr = [];
var urlCreated = [];
var thumbLoopCounter;
var nextThumbSlot = 0;
var height = '225px';
//var width = '200px';
var url = require("url");
var modelToDownload;
var printAfterDownload = false;
var overwrite;
var numModelsPerPage = 25;
var numModelsOnPage = 0;
var localModelList = [];
var gcsModelList = [];
var wentNext = false;
var wentBack = false;
var paramsGlobal;
var loadingLocal = false;
var loadingGCS = false;
var showBackButton = true;
var showNextButton = true;
var order;
var search = false;
var searchString = "";
var myBrowseListGlobal;
var showLocal = true;
var showGCS = true;
var mgntExists = false;
var mgntInterface = require('./mgntInterface');


//// gcloud : https://cloud.google.com/solutions/nodejs/  /////////////////
	var gcloud = require('gcloud')({
		keyFilename: '/home/pi/ibox/keys/IBF_API_Download_Read_Only_5d5e0a174a2a.json',
  		projectId: 'ibf-read-only-89818'
	});
	var storage = gcloud.storage();
	

function main(request, response) {
	
	//initialize vars on next page load
	whileStop = true;
	lastFileSize = 0;
	nextThumbSlot = 0;
	mainEndCalled = false;
	whileStopDownload = true;
	lastFileSizeDownload = 0;
	lastFileSizeDownload2 = 0;
	downloadExistsYet = false;
	listExistsYet = false;
	numModelsPerPage = 25;
	numModelsOnPage = 0;
	localModelList = [];
	//localModelList2 = [];
	gcsModelList = [];
	loadLocal1CanContinue = false;
	loadingLocal = false;
	loadingGCS = false;
	showBackButton = true;
	showNextButton = true;
	leftOverSpots = numModelsPerPage;
	urlCreated = [];
	mgntExists = false;
	mgntExists = mgntInterface.mgntKeyExist();
	killIsURLCreated = false;
	//searchString = ""; //this could be deleted to remember the search string
	//search = false;
	
	console.log("Called: ibp_browse->main Function")
	fcnUpdate_IP_Address();
	response.writeHead(200, {'content-type': 'text/html'});
	response2 = response;
	response.write('<html><body bgcolor="#1B1B1B"><center>');
	
	//  Trent 5/13/2015
	  response.write('<head>');
	  response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#c6c6c6">');
	  //res.write('<title>iBox Nano - Settings</title>');
	  response.write('<title>iBox Nano - Browse - ' + strZeroConfigName + '</title>');
	  response.write('<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />');
	  response.write('<link rel="icon" href="' + strApacheRootLink + 'favicon-32.png" sizes="32x32">');
	  response.write('<link rel="shortcut icon" type="image/x-icon" href="' + strApacheRootLink + 'favicon.ico"/>');
	  response.write('</head><p>');
	
	//header here
	response.write('<link rel="stylesheet" type="text/css" href="http://' + strIPAddress + ':8000/browseStyles.css"/>');

	var refreshLocation = "button_browse";
	var header = require('./header');
	header.printHeader(response, strIPAddress, refreshLocation);
	
	
	if(request.url.indexOf('/downloading1') > -1) {
		
		if(checkIfModelExists(modelToDownload) && (overwrite == false)) {
			//model already exists, would you like to overwrite or abort?
			response2.write('<br />');
			response2.write('<div style="color:grey">A model with the name "' + modelToDownload + '" already exists locally, would you like to proceed?</div>');
		
			response2.write('<br />');
			response2.write('<table>');
			response2.write('<tr>');
			response2.write('<td align="left" width="100px">');
			response2.write('<form action="/button_browse" method="get">');
			response2.write('&nbsp;&nbsp;<input type="submit" value="Abort">');
			response2.write('</form>');
			response2.write('</td>');
			response2.write('<td align="right" width="100px">');
			response2.write('<form action="/button_browse" method="get">');
			response2.write('<input type="hidden" name="isOverwriteDownload" value="Yes">');
			response2.write('<input type="hidden" name="modelName" value="' + modelToDownload + '">');
			response2.write('&nbsp;&nbsp;<input type="submit" value="Overwrite">');
			response2.write('</form>');
			response2.write('</td>');
			response2.write('</tr>');
			response2.write('</table>');
			response2.end();
		}else {
			overwrite = true;
			response2.write('<br />');
			response2.write('<div style="color:grey">Model "' + modelToDownload + '" is downloading...</div>');
			response2.write('<head>');
			response2.write('<META http-equiv="refresh" content="0;URL=/browse/downloadingA1">');
			response2.write('</head>');
		
			response2.write('</center>');
			response2.write('</body>');
			response2.write('</html>');
			response2.end();
		}
	}else if(request.url.indexOf('/downloadingA1') > -1) {
		response2.write('<br />');
		response2.write('<div style="color:grey">Model "' + modelToDownload + '" is downloading....</div>');
		downloadModel();
	}else if(request.url.indexOf('/downloading2') > -1) {
		response2.write('<br />');
		response2.write('<div style="color:grey">Model "' + modelToDownload + '" is fully downloaded.</div>');
		response2.write('<div style="color:grey">Going to start extracting...</div>');
		extractZip();
	}else if(request.url.indexOf('/downloading3') > -1) {
		response2.write('<br />');
		response2.write('<div style="color:grey">Model "' + modelToDownload + '" is extracting to expanded directory...</div>');
		
			zip.extractAllTo(/*target path*/"/home/pi/ibox/www/packages/expanded/" + modelToDownload + "/", /*overwrite*/true);
		console.log('Finished extracting: ' + modelToDownload);
		
		updateCreationDate(modelToDownload, false);
		response2.write('<head>');
		response2.write('<META http-equiv="refresh" content="0;URL=/browse/downloading4">');
		response2.write('</head>');
		response2.write('</center>');
		response2.write('</body>');
		response2.write('</html>');
		response2.end();
		
		
	}else if(request.url.indexOf('/downloading4') > -1) {
		response2.write('<br />');
		response2.write('<div style="color:grey">Model "' + modelToDownload + '" is done extracting.</div>');
		response2.write('<div style="color:grey">Completed</div>');
		response2.write('<br />');
		if(printAfterDownload) {
			
			console.log('modelToDownload: ' + modelToDownload);
			response2.write('<head>');
			response2.write('<META http-equiv="refresh" content="0;URL=/print?file_name=' + modelToDownload + '&>');
			response2.write('</head>');
			
			response2.write('<form action="/print" method="get">');
			response2.write('<input type="hidden" name="model_name" value="' + modelToDownload + '">');
			response2.write('&nbsp;&nbsp;<input type="submit" value="Print">');
			response2.write('</form>');
		}else {
			response2.write('<head>');
			response2.write('<META http-equiv="refresh" content="0;URL=/select_file_to_print?file_name=' + modelToDownload + '&>');
			response2.write('</head>');
			
			response2.write('<form action="/select_file_to_print" method="get">');
			response2.write('<input type="hidden" name="file_name" value="' + modelToDownload + '">');
			response2.write('&nbsp;&nbsp;<input type="submit" value="Select">');
			response2.write('</form>');
		}
		
		
		response2.write('</center>');
		response2.write('</body>');
		response2.write('</html>');
		response2.end();
		
	}else if(request.url.indexOf('/delete') > -1) {
		
		var params2 = url.parse(request.url,true).query;
		var modelToDelete2 = params2.modelName;
		response2.write('<br />');
		response2.write('<div style="color:grey">Are you sure you want to delete model "' + modelToDelete2 + '" forever?</div>');
		
		response2.write('<br />');
		response2.write('<table>');
		response2.write('<tr>');
		response2.write('<td align="left" width="100px">');
		response2.write('<form action="/button_browse" method="get">');
		response2.write('&nbsp;&nbsp;<input type="submit" value="Abort">');
		response2.write('</form>');
		response2.write('</td>');
		response2.write('<td align="right" width="100px">');
		response2.write('<form action="/button_browse" method="get">');
		response2.write('<input type="hidden" name="isDelete" value="Yes">');
		if(params2.mgntLocalFile == 'Yes') {
			response2.write('<input type="hidden" name="mgntLocalFile" value="Yes">');
		}
		response2.write('<input type="hidden" name="modelName" value="' + modelToDelete2 + '">');
		response2.write('&nbsp;&nbsp;<input type="submit" value="Delete">');
		response2.write('</form>');
		response2.write('</td>');
		response2.write('</tr>');
		response2.write('</table>');
		
		response2.end();
	}else if(request.url.indexOf('/transferToCloud') > -1) {
		
		var params2 = url.parse(request.url,true).query;
		var modelToTransfer = params2.file_name;
		transferToCloud(modelToTransfer);

	}else if(request.url.indexOf('/copyToLocal') > -1) {
		
		var params2 = url.parse(request.url,true).query;
		var modelToMove = params2.file_name;
		copyToLocal(modelToMove);

	}else if(request.url.indexOf('/mgnt') > -1) {
		
		var params2 = url.parse(request.url,true).query;
		mgntInterface.handleMgntFormData(response2, strIPAddress, params2);
	}else {
	
	
	
	//check to see there is any data in the url
	console.log('URL: ' + request.url);
	var params = url.parse(request.url,true).query;
	paramsGlobal = params;

	
	if(params.isFormData == 'Yes') {
		//update the saved json file at /home/pi/ibox/browseSettings.jsons
		var browseLocation = params.browseLocation;
		var order = params.order;

		//modelsPerPage
		var modelsPerPage = params.modelsPerPage;
		
		console.log('Browse Location: ' + params.browseLocation);
		var Local = 'false';
		var iBox = 'false';
		var mgnt = 'false';
		var mgntLocal = 'false';
		if(typeof browseLocation === 'undefined') {
			//both false
			Local = 'true';
		}else {
			if(browseLocation.indexOf('Local') > -1) {
				Local = 'true';
			}
			if(browseLocation.indexOf('iBox') > -1) {
				iBox = 'true';
			}
			if(browseLocation.indexOf('mgnt') > -1) {
				mgnt = 'true';
			}
			if(browseLocation.indexOf('mgntLocal') > -1) {
				mgntLocal = 'true';
			}
		}
		
		
		
		var browseSettingsString = '{\n  "Local": "' + Local + '",\n  "iBox": "' + iBox + '",\n  "Mgnt": "' + mgnt + '",\n  "mgntLocal": "' + mgntLocal + '",\n  "order": "' + params.order + '",\n  "modelsPerPage": "' + modelsPerPage + '"\n}';
		
		fs.writeFileSync("/home/pi/ibox/browseSettings.json", browseSettingsString);
	}
	
	if(params.isOverwriteDownload == 'Yes') {
		overwrite = true;
		//then get download form data and download
		modelToDownload = params.modelName;
		
		response2.write('<head>');
		response2.write('<META http-equiv="refresh" content="0;URL=/browse/downloading1">');
		response2.write('</head>');
		
		response2.write('</center>');
		response2.write('</body>');
		response2.write('</html>');
		response2.end();
	}else if(params.isDownload == 'Yes') {
		printAfterDownload = false;
		overwrite = false;
		console.log('isDownload');
		//then get download form data and download
		modelToDownload = params.modelName;
		
		response2.write('<head>');
		response2.write('<META http-equiv="refresh" content="0;URL=/browse/downloading1">');
		response2.write('</head>');
		
		response2.write('</center>');
		response2.write('</body>');
		response2.write('</html>');
		response2.end();
	}else if(params.isDownloadPrint == 'Yes') {
		//then get download form data and download, when finished, start printing
		printAfterDownload = true;
		overwrite = false;
		console.log('isDownloadPrint');
		//then get download form data and download
		modelToDownload = params.modelName;
		
		response2.write('<head>');
		response2.write('<META http-equiv="refresh" content="0;URL=/browse/downloading1">');
		response2.write('</head>');
		
		response2.write('</center>');
		response2.write('</body>');
		response2.write('</html>');
		response2.end();
		
	} else {
		
	if(params.isDelete == 'Yes') {
		console.log('isDelete');
		var pathToFiles = '/home/pi/ibox/www/packages';
		var pathToImages = '/home/pi/ibox/www/model_images/';
		if(params.mgntLocalFile == 'Yes') {
			pathToFiles = '/home/pi/ibox/www/packages/mgnt';
			pathToImages = '/home/pi/ibox/www/model_images/mgnt/';
		}
		//then delete local model
		var modelToDelete = params.modelName;
		var pathToModelDir = pathToFiles + '/expanded/' + modelToDelete;
		var pathToModelZip = pathToFiles + '/compressed/' + modelToDelete + '.zip';
		//var pathToModelZip2 = '/ibox/packages/expanded/compressed/' + modelToDelete + '.zip';
		var pathToModelThumb = pathToImages + modelToDelete + '.jpg';
		try {
			deleteDir(pathToModelDir);
			deleteFile(pathToModelThumb);
			
			/*
			try { 
	    		var eXcOut = execSync('sudo chmod 777 ' + pathToModelZip);
				console.log(eXcOut);
			}catch (err) {
				console.log('ERROR [' + err + '] : executing execSync[sudo chmod 777 ' + pathToModelZip + ']')
			}
			*/
			
			deleteFile(pathToModelZip);
		} catch(errors) {
			if (errors.code=='ENOENT') {
				//file doesn't exist
        		console.log("Thumbnail doesn't exists: " + pathToModelThumb + " or " + "Zip doesn't exist: " + pathToModelZip);
			}else if(errors.code=='ENOTDIR') {
				console.log("Model directory doesn't exists: " + pathToModelDir);
			}else {
				//something else happend
				console.log('Something Else Happened');
				console.log(errors.code);
			}
		}
		console.log('Model Deleted: ' + modelToDelete);
	}else if (params.isSearch == 'Yes') {
		//search arrays before printing them to the screen
		search = true;
		searchString = params.searchString;
	}else if (params.isClearSearch == 'Yes') {
		//search arrays before printing them to the screen
		search = false;
		searchString = "";
	}
	
	
	printAfterDownload = false;
	//read saved json file
	var myBrowseList;
	var foundBrowseSettings = false;
	try {  
  		strFile_Path = '/home/pi/ibox/browseSettings.json';
    	data = fs.readFileSync(strFile_Path) //  T2
    	console.log("myList_Load : readFileSync=",strFile_Path)
    	myBrowseList = JSON.parse(data);
    	myBrowseListGlobal = myBrowseList;
		foundBrowseSettings = true;
  	}
  	catch (err) {
		foundBrowseSettings = false;
    	console.log('There has been an error parsing your JSON.')
    	console.log(err);
		response.write('Sorry, we could not find your browseSettings.json file.');
  	}
	
	if(foundBrowseSettings) {
		printOptions(response, myBrowseList); // print the settings bar
	}
	
	}
	
	
	}
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
	//console.log(address); // 10.25.10.147
	strIPAddress = address; //"http://192.168.2.103"
	strApacheRootLink = 'http://' + address + ":8000/"
	strFullPath = "http://" + strIPAddress + ':8000/images/' ;
	
	strZeroConfigName = os.hostname();
	//console.log('IP Address is:',strIPAddress)
	
}

function deleteDir(path) {
  if( fs.existsSync(path) ) {
  	fs.chmodSync(path, '777');
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteDir(curPath);
      } else { // delete file
      	fs.chmodSync(curPath, '777');
        fs.unlinkSync(curPath);
      }
    });
    try{
    	fs.rmdirSync(path);	
    }catch(error) {
    	console.log('Error deleting directory.');
    	response.write('<br /><div class="divColor">Error deleting directory. Try again.</div>');
    }
    
  }
}

function deleteFile(path) {
	fs.chmodSync(path, '777');
	fs.unlinkSync(path);
}


function printOptions(response, myBrowseList) {
	//print options here
	response.write('<br />');
	var actionLoc = '/button_browse';
	
	response.write('<table style="color: #c6c6c6">');
	response.write('<tr>');
	
	response.write('<form action="' + actionLoc + '" method="get">');
	response.write('<input type="hidden" name="isFormData" value="Yes">');

	response.write('<td>');
	response.write('<table style="color: #c6c6c6">');
	response.write('<tr>');

	response.write('<td class="localText2">');
	response.write('<input type="checkbox" name="browseLocation" value="Local"');

	if((!mgntExists) && (myBrowseList.Local != 'true') && (myBrowseList.iBox != 'true')) {
		//resets the values if mgnt key just disapeared
		myBrowseList.Local = 'true';
		myBrowseListGlobal.Local = 'true';
	}
	
	if(myBrowseList.Local == 'true') {
		response.write('checked>');
	}else {
		response.write('>');
	}
	
	response.write('Local&nbsp;&nbsp;');
	response.write('</td>');
	response.write('<td class="remoteText2">');
	response.write('<input type="checkbox" name="browseLocation" value="iBox"');
	
	if(myBrowseList.iBox == 'true') {
		response.write('checked>');
	}else {
		response.write('>');
	}
	
	response.write('iBox Cloud&nbsp;&nbsp;');
	response.write('</td>');

	response.write('</tr>');

	//only display below column if the keys exist
	//mgntExists = mgntInterface.mgntKeyExist();
	if (mgntExists) {
		response.write('<tr>');

		//for local mgnt table
		response.write('<td>');
		response.write('<input type="checkbox" name="browseLocation" value="mgntLocal"');
		if(myBrowseList.mgntLocal == 'true') {
			response.write('checked>');
		}else {
			response.write('>');
		}
		response.write('Mgnt Local&nbsp;&nbsp;');
		response.write('</td>');

		response.write('<td>');
		response.write('<input type="checkbox" name="browseLocation" value="mgnt"');
	
		if(myBrowseList.Mgnt == 'true') {
			response.write('checked>');
		}else {
			response.write('>');
		}
		
		response.write('Mgnt&nbsp;&nbsp;');
		response.write('</td>');

		response.write('</tr>');
	}
	response.write('</table>');
	response.write('</td>');

	response.write('<td>');
	response.write('&nbsp;');
	
	order = myBrowseList.order;
	response.write('Order By:&nbsp;');
	response.write('<select name="order">');
	
	response.write('<option value="Default"');
	
	if(myBrowseList.order == 'Default') {
		response.write('selected>Added Date</option>');
	}else {
		response.write('>Added Date</option>');
	}
	
	
	response.write('<option value="Stars"');
	
	if(myBrowseList.order == 'Stars') {
		response.write('selected>&#35; of Stars</option>');
	}else {
		response.write('>&#35; of Stars</option>');
	}
	
	response.write('<option value="Date"');
	
	if(myBrowseList.order == 'Date') {

		response.write('selected>Creation Date</option>');
	}else {
		response.write('>Creation Date</option>');
	}
	
	response.write('</select>');

	response.write('</td>');
	
	response.write('<td>');
	response.write('&nbsp;');
	//for specified number of models per page
	
	response.write('Models Per Page:&nbsp;');
	response.write('<select name="modelsPerPage">');
	
	//comment below this is just a test block
	/*
	response.write('<option value="2"');
	
	if(myBrowseList.modelsPerPage == '2') {
		response.write('selected>2</option>');
	}else {
		response.write('>2</option>');
	}
	*/
	
	response.write('<option value="10"');
	
	if(myBrowseList.modelsPerPage == '10') {
		response.write('selected>10</option>');
	}else {
		response.write('>10</option>');
	}
	
	response.write('<option value="25"');
	
	if(myBrowseList.modelsPerPage == '25') {
		response.write('selected>25</option>');
	}else {
		response.write('>25</option>');
	}
	
	response.write('<option value="50"');
	
	if(myBrowseList.modelsPerPage == '50') {
		response.write('selected>50</option>');
	}else {
		response.write('>50</option>');
	}
	
	response.write('<option value="100"');
	
	if(myBrowseList.modelsPerPage == '100') {
		response.write('selected>100</option>');
	}else {
		response.write('>100</option>');
	}


	
	response.write('</select>');
	
	
	
	
	response.write('</td>');
	
	response.write('<td>');
	response.write('&nbsp;&nbsp;<input type="submit" value="Update">');
	response.write('</td>');
	response.write('</form>');

	response.write('<td>');
	response.write('&nbsp;');
	response.write('&nbsp;');
	response.write('&nbsp;');
	response.write('&nbsp;');
	response.write('&nbsp;');
	response.write('&nbsp;');
	response.write('&nbsp;');
	response.write('&nbsp;');
	response.write('</td>');
	//start of the search by keyword section
	response.write('<form action="' + actionLoc + '" method="get">');
	response.write('<input type="hidden" name="isSearch" value="Yes"/>');
	

	if(paramsGlobal.isNext != 'Yes' && paramsGlobal.isBack != 'Yes' && paramsGlobal.isSearch != 'Yes' && paramsGlobal.isFormData != 'Yes' && paramsGlobal.isBackBeginning != 'Yes'){
		searchString = ""; //clear search string on initial load or refresh
		search = false;
	}

	response.write('<td>');
	response.write('<input type="search" name="searchString" value="' + searchString + '"/>');
	response.write('</td>');

	response.write('<td>');
	response.write('<input type="submit" value="Search"/>');
	response.write('</td>');
	response.write('</form>');

	response.write('<form action="' + actionLoc + '" method="get">');
	response.write('<td>');
	response.write('<input type="hidden" name="isClearSearch" value="Yes"/>');
	response.write('<input type="submit" value="Clear Search"/>');
	response.write('</td>');
	response.write('</form>');

	response.write('</tr>');
	response.write('</table>');
	response.write('<br />');
	
	if(mgntExists) {
		//print extra mgnt options
		mgntInterface.printMgntOptions(response);
	}

	//print management interface
	if(mgntExists && myBrowseList.Mgnt == 'true') {
		console.log('Show the management GUI');
		if (paramsGlobal.isNext != 'Yes' && paramsGlobal.isBack != 'Yes') {
			mgntInterface.printMgnt(response, myBrowseList);
		}else {
			printUserInterface(response, myBrowseList, false);
		}
	}else if(mgntExists && myBrowseList.mgntLocal == 'true') {
		printUserInterface(response, myBrowseList, true);
	}else {
		printUserInterface(response, myBrowseList, false);
	}
}

function printUserInterface(response, myBrowseList, isMgntLocal) {
	//print table here
	response.write('<table class="browseTable">');
	numModelsPerPage = parseInt(myBrowseList.modelsPerPage);
	console.log('numModelsPerPage: ' + numModelsPerPage);
	if (isNaN(numModelsPerPage)) {
		console.log('isNaN: numModelsPerPage');
		numModelsPerPage = 25;
	}
	
	
	if(paramsGlobal.isNext == 'Yes' || paramsGlobal.isBack == 'Yes' || paramsGlobal.isBackBeginning) {
		console.log('isNext or isBack');
		startingIndex = parseInt(paramsGlobal.localStartingIndex);
		endingIndex = parseInt(paramsGlobal.localEndingIndex);
		
		startingIndexGCS = parseInt(paramsGlobal.gcsStartingIndex);
		endingIndexGCS = parseInt(paramsGlobal.gcsEndingIndex);
		leftOverSpots = numModelsPerPage;
	}else {
		startingIndex = 0;
		endingIndex = startingIndex + (numModelsPerPage - 1);
		
		startingIndexGCS = 0;
		leftOverSpots = numModelsPerPage;
		endingIndexGCS = startingIndex + (leftOverSpots - 1);
		console.log("INITIAL LOAD ending: " + endingIndexGCS);
	}

	
	//console.log('Start: ' + startingIndex + ' End: ' + endingIndex);
	//console.log('Start GCS: ' + startingIndexGCS + ' End GCS: ' + endingIndexGCS);
	
	
	
	if(myBrowseList.Local == 'true') {
		loadingLocal = true;
		loadLocal(response, myBrowseList, isMgntLocal); //load only when local check box is checked
	}
	
	if(myBrowseList.iBox == 'true') {
		loadingGCS = true;
		if(paramsGlobal.isNext == 'Yes' || paramsGlobal.isBack == 'Yes') {

			//if (startingIndexGCS != endingIndexGCS) {
			if (showGCS) {
				loadGCS3(); //go straight to printing models to the page, no need to load json and generate array and urls
			}else {
				if (!mainEndCalled) {
					localAndGCSEnd(response2);
				}
			}
		}else {
			//if (leftOverSpots == 0) {
			//	showGCS = false;
			//} else {
				endingIndexGCS = startingIndexGCS + (leftOverSpots - 1);
			//}
			//console.log("INITIAL LOAD ending 2: " + endingIndexGCS);
			loadGCS(response); //load only when checkbox is checked
		}
	}
}

var loadLocal1CanContinue = false;
function loadLocal(response, myBrowseList, isMgntLocal) {
	var pathToModels = '/home/pi/ibox/www/packages/expanded/';
	if(isMgntLocal) {
		pathToModels = '/home/pi/ibox/www/packages/mgnt/expanded/';
	}

	var modelList = fs.readdirSync(pathToModels);
	console.log('modelList: ' + modelList);
	console.log('modelList length: ' + modelList.length);


	if (modelList.length == 0) {
				loadLocal1CanContinue = true;
				if (!mainEndCalled && (myBrowseList.iBox != 'true')) {

					//call end, no local models
					response2.write('<tr>');
		
					response2.write('<td>');
		
					response2.write('<table class="wrapperTable" width="850px" style="color: #c6c6c6">');
					response2.write('<tr>');
					response2.write('<td align="center">');
					response2.write('There is currenty no local models!');
					response2.write('</td>');
					response2.write('</tr>');
					response2.write('</table>');

					response2.write('</td>');
					response2.write('</tr>');
					showBackButton = false;
					showNextButton = false;
					localAndGCSEnd(response); //need to do here only if loadGCS() is NOT going to be called afterwards
				}
	}else {



	for(i=0; i<modelList.length; i++) {
		var modelPath = pathToModels + modelList[i];
		var fileExists = false;
		try {
			var stats = fs.statSync(modelPath + '/_model.json');
			fileExists = true;
			if(modelList[i] == ".AppleDouble" || modelList[i] == ".DS_Store") {
				console.log('ERR : ignore files named [' + modelList[i] + ']');
				fileExists = false;
			}
		}
		catch (errs) {
			fileExists = false;
			//console.log('Error: ' + errs.code);
			if ((errs.code=='ENOENT') || (errs.code=='ENOTDIR')) {
				//file doesn't exist
        		console.log("File doesn't exists: " + modelPath + "/_model.json");
			}else {
				//something else happend
				console,log('Something Else Happened');
				console.log(errs.code);
			}
		}
		
		
		
		
		stat = fs.lstatSync(modelPath);
		if(stat.isDirectory() && (!stat.isFile()) && (fileExists)) {
			console.log(modelList[i] + ' Is a directory!');

			strFile_Path = pathToModels + modelList[i] + '/_model.json';
			if ( fs.existsSync( strFile_Path ) ) {
	    		data = fs.readFileSync(strFile_Path) //  T2
	    		console.log("myList_Load : readFileSync=",strFile_Path)
	    		try {
		    		var myMetaList = JSON.parse(data);
		    			//fs.closeSync(data)
		    			//console.log(myList);
		    		localModelList.push(myMetaList);
	    		}catch(err){
	    			console.log('There is an error in the JSON ' + strFile_Path)
	    			//  We should likely delete the entire DIR then RETURN
	    			//  Delete the file that is not loading
	    			console.log('we will be deleting or renaming the _models.json as to not load it in the future')
	    			fs.rename(strFile_Path, strFile_Path + '_backupERR')
	    			return;
	    		}



				//continue
				//localModelList.push(modelList[i]); //adds each model to the array
				if(i == (modelList.length - 1)) {
					//this is the last iteration
					loadLocal1CanContinue = true;
					/*
					if (startingIndex != endingIndex) {
						loadLocal1(response, myBrowseList);
						console.log('called');
					}
					*/
				}
			}
		}else {
			//it is not a directory
			console.log(modelList[i] + ' is not a directory');
		}



		if(i == (modelList.length - 1)) {
			if (localModelList.length == 0) {
				loadLocal1CanContinue = true;
				if (!mainEndCalled && (myBrowseList.iBox != 'true')) {

					//call end, no local models
					response2.write('<tr>');
		
					response2.write('<td>');
		
					response2.write('<table class="wrapperTable" width="850px" style="color: #c6c6c6">');
					response2.write('<tr>');
					response2.write('<td align="center">');
					response2.write('There is currenty no local models!');
					response2.write('</td>');
					response2.write('</tr>');
					response2.write('</table>');

					response2.write('</td>');
					response2.write('</tr>');
					showBackButton = false;
					showNextButton = false;
					localAndGCSEnd(response); //need to do here only if loadGCS() is NOT going to be called afterwards
				}
			}		
		}
	}
	//console.log('localModelList: ' + localModelList);
	//if (startingIndex != endingIndex) {
		loadLocal1(response, myBrowseList, isMgntLocal);
	//}

}

}

var startingIndex = 0;
var endingIndex = 0;


function loadLocal1(response, myBrowseList, isMgntLocal) {
	if(loadLocal1CanContinue) {

			if (search) {
				searchLocal();
			}
			sortLocalByOrder();
			//console.log('startingLOCAL: ' + startingIndex);
			//console.log('endingLOCAL: ' + endingIndex);
			//console.log('Local length: ' + localModelList.length);
			//console.log("length: " + localModelList.length);
			if(endingIndex >= localModelList.length) {
				endingIndex = localModelList.length - 1;
			}
			for(i=startingIndex; i<=endingIndex; i++) {
			//get meta data from json
			//  Load json IBF List FILE

			loadLocal2(localModelList[i], isMgntLocal); // puts "myMetaList" through as a parameter
			leftOverSpots--;

			/* 
  			try {  
  				strFile_Path = '/home/pi/ibox/www/packages/expanded/' + localModelList[i] + '/_model.json';
    			data = fs.readFileSync(strFile_Path) //  T2
    			console.log("myList_Load : readFileSync=",strFile_Path)
    			var myMetaList = JSON.parse(data);
    			//fs.closeSync(data)
    			//console.log(myList);
    			
  			}
  			catch (err) {
    			console.log('There has been an error parsing your JSON. : myList')
    			console.log(err);
			}
			*/
			}
		if (!mainEndCalled && (myBrowseList.iBox != 'true')) {
			localAndGCSEnd(response); //need to do here only if loadGCS() is NOT going to be called afterwards
		}
	}else {
		loadLocal1(response, myBrowseList, isMgntLocal);
	}
}

function loadLocal2(myMetaList, isMgntLocal) {
		//print to table
		response2.write('<tr>');
		
		//below is local text on left column
		/*
		response2.write('<td align="left" valign="top">');
		response2.write('<div class="localText">Local</div>');
		response2.write('</td>');
		*/
		
		response2.write('<td>');
		
		response2.write('<table class="wrapperTable">');
		response2.write('<tr>');
		response2.write('<td>');
		//in here is going to be content of model
		
		response2.write('<table style="color: #c6c6c6" class="metaDataTableLocal">');
		response2.write('<tr>');
		response2.write('<td style="font-size: 13pt">');
		response2.write('<b>' + myMetaList.model_name + '</b>');
		response2.write('</td>');
		
		response2.write('<td colspan="2" style="font-size: 13pt" align="right">');
		var localPathToDownload = 'packages/compressed/';
		if(isMgntLocal) {
			localPathToDownload = 'packages/mgnt/compressed/';
		}
		response2.write('<div align="right"><a href="' + strApacheRootLink + localPathToDownload + myMetaList.model_file_name + '.zip">Download</a></div>');
		response2.write('</td>');
		response2.write('</tr>');
		
		/*
		response2.write('<tr>');
		response2.write('<td colspan="3">');
		response2.write('<a href="' + strApacheRootLink + 'packages/compressed/' + myMetaList.model_file_name + '.zip">Download</a>');
		response2.write('</td>');
		response2.write('</tr>');
		*/
		
		response2.write('<tr>');
		response2.write('<td colspan="2">');
		response2.write(myMetaList.model_description);
		response2.write('</td>');
		response2.write('</tr>');
		
		response2.write('<tr>');
		response2.write('<td colspan="2">');
		response2.write('Created by: ' + myMetaList.author_name);
		response2.write('</td>');
		response2.write('</tr>');

		response2.write('<tr>');
		response2.write('<td colspan="2">');
		response2.write('Added Date: ' + myMetaList.model_creation_date + '<br />');
		response2.write('</td>');
		response2.write('</tr>');
		
		response2.write('<tr>');
		response2.write('<td>');
		response2.write('Creation Date: ' + myMetaList.license_date);
		response2.write('</td>');

		response2.write('<td align="right">');
		if(myMetaList.layer_count != "-1") {
			var layerCount = parseFloat(myMetaList.layer_count);
			var exposureTime = parseFloat(myMetaList.exposure_time);
			var printTime = Math.round((((exposureTime + 10) * layerCount) / 60));
			response2.write('<div align="right">Estimated Print Time: ' + printTime + ' min</div>');
		} else {
			response2.write('&nbsp;');
		}
		response2.write('</td>');

		response2.write('</tr>');
		
		response2.write('<tr>');
		response2.write('<td>');
		response2.write('Star Count:&nbsp;');
		/*
		for(i=0; i<parseInt(myMetaList.star_count_public); i++) {
			response2.write('<img src="' + strFullPath + '/star.png"/>');
		}
		*/
		if(myMetaList.star_count_public == '1') {
			response2.write('<img src="' + strFullPath + 'star.png"/>');
		}else if(myMetaList.star_count_public == '2') {
			response2.write('<img src="' + strFullPath + 'star.png"/>');
			response2.write('<img src="' + strFullPath + 'star.png"/>');
		}else if(myMetaList.star_count_public == '3') {
			response2.write('<img src="' + strFullPath + 'star.png"/>');
			response2.write('<img src="' + strFullPath + 'star.png"/>');
			response2.write('<img src="' + strFullPath + 'star.png"/>');
		}else if(myMetaList.star_count_public == '4') {
			response2.write('<img src="' + strFullPath + 'star.png"/>');
			response2.write('<img src="' + strFullPath + 'star.png"/>');
			response2.write('<img src="' + strFullPath + 'star.png"/>');
			response2.write('<img src="' + strFullPath + 'star.png"/>');
		}else if(myMetaList.star_count_public == '5') {
			response2.write('<img src="' + strFullPath + 'star.png"/>');
			response2.write('<img src="' + strFullPath + 'star.png"/>');
			response2.write('<img src="' + strFullPath + 'star.png"/>');
			response2.write('<img src="' + strFullPath + 'star.png"/>');
			response2.write('<img src="' + strFullPath + 'star.png"/>');
		}else {
			response2.write(myMetaList.star_count_public);
		}
		
		response2.write('</td>');

		response2.write('<td align="right">');
		if(myMetaList.layer_count != "-1") {
			response2.write('<div align="right">Layer Count: ' + myMetaList.layer_count + '</div>');
		}else {
			response2.write('&nbsp;');
		}
		response2.write('</td>');

		response2.write('</tr>');
		
		response2.write('<tr>');
		response2.write('<td align="center">');
		response2.write('<table>');
		response2.write('<tr>');
		if(!isMgntLocal) {
			response2.write('<form action="/select_file_to_print" method="get">');
			response2.write('<td width="100px" valign="top">');
			response2.write('<input type="hidden" name="file_name" value="' + myMetaList.model_file_name + '">');
			response2.write('&nbsp;&nbsp;<input type="submit" value="Select">');
			response2.write('</td>');
			response2.write('</form>');
		}else {
			//add button here for move model to local directory
			response2.write('<form action="/button_browse/copyToLocal" method="get">');
			response2.write('<td width="100px" valign="top">');
			response2.write('<input type="hidden" name="file_name" value="' + myMetaList.model_file_name + '">');
			response2.write('&nbsp;&nbsp;<input type="submit" value="Copy to Local Dir">');
			response2.write('</td>');
			response2.write('</form>');
		}
		
		
		response2.write('<form action="/button_browse/delete" method="get">');
		response2.write('<td width="100px" valign="top">');
		response2.write('<input type="hidden" name="isDelete" value="Yes">');
		if(isMgntLocal) {
			response2.write('<input type="hidden" name="mgntLocalFile" value="Yes">');
		}
		response2.write('<input type="hidden" name="modelName" value="' + myMetaList.model_file_name + '">');
		response2.write('&nbsp;&nbsp;<input type="submit" class="deleteButton" value="Delete">');
		response2.write('</td>');
		response2.write('</form>');
		
		
		if(!isMgntLocal) {
			response2.write('<form action="/print" method="get">');
			response2.write('<td valign="top">');
			response2.write('<input type="hidden" name="file_name" value="' + myMetaList.model_file_name + '">');
			response2.write('&nbsp;&nbsp;<input type="submit" value="Print">');
			response2.write('</td>');
			response2.write('</form>');
		}else {
			//add button here for transfer to iBox cloud downloads
			response2.write('<form action="/button_browse/transferToCloud" method="get">');
			response2.write('<td valign="top">');
			response2.write('<input type="hidden" name="file_name" value="' + myMetaList.model_file_name + '">');
			response2.write('&nbsp;&nbsp;<input type="submit" value="Transfer to iBox Cloud">');
			response2.write('</td>');
			response2.write('</form>');
		}
		
		
		response2.write('</tr>');
		response2.write('</table>');
		response2.write('</td>');

		response2.write('<td align="right" valign="top">');

		if(isMgntLocal) {
			response2.write('<div class="localText">Mgnt Local</div>');
		}else {
			response2.write('<div class="localText">Local</div>');
		}
		response2.write('</td>');

		response2.write('</tr>');
		response2.write('</table>');
		
		
    	response2.write('</td>');
		
		
		response2.write('<td>');

		var localPathToImage = 'model_images/';
		if(isMgntLocal) {
			localPathToImage = 'model_images/mgnt/';
		}
		
		//in here is going to be thumbnail of model
		//console.log('urlArr[' + i +']: ' + urlArr[i]);
		response2.write('<a href="' + strApacheRootLink + localPathToImage + myMetaList.model_file_name + '.jpg"><img src="' + strApacheRootLink + localPathToImage + myMetaList.model_file_name + '.jpg" height="' + height + '"/></a>');
		
		response2.write('</td>');
		
		
		
		response2.write('</tr>');
		response2.write('</table>');
		
		
		
		response2.write('</td>');
		
		/*old delete column on the right side with trash bin
		response2.write('<td align="center" valign="middle">');
		//delete local model
		
		response2.write('<form action="/button_browse/delete" method="get">');
		response2.write('<input type="hidden" name="isDelete" value="Yes">');
		response2.write('<input type="hidden" name="modelName" value="' + myMetaList.model_name + '">');
		response2.write('&nbsp;&nbsp;<input type="submit" class="deleteButton" value="Delete">');
		response2.write('</form>');
		
		response2.write('</td>');
		*/
		
		response2.write('</tr>');
		numModelsOnPage++;
			
}

function downloadModel() {
	//console.log('in Download');
	
	try {
		// Reference an existing bucket.
		var bucket = storage.bucket('bucket_nano_ibf_packages_download');
		var packageName = modelToDownload + '.zip';
		//bucket.file(packageName).createReadStream().pipe(fs.createWriteStream('/home/pi/ibox/www/packages/compressed/' + modelToDownload + '.zip'));
		
		bucket.file(packageName).createReadStream()
			.on('complete', function() {
    			console.log('Package readstream complete');
  			})
  			.on('error', function() {
  				console.log('There was an error trying to access the iBox Cloud file.');
  				response2.write('<div class="divColor">There was an error trying to access the iBox Cloud file. Please try downloading again.</div>');
  				response2.write('<br />');
				response2.write('<table>');
				response2.write('<tr>');
				response2.write('<td width="100px">');
		
				response2.write('<form action="/button_browse" method="get">');
				response2.write('<input type="hidden" name="isDownload" value="Yes">');
				response2.write('<input type="hidden" name="modelName" value="' + modelToDownload + '">');
				response2.write('&nbsp;&nbsp;<input type="submit" value="Download Again">');
				response2.write('</form>');
		
				response2.write('</td>');
				response2.write('</tr>');
				response2.write('</table>');
				mainEnd(response2);
  			})
			.pipe(fs.createWriteStream('/home/pi/ibox/www/packages/compressed/' + modelToDownload + '.zip'))
			.on('finish', function() {
				console.log('Package fully downloaded.');

    			//can proceed to unzipping
				console.log('Model ' + modelToDownload + ' is fully downloaded.');
				//response2.write('<div style="color:grey">Model ' + modelToDownload + ' is fully downloaded.</div>');
			
				response2.write('<head>');
				response2.write('<META http-equiv="refresh" content="0;URL=/browse/downloading2">');
				response2.write('</head>');
			
				response2.write('</center>');
				response2.write('</body>');
				response2.write('</html>');
				response2.end();
			});
	
		var bucket2 = storage.bucket('bucket_nano_ibf_images_download');
		var imageName = modelToDownload + '.jpg';
		//bucket2.file(imageName).createReadStream().pipe(fs.createWriteStream('/home/pi/ibox/www/model_images/' + modelToDownload + '.jpg'));

		bucket2.file(imageName).createReadStream()
			.on('complete', function() {
				console.log('Image readstream complete.');
			})
			.on('error', function() {
  				console.log('There was an error trying to access the iBox Cloud file.');
  				response2.write('<div class="divColor">There was an error trying to access the iBox Cloud file. Please try downloading again.</div>');
  				response2.write('<br />');
				response2.write('<table>');
				response2.write('<tr>');
				response2.write('<td width="100px">');
		
				response2.write('<form action="/button_browse" method="get">');
				response2.write('<input type="hidden" name="isDownload" value="Yes">');
				response2.write('<input type="hidden" name="modelName" value="' + modelToDownload + '">');
				response2.write('&nbsp;&nbsp;<input type="submit" value="Download Again">');
				response2.write('</form>');
		
				response2.write('</td>');
				response2.write('</tr>');
				response2.write('</table>');
				mainEnd(response2);
  			})
			.pipe(fs.createWriteStream('/home/pi/ibox/www/model_images/' + modelToDownload + '.jpg'))
			.on('finish', function() {
				console.log('Image fully downloaded.');
			});

		//setTimeout(downloadCallBack, 1);
	} catch (err) {
		response2.write('The model can not be found on the server.');
		response2.write('<form action="/button_browse" method="get">');
		response2.write('<input type="submit" value="Back to Browse Page"/>');
		response2.write('</form>');
		response2.write('</center>');
		response2.write('</body>');
		response2.write('</html>');
		response2.end();
	}
	
}

function loadGCS(response) {
	//console.log('in GCS');

	var bucket = storage.bucket('bucket_nano_ibf_metadata_download');
		bucket.file('_list.json').getMetadata(function(err, metadata, apiResponse) {
			if(err == null) {
				console.log('Meta data from gcloud received.');
				var myTime_TMP = Math.floor((new Date).getTime()/1000);
				try {
					console.log('Last Update Time: ' + metadata.metadata.lastUpdateTime);
				}
				catch(err) {
					console.log('metadata.metadata.lastUpdateTime does not exist, manually add it with value [' + myTime_TMP + ']. This is likely because iBox had to manually change the _list.json, thus it is missing metadata')
					return; //  TRENT 5/10/2015
				}
				

				var myTime = Math.floor((new Date).getTime()/1000);
				//seconds
				var continueOn = false;

					try {
			var stats = fs.statSync('/home/pi/ibox/www/packages/_list.json');
			var stats2 = fs.statSync('/home/pi/ibox/www/packages/_listTime.json');
			continueOn = false;
			try {  
  				strFile_Path = '/home/pi/ibox/www/packages/_listTime.json';
    			data = fs.readFileSync(strFile_Path) //  T2
    			console.log("myListTime_Load : readFileSync=",strFile_Path)
    			var myListTime = JSON.parse(data);

    			if(parseInt(metadata.metadata.lastUpdateTime) > parseInt(myListTime.Time)) {
    				continueOn = true;
    			}else {
    				continueOn = false;
    			}

				//6*60*60 will reload json every six hours
				/*
				if(Math.abs(myTime - parseInt(myListTime.Time)) > (6*60*60)) {
					continueOn = true;
				}else {
					continueOn = false;
				}
				*/
  			}
  			catch (err) {
    			console.log('There has been an error parsing your JSON. : listTime')
    			console.log(err);
  			}
			
		}
		catch (errs) {
			if ((errs.code=='ENOENT') || (errs.code=='ENOTDIR')) {
        		console.log("One of the files wasn't there, continue on");
				continueOn = true;
			}else {
				//something else happend
				console,log('Something Else Happened');
				console.log(errs.code);
			}
		}





		if(continueOn) {
		// Reference an existing bucket.
		var bucket = storage.bucket('bucket_nano_ibf_metadata_download');
		bucket.file('_list.json').createReadStream()
			.on('complete', function() {
				console.log('Readstream complete');
			})
			.on('error', function() {
  				console.log('There was an error trying to access the iBox Cloud _list.json file.');
  				response2.write('<div class="divColor">There was an error trying to access the iBox Cloud _list.json file. Please try refreshing the page.</div>');
  				response2.write('<br />');
				mainEnd(response2);
  			})
			.pipe(fs.createWriteStream('/home/pi/ibox/www/packages/_list.json'))
			.on('finish', function(){
				console.log('_list.json fully downloaded.');
				var myCurrentTime = Math.floor((new Date).getTime()/1000);
				var listTimeString = '{\n  "Time": "' + myCurrentTime + '"\n}';
		
				fs.writeFileSync("/home/pi/ibox/www/packages/_listTime.json", listTimeString);
			
				console.log('Going to try loading json file');
				myList_Load(response2); //load the json file
				//setTimeout(myList_Load(response), 10000);
				console.log('Should Be Finished with everything');
				whileStop = false;
				lastFileSize = 0;
			});

		//setTimeout(callBack, 1);
	}else {
		myList_Load(response2); //load the json file
	}


			}else {
				response2.write('<br /><div class="divColor">There was an error getting the list file from iBox Cloud.</div>');
				response2.end();
			}
			
		});
}

var whileStopDownload = true;
var downloadExistsYet = false;
var lastFileSizeDownload = 0;
var lastFileSizeDownload2 = 0;
//now using gcloud callback
/*
var downloadCallBack = function downloadWait() {
	console.log('waiting');
	//response2.write('<div style="color:grey">waiting</div>');
	var stats;
	try {
		stats = fs.statSync('/home/pi/ibox/www/packages/compressed/' + modelToDownload + '.zip');
		downloadExistsYet = true;
	} catch(err) {
		if (err.code=='ENOENT') {
			console.log("The file doesn't exist yet.");
			//response2.write("<div style='color:grey'>The file doesn't exist yet.</div>");
			console.log("Keep Waiting");
			//response2.write('<div style="color:grey">Keep Waiting</div>');
			downloadExistsYet = false;
			setTimeout(downloadCallBack, 500);
		}else {
			console.log(err.code);
			downloadExistsYet = false;
		}
	}
	if (whileStopDownload && downloadExistsYet) {
		console.log('The file size is: ' + stats["size"]);
		//response2.write('<div style="color:grey">The file size is: ' + stats["size"] + '</div>');
		if ((stats["size"] > 0) && (stats["size"] == lastFileSizeDownload) && (stats["size"] == lastFileSizeDownload2)) {
			//can proceed to unzipping
			console.log('Model ' + modelToDownload + ' is fully downloaded.');
			//response2.write('<div style="color:grey">Model ' + modelToDownload + ' is fully downloaded.</div>');
			
			response2.write('<head>');
			response2.write('<META http-equiv="refresh" content="0;URL=/browse/downloading2">');
			response2.write('</head>');
			
			response2.write('</center>');
			response2.write('</body>');
			response2.write('</html>');
			response2.end();
			
			
			//extractZip();
			whileStopDownload = false;
			lastFileSizeDownload = 0;
			lastFileSizeDownload2 = 0;
		}
		lastFileSizeDownload2 = lastFileSizeDownload;
		lastFileSizeDownload = stats["size"];
		if (whileStopDownload) {
			console.log("Keep Waiting");
			//response2.write('<div style="color:grey">Keep Waiting</div>');
			setTimeout(downloadCallBack, 500);
		}
	}
}
*/


var AdmZip = require('adm-zip');
var zip;
function extractZip() {
	
	try{
			zip = new AdmZip("/home/pi/ibox/www/packages/compressed/" + modelToDownload + ".zip");
			console.log(modelToDownload + ' is extracting into expanded directory.');
	
	
			response2.write('<head>');
			response2.write('<META http-equiv="refresh" content="0;URL=/browse/downloading3">');
			response2.write('</head>');
			response2.write('</center>');
			response2.write('</body>');
			response2.write('</html>');
			response2.end();
		}catch(err) {
			console.log('There was an error trying to extract compressed download.');
			console.log('Error Code: ' + err.code);
			//response2.write('<div style="color:grey">Error Code: ' + err.code + '</div>');
			response2.write('<div style="color:grey">There was an error trying to extract the downloaded model "' + modelToDownload + '". Please try downloading the model again.</div>');
			
			response2.write('<br />');
			response2.write('<table>');
			response2.write('<tr>');
			response2.write('<td width="100px">');
		
			response2.write('<form action="/button_browse" method="get">');
			response2.write('<input type="hidden" name="isDownload" value="Yes">');
			response2.write('<input type="hidden" name="modelName" value="' + modelToDownload + '">');
			response2.write('&nbsp;&nbsp;<input type="submit" value="Download Again">');
			response2.write('</form>');
		
			response2.write('</td>');
			/*
			response2.write('<td>');
		
			response2.write('<form action="/button_browse" method="get">');
			response2.write('<input type="hidden" name="isDownloadPrint" value="Yes">');
			response2.write('<input type="hidden" name="modelName" value="' + modelToDownload + '">');
			response2.write('&nbsp;&nbsp;<input type="submit" value="Download and Print Again">');
			response2.write('</form>');
		
			response2.write('</td>');
			*/
			response2.write('</tr>');
			response2.write('</table>');
			response2.end();
			
		}
	
	

	
	
	//zip.extractAllTo(/*target path*/"/home/pi/ibox/www/packages/expanded/" + modelToDownload + "/", /*overwrite*/true);
	/*
	console.log('Finished extracting: ' + modelToDownload);
	
	response2.write('<head>');
	response2.write('<META http-equiv="refresh" content="0;URL=/browse/downloading4">');
	response2.write('</head>');
	response2.write('</center>');
	response2.write('</body>');
	response2.write('</html>');
	response2.end();
	*/
}

var whileStop = true;
var listExistsYet = false;
var lastFileSize = 0;

//uses gcloud callback now
/*
var callBack = function wait() {
	console.log('waiting');
	try {
		var stats = fs.statSync('/home/pi/ibox/www/packages/_list.json');
		listExistsYet = true;
	} catch(err) {
		if (err.code=='ENOENT') {
			console.log("The file doesn't exist yet.");
			console.log("Keep Waiting");
			listExistsYet = false;
			setTimeout(callBack, 500);
		}else {
			console.log(err.code);
			listExistsYet = false;
		}
	}
	if (whileStop && listExistsYet) {
		console.log('The file size is: ' + stats["size"]);
		if ((stats["size"] > 0) && stats["size"] == lastFileSize) {
			
			var myCurrentTime = Math.floor((new Date).getTime()/1000);
			var listTimeString = '{\n  "Time": "' + myCurrentTime + '"\n}';
		
			fs.writeFileSync("/home/pi/ibox/www/packages/_listTime.json", listTimeString);
			
			console.log('Going to try loading json file');
			myList_Load(response2); //load the json file
			//setTimeout(myList_Load(response), 10000);
			console.log('Should Be Finished with everything');
			whileStop = false;
			lastFileSize = 0;
		}
		if (whileStop) {
			console.log("Keep Waiting");
			setTimeout(callBack, 500);
		}
		lastFileSize = stats["size"];
	}
}
*/

function loadGCS2(response) {

	//  Adding general Try Catch -> Andre should clean this up. Crashes at 1626 TypeError: Cannot set property 'url' of undefined
	try {



		//console.log('in GCS2');
		for (i = 0; i < myList.models.length; i++) {
			urlCreated[i] = false;
		}
		
		for (i = 0; i < myList.models.length; i++) {
			thumbLoopCounter = i;
			modelName = myList.models[i].model_file_name;
			thumbNameJPG = modelName + '.jpg';
			//remote method
			var bucketThumbs = storage.bucket('bucket_nano_ibf_images_download');
			bucketThumbs.file(thumbNameJPG).getSignedUrl({
	  			action: 'read',
	  			expires: Math.round(Date.now() / 1000) + (60 * 30)
			}, function(err, urlReturn) {
				if(err == null) {
					myList.models[nextThumbSlot].url = urlReturn; //urlArr[nextThumbSlot] = url; edited to help search and ordering
					urlCreated[nextThumbSlot] = true;
					nextThumbSlot++;
				}else {
					console.log('There was an error getting the thumbnail urls.');
					response2.write("<br /><div class='divColor'>There was an error generating thumbnail URL's. Please try refreshing the page.");
					response2.end();
					killIsURLCreated = true;
				}
					
				});
			//should expire in 30 minutes
			//expires: Math.round(Date.now() / 1000) + (60 * 60 * 24 * 14) // 2 weeks.
		}
		setTimeout(isURLCreated, 100);

		}catch(err){
		console.log(err.code);
	} //  try catch
	
}

var killIsURLCreated = false;
var isURLCreated = function urlCheck() {
	var allTrue = false;
	//console.log(urlCreated.length);
	for (j = 0; j < urlCreated.length; j++) {
		//console.log('value: ' + urlCreated);
		if(urlCreated[j] == true) {
			//console.log('all True set to true at i val:' + j);
			allTrue = true;
		}else {
			//console.log('all True set to false at i val:' + j);
			allTrue = false;
		}
		
		
		if(j == (urlCreated.length - 1)) {
			//last iteration
			if(allTrue) {
				console.log('All True');
				//console.log('starting: ' + startingIndexGCS);
				//console.log('ending: ' + endingIndexGCS);
				//break out and continure on
				if (showGCS) {
					//console.log('load GCS 3');
					loadGCS3();
				}else {
					if (!mainEndCalled) {
						localAndGCSEnd(response2);
					}
				}
			}else {
				console.log('url check failed');
				console.log('allTrue: ' + allTrue);
				if (!killIsURLCreated) {
					setTimeout(isURLCreated, 500);
				}
			}
		}
	}
}


var startingIndexGCS = 0;
var endingIndexGCS = 0;
var leftOverSpots = 0;
//myList.models.length
function loadGCS3() {

	if (search) {
		searchGCS();
	}
	//sort myList.models by variable order before printing
	sortGCSByOrder();

	
	if (endingIndexGCS >= myList.models.length) {
		endingIndexGCS = myList.models.length - 1;
	}
	

	//console.log('starting: ' + startingIndexGCS);
	//console.log('ending: ' + endingIndexGCS);
	//going to loop number of models that should be displayed on the page at one time (not 5)
	for (i = startingIndexGCS; i <= endingIndexGCS; i++) {
		gcsLoopNum = i;
		response2.write('<tr>');
		
		//below is remote text in left column
		/*
		response2.write('<td align="left" valign="top">');
		response2.write('<div class="remoteText">Remote</div>');
		response2.write('</td>');
		*/
		response2.write('<td>');
		
		
		response2.write('<table class="wrapperTable">');
		response2.write('<tr>');
		response2.write('<td>');
		//in here is going to be content of model
		//response.write('information about model goes here');
		
		response2.write('<table style="color: #c6c6c6" class="metaDataTableGCS">');
		response2.write('<tr>');
		response2.write('<td colspan="2" style="font-size: 13pt">');
		response2.write('<b>' + myList.models[i].model_name + '</b>');
		response2.write('</td>');
		response2.write('</tr>');
		
		response2.write('<tr>');
		response2.write('<td colspan="2">');
		response2.write(myList.models[i].model_description);
		response2.write('</td>');
		response2.write('</tr>');
		
		response2.write('<tr>');
		response2.write('<td colspan="2">');
		response2.write('Created by: ' + myList.models[i].author_name);
		response2.write('</td>');
		response2.write('</tr>');
		
		response2.write('<tr>');
		response2.write('<td colspan="2">');
		response2.write('Added Date: ' + myList.models[i].model_creation_date + '<br />');
		response2.write('</td>');
		response2.write('</tr>');

		response2.write('<tr>');
		response2.write('<td>');
		response2.write('Creation Date: ' + myList.models[i].license_date);
		response2.write('</td>');
		response2.write('<td align="right">');
		if(myList.models[i].layer_count != "-1") {
			var layerCount = parseFloat(myList.models[i].layer_count);
			var exposureTime = parseFloat(myList.models[i].exposure_time);
			var printTime = Math.round((((exposureTime + 10) * layerCount) / 60));
			response2.write('<div align="right">Estimated Print Time: ' + printTime + ' min</div>');
		} else {
			response2.write('&nbsp;');
		}
		response2.write('</td>');
		response2.write('</tr>');
		
		response2.write('<tr>');
		response2.write('<td>');
		
		response2.write('Star Count: ');
		if(myList.models[i].star_count_public == '1') {
			response2.write('<img src="' + strFullPath + 'star.png"/>');
		}else if(myList.models[i].star_count_public == '2') {
			response2.write('<img src="' + strFullPath + 'star.png"/>');
			response2.write('<img src="' + strFullPath + 'star.png"/>');
		}else if(myList.models[i].star_count_public == '3') {
			response2.write('<img src="' + strFullPath + 'star.png"/>');
			response2.write('<img src="' + strFullPath + 'star.png"/>');
			response2.write('<img src="' + strFullPath + 'star.png"/>');
		}else if(myList.models[i].star_count_public == '4') {
			response2.write('<img src="' + strFullPath + 'star.png"/>');
			response2.write('<img src="' + strFullPath + 'star.png"/>');
			response2.write('<img src="' + strFullPath + 'star.png"/>');
			response2.write('<img src="' + strFullPath + 'star.png"/>');
		}else if(myList.models[i].star_count_public == '5') {
			response2.write('<img src="' + strFullPath + 'star.png"/>');
			response2.write('<img src="' + strFullPath + 'star.png"/>');
			response2.write('<img src="' + strFullPath + 'star.png"/>');
			response2.write('<img src="' + strFullPath + 'star.png"/>');
			response2.write('<img src="' + strFullPath + 'star.png"/>');
		}else {
			response2.write(myList.models[i].star_count_public);
		}
		
		
		//response2.write('Star Count: ' + myList.models[i].star_count_public);
		response2.write('</td>');
		response2.write('<td align="right">');
		
		
		if(myList.models[i].layer_count != "-1") {
			response2.write('<div align="right">Layer Count: ' + myList.models[i].layer_count + '</div>');
		}
		
		response2.write('</td>');
		response2.write('</tr>');
		
		response2.write('<tr>');
		response2.write('<td align="center">');
		response2.write('<table>');
		response2.write('<tr>');
		
		
		
		response2.write('<td width="100px">');
		
		response2.write('<form action="/button_browse" method="get">');
		response2.write('<input type="hidden" name="isDownload" value="Yes">');
		response2.write('<input type="hidden" name="modelName" value="' + myList.models[i].model_file_name + '">');
		response2.write('&nbsp;&nbsp;<input type="submit" value="Download">');
		response2.write('</form>');
		
		response2.write('</td>');
		response2.write('<td>');
		
		response2.write('<form action="/button_browse" method="get">');
		response2.write('<input type="hidden" name="isDownloadPrint" value="Yes">');
		response2.write('<input type="hidden" name="modelName" value="' + myList.models[i].model_file_name + '">');
		response2.write('&nbsp;&nbsp;<input type="submit" value="Download and Print">');
		response2.write('</form>');
		
		response2.write('</td>');
		
		
		response2.write('</tr>');
		response2.write('</table>');
		response2.write('</td>');

		response2.write('<td align="right" valign="top">');
		response2.write('<div class="remoteText">iBox Cloud</div>');
		response2.write('</td>');
		response2.write('</tr>');
		response2.write('</table>');
		
		
    	response2.write('</td>');
		
		
		// to add trash bin on right side back in for local, ' colspan="2"' needs to be added to the line below
		response2.write('<td>');
		
		//in here is going to be thumbnail of model
		//console.log('urlArr[' + i +']: ' + urlArr[i]);
		//response2.write('<a href="' + urlArr[i] + '"><img src="' + urlArr[i] + '" height="' + height + '"/></a>'); edited to help search and ordering
		response2.write('<a href="' + myList.models[i].url + '"><img src="' + myList.models[i].url + '" height="' + height + '"/></a>');
		
		response2.write('</td>');
		
		
		response2.write('</tr>');
		response2.write('</table>');
		
		response2.write('</td>');
		
		response2.write('</tr>');
		numModelsOnPage++;
		
		//local method
		/*
		thumbPath = "/home/pi/ibox/www/model_thumbnails/" + myList.models[i].model_name + ".jpg";
		var fileExists = false;
		
		try {
			var stats = fs.statSync(thumbPath);
			fileExists = true;
		} catch(err) {
			fileExists = false;
			if (err.code=='ENOENT') {
				//file doesn't exist
        		console.log("File doesn't exists");
				console.log(thumbNameJPG);
			}else {
				//something else happend
				console,log('Something Else Happened');
				console.log(err.code);
			}
		}
		
			if(fileExists) {
				//file exists
        		console.log('File exists');
			} else {
				console.log('going to call downloadThumbs()');
				downloadThumbs();
			}
			var apacheThumbPath = 
			//print thumbnail to screen
			response.write('<a href="' + thumbPath + '"><img src="' + thumbPath + '" height="' + height + '" width="' + width + '"/></a>');
			*/
	}
	if (!mainEndCalled) {
		localAndGCSEnd(response2);
	}
}


function myList_Load(response) {
  //  Load json IBF List FILE
  try {  
  	strFile_Path = '/home/pi/ibox/www/packages/_list.json';
    data = fs.readFileSync(strFile_Path) //  T2
    console.log("myList_Load : readFileSync=",strFile_Path)
    myList = JSON.parse(data);
    //fs.closeSync(data)
    //console.log(myList);
	loadGCS2(response);
  }
  catch (err) {
    console.log('There has been an error parsing your JSON. : myList')
    console.log(err);
    //  Create a new one with defaults
    ///console.log("Creating a new one with defaults"); #could wipe out valuable data
    ///fsSystem_Save();
  }
  
}

function localAndGCSEnd(response) {
	//console.log('Local: ' + myBrowseListGlobal.Local + ' localLength: ' + localModelList.length);
	//console.log(' GCS: ' + myBrowseListGlobal.iBox + ' GCSLength: ' + myList.models.length);

	if (((myBrowseListGlobal.iBox == 'true') && (myBrowseListGlobal.Local != "true") && (myList.models.length == 0)) || ((myBrowseListGlobal.Local == "true") && (myBrowseListGlobal.iBox != "true") && (localModelList.length == 0)) || ((myBrowseListGlobal.Local == "true") && (myBrowseListGlobal.iBox == "true") && (myList.models.length == 0) && (localModelList.length == 0))) {
		noSearchResults();
	}else {
		//////////////////////////////////////////////////////////////////////////////////////////////////////
	////  Back Button and Next Button ////
	///////////////////////////////////////////////////
	response.write('<tr>');
	response.write('<td>');
	response.write('<table class="wrapperTable" width="100%" height="100%">');
	response.write('<tr>');
	
	//console.log('Start Local: ' + startingIndex + ' End Local: ' + endingIndex);
	//console.log('Start GCS: ' + startingIndexGCS + ' End GCS: ' + endingIndexGCS);
	startingIndexTemp = startingIndex;
	endingIndexTemp = endingIndex;
	startingIndexTempGCS = startingIndexGCS;
	endingIndexTempGCS = endingIndexGCS;
	if(loadingLocal && loadingGCS) {
		if((startingIndexTemp == 0) && (startingIndexTempGCS == 0)) {
			//they are on the first page
			showBackButton = false;
			
			
		}else if((startingIndexTempGCS == 0) && (startingIndexTemp > 0)) {
				//they are on the first page of GCS models
				startingIndexTempGCS = 0;
				endingIndexTempGCS = -1; // set to negative one because it accounts for one integer offset on starting page
				//if((endingIndexTempGCS + numModelsPerPage) > (myList.models.length - 1)) {
				//	endingIndexTempGCS = myList.models.length - 1;
				//}else {
				//	endingIndexTempGCS += (numModelsPerPage - 1);
				//}
				endingIndexTemp = (startingIndexTemp - 1);
				startingIndexTemp -= numModelsPerPage;
		}else if(startingIndexTempGCS > 0) {
			endingIndexTempGCS = (startingIndexTempGCS - 1);
			
			// need to account for going negative and adding in local models
			if((startingIndexTempGCS - numModelsPerPage) < 0) {
				var remainingModels = Math.abs(startingIndexTempGCS - numModelsPerPage);
				startingIndexTemp -= (remainingModels);
				startingIndexTempGCS -= (numModelsPerPage - remainingModels);
			}else {
				startingIndexTempGCS -= numModelsPerPage;
			}
		}else {
			endingIndexTemp = (startingIndexTemp - 1);
			startingIndexTemp -= numModelsPerPage;
		}
	}else if (loadingLocal) {
		if(startingIndexTemp == 0) {
			showBackButton = false;
			/*
			startingIndexTemp = 0;
			endingIndexTemp = 0;
			if((endingIndexTemp + numModelsPerPage) > (localModelList.length - 1)) {
				endingIndexTemp = localModelList.length - 1;
			}else {
				endingIndexTemp += (numModelsPerPage - 1);
			} 
			*/
		}else {
			endingIndexTemp = (startingIndexTemp - 1);
			startingIndexTemp -= numModelsPerPage;
		}
	}else if (loadingGCS) {
		if(startingIndexTempGCS == 0) {
			showBackButton = false;
			/*
			startingIndexTempGCS = 0;
			endingIndexTempGCS = 0;
			if((endingIndexTempGCS + numModelsPerPage) > (myList.models.length - 1)) {
				endingIndexTempGCS = myList.models.length - 1;
			}else {
				endingIndexTempGCS += (numModelsPerPage - 1);
			}
			*/
		}else {
			endingIndexTempGCS = (startingIndexTempGCS - 1);
			startingIndexTempGCS -= numModelsPerPage;
		}
	}

	response.write('<form action="/button_browse" method="get" align="left" valign="middle">');
	response.write('<td align="left" valign="middle" width="100px">');
	if(showBackButton) {
		endingIndexBackBegin = 0 + (numModelsPerPage - 1);
		endingIndexGCSBackBegin = 0 + (numModelsPerPage - 1);

		//Back to beginning button
		response.write('<div align="left" valign="middle">');
		response.write('<input type="hidden" name="isBackBeginning" value="Yes"/>');
		response.write('<input type="hidden" name="localStartingIndex" value="0"/>');
		response.write('<input type="hidden" name="localEndingIndex" value="' + endingIndexBackBegin + '"/>');
		response.write('<input type="hidden" name="gcsStartingIndex" value="0"/>');
		response.write('<input type="hidden" name="gcsEndingIndex" value="' + endingIndexGCSBackBegin + '"/>');
		response.write('<input type="submit" value="Back to Beginning"/>');
		response.write('</div>');
	}else {
		response.write('&nbsp;');
	}
	response.write('</td>');
	response.write('</form>');
	
	response.write('<form action="/button_browse" method="get" align="left" valign="middle">');
	response.write('<td align="left" valign="middle">');
	if(showBackButton) {
		response.write('<div align="left" valign="middle">');
		response.write('<input type="hidden" name="isBack" value="Yes"/>');
		response.write('<input type="hidden" name="localStartingIndex" value="' + startingIndexTemp + '"/>');
		response.write('<input type="hidden" name="localEndingIndex" value="' + endingIndexTemp + '"/>');
		response.write('<input type="hidden" name="gcsStartingIndex" value="' + startingIndexTempGCS + '"/>');
		response.write('<input type="hidden" name="gcsEndingIndex" value="' + endingIndexTempGCS + '"/>');
		response.write('<input type="submit" value="Back"/>');
		response.write('</div>');
	}else {
		response.write('&nbsp;');
	}
	response.write('</td>');
	response.write('</form>');
	
	
	
	if(loadingLocal && loadingGCS) {
		if(endingIndex >= (localModelList.length - 1)) {
			startingIndex = endingIndex + 1;
			
			if(endingIndexGCS == (myList.models.length - 1)) {
				//there is no more to be displayed so stay on the same page
				startingIndexGCS = startingIndexGCS;
				showNextButton = false;
			}else {
				startingIndexGCS = endingIndexGCS + 1;
			}
	
			if((endingIndexGCS + numModelsPerPage) > (myList.models.length - 1)) {
				endingIndexGCS = myList.models.length - 1;
			}else {
				endingIndexGCS += numModelsPerPage;
			}
			
		}else {
			startingIndex = endingIndex + 1;
			if((endingIndex + numModelsPerPage) > (localModelList.length - 1)) {
				endingIndex = localModelList.length - 1;
				
				var remainingSpots = (numModelsPerPage - ((endingIndex + 1) - startingIndex));
				//and then fill the remaining spots with GCS models
				if((endingIndexGCS + remainingSpots) > (myList.models.length - 1)) {
					endingIndexGCS = myList.models.length - 1;
				}else {
					endingIndexGCS += remainingSpots;
				}
				
			}else {
				endingIndex += numModelsPerPage;
			}
		}
		

	}else if(loadingLocal) {
		if(endingIndex == (localModelList.length - 1)) {
			//there is no more to be displayed so stay on the same page
			startingIndex = startingIndex;
			showNextButton = false;
		}else {
			startingIndex = endingIndex + 1;
		}
	
		if((endingIndex + numModelsPerPage) > (localModelList.length - 1)) {
			endingIndex = localModelList.length - 1;
		}else {
			endingIndex += numModelsPerPage;
		}
	}else if(loadingGCS) {
		if(endingIndexGCS == (myList.models.length - 1)) {
			//there is no more to be displayed so stay on the same page
			startingIndexGCS = startingIndexGCS;
			showNextButton = false;
		}else {
			startingIndexGCS = endingIndexGCS + 1;
		}
	
		if((endingIndexGCS + numModelsPerPage) > (myList.models.length - 1)) {
			endingIndexGCS = myList.models.length - 1;
		}else {
			endingIndexGCS += numModelsPerPage;
		}
	}
	
	response.write('<form action="/button_browse" method="get" align="right" valign="middle">');
	response.write('<td align="right" valign="middle">');
	if(showNextButton) {
		response.write('<div align="right" valign="middle">');
		response.write('<input type="hidden" name="isNext" value="Yes"/>');
		response.write('<input type="hidden" name="localStartingIndex" value="' + startingIndex + '"/>');
		response.write('<input type="hidden" name="localEndingIndex" value="' + endingIndex + '"/>');
		response.write('<input type="hidden" name="gcsStartingIndex" value="' + startingIndexGCS + '"/>');
		response.write('<input type="hidden" name="gcsEndingIndex" value="' + endingIndexGCS + '"/>');
		response.write('<input type="submit" value="Next"/>');
		response.write('</div>');
	}else {
		response.write('&nbsp;');
	}
	response.write('</td>');
	response.write('</form>');
	
	response.write('</tr>');
	response.write('</table>');
	
	
	response.write('</td>');
	response.write('</tr>');
	}


	response.write('</table>');//closes browse table
	mainEnd(response);
	mainEndCalled = true;
}

function mainEnd(response) {
	response.write('</table></center></body></html>');
	response.write('</FONT>');
	response.end();
}

function checkIfModelExists(modelName) {
	var modelList = fs.readdirSync('/home/pi/ibox/www/packages/expanded/');
	console.log('modelList: ' + modelList);
	for(i=0; i<modelList.length; i++) {
		if(modelList[i] == modelName){
			return true;
		}
	}
	return false;
}

function noSearchResults() {
	response2.write('<tr>');
	response2.write('<td width="800px">');
	response2.write('<table class="wrapperTable"');
	response2.write('<tr>');
	response2.write('<td align="center" valign="middle">');
	response2.write('<center>Your search did not match any models.</center>');
	response2.write('</td>');
	response2.write('</tr>');
	response2.write('</table>');
	response2.write('</td>');
	response2.write('</tr>');
}


function sortGCSByOrder() {
	if (order == "Default") {
		//array is myList.models[i]
		
		//if the order is default, let the models print in the order of the _list.json
		/*
		myList.models.sort(function(a, b){
			var dateA = parseDate(a.model_creation_date);
			var dateB = parseDate(b.model_creation_date);
 		return dateB-dateA //sort by date descending
		});
		*/
	}else if (order == "Date") {
		//array is myList.models[i]
		myList.models.sort(function(a, b){
			var dateA = parseDate(a.license_date);
			var dateB = parseDate(b.license_date);
 		return dateB-dateA //sort by date descending
		});
	}else if (order == "Stars") {
		//array is myList.models[i]
		myList.models.sort(function(a, b){
			var starsA = parseInt(a.star_count_public);
			var starsB = parseInt(b.star_count_public);
 		return starsB-starsA //sort by stars descending
		});
	}
}

function sortLocalByOrder() {
	if (order == "Default") {
		//array is localModelList[i]
		localModelList.sort(function(a, b){
			var dateA = parseDate(a.model_creation_date);
			var dateB = parseDate(b.model_creation_date);
 		return dateB-dateA //sort by date descending
		});
	}else if (order == "Date") {
		//array is localModelList[i]
		localModelList.sort(function(a, b){
			var dateA = parseDate(a.license_date);
			var dateB = parseDate(b.license_date);
 		return dateB-dateA //sort by date descending
		});
	}else if (order == "Stars") {
		//array is localModelList[i]
		localModelList.sort(function(a, b){
			var starsA = parseInt(a.star_count_public);
			var starsB = parseInt(b.star_count_public);
 		return starsB-starsA //sort by stars descending
		});
	}
}

function searchLocal() {
	var indicesToDelete = [];
	searchString = searchString.toLowerCase();
	for (i=0; i<localModelList.length; i++) {
		var field1;
		var field2;
		var field3;

		try {
			var field1 = localModelList[i].model_name.split(' ');
		}catch(error) {
			console.log("model_name was not defined in json code: " + error.code);
		}
		try {
			var field2 = localModelList[i].model_description.split(' ');
		}catch(error) {
			console.log("model_description was not defined in json code: " + error.code);
		}
		try {
			var field3 = localModelList[i].model_keywords.split(' ');
		}catch(error) {
			console.log("model_keywords was not defined in json code: " + error.code);
		}

		var fields = [];
		if (field1 != undefined) {
			fields = fields.concat(field1);
		}
		if (field2 != undefined) {
			fields = fields.concat(field2);
		}
		if (field3 != undefined) {
			fields = fields.concat(field3);
		}
		var lowerCaseFields = fields.map(function(value) {
      		return value.toLowerCase();
    	});

		if(lowerCaseFields.indexOf(searchString) <= -1) {
			//mark index for delete
			indicesToDelete.push(i);
			//console.log('Pushed: ' + i);
		}

		if(i == localModelList.length - 1) {
			//last iteration
			//remove indices
			//console.log('indices: ' + indicesToDelete);
			for (j=0; j<indicesToDelete.length; j++) {
				localModelList.splice(indicesToDelete[j] - j, 1); // remove object at location j
				//console.log('deleted: ' + indicesToDelete[j]);
			}
		}
	}
}

function searchGCS() {
	//console.log('Search GCS');
	searchString = searchString.toLowerCase();
	var indicesToDelete = [];
	var length = myList.models.length;
	for (f=0; f<length; f++) {
		//console.log('in loop');
		var field1;
		var field2;
		var field3;
		try {
			var field1 = myList.models[f].model_name.split(' ');
		}catch(error) {
			//one of the fields was undefined
			console.log("model_name was not defined in json code: " + error.code);
		} 
		try {
			var field2 = myList.models[f].model_description.split(' ');
		}catch(error) {
			console.log("model_description was not defined in json code: " + error.code);
		}
		try {
			var field3 = myList.models[f].model_keywords.split(' ');
		}catch (error) {
			console.log("model_keywords was not defined in json code: " + error.code);
		}

		var fields = [];
		if (field1 != undefined) {
			fields = fields.concat(field1);
		}
		if (field2 != undefined) {
			fields = fields.concat(field2);
		}
		if (field3 != undefined) {
			fields = fields.concat(field3);
		}
		var lowerCaseFields = fields.map(function(value) {
      		return value.toLowerCase();
    	});

		if(lowerCaseFields.indexOf(searchString) <= -1) {
			//mark index for delete
			indicesToDelete.push(f);
			//console.log('PushedGCS: ' + f);
		}
		if(f == length - 1) {
			//last iteration
			//remove indices
			//console.log('indicesGCS: ' + indicesToDelete);
			for (z=0; z<indicesToDelete.length; z++) {
				myList.models.splice(indicesToDelete[z] - z, 1); // remove object at location j
				//console.log('deletedGCS: ' + indicesToDelete[z]);
			}
		}
	}
}

// parse a date in yyyy-mm-dd format
//edited to mm-dd-yyyy
function parseDate(input) {
  var parts = input.split('/');
  // new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
  return new Date(parts[2], parts[0]-1, parts[1]); // Note: months are 0-based
}


var dateFormat = require('dateformat');
function updateCreationDate(folderName, isMgnt){
	var path = '/home/pi/ibox/www/packages/expanded/' + folderName + '/_model.json';
	if(isMgnt) {
		path = '/home/pi/ibox/www/packages/mgnt/expanded/' + folderName + '/_model.json';
	}
	var data = '';
	//var stringData = '';
	var jsonData;
	try {
    	data = fs.readFileSync(path);
    	//stringdata = data.toString('utf8');
    	jsonData = JSON.parse(data);
  	}catch(error) {
    	console.log('Error reading: ' + path);
    	response2.write('<div class="divColor">Error Reading: ' + path + '</div><br />');
    	response2.write('<div class="divColor">Error Code: ' + error.code + '</div>');
    	response2.end();
  	}


  	//find todays date and add it to the string.
  	var dDate=dateFormat(Date(), "mm/dd/yyyy");  //yyyy-mm-dd h:MM:ss
	jsonData.model_creation_date = dDate;  // 4/15/05 was Date();
	console.log('Current Date: ' + jsonData.model_creation_date);

	var stringData = JSON.stringify(jsonData);
  	try {
  		fs.writeFileSync(path, stringData);
  	}catch(error) {
  		console.log('Error writing: ' + path);
    	response2.write('<div class="divColor">Error writing: ' + path + '</div><br />');
    	response2.write('<div class="divColor">Error Code: ' + error.code + '</div>');
    	response2.end();
  	}
}


function copyToLocal(modelName) {
	console.log('Copy to local: ' + modelName);
	response2.write('<br /><div class="divColor">Copy to local: ' + modelName + '</div>');
	response2.end();

	//use the model name to get the compressed, expanded, and thumbnail from the mgnt and copy the files into the local compressed, expanded, and model_images
}

function transferToCloud(modelName) {
	console.log('Transfer to Cloud: ' + modelName);
	response2.write('<br /><div class="divColor">Transfer to Cloud: ' + modelName + '</div>');
	response2.end();

	//use the modelName to upload the zip file in the /home/pi/ibox/www/packages/mgnt/compressed/modelName.zip directory to the download project of iBox cloud
	//also take the _model.json file from the expanded dir and put it on iBox cloud, renamed with the file name
	//take the _model.json and parse it into a string, then append it to the top of the _list.json. look at mgntInterface.updateListJSON()
}


exports.printUserInterface = printUserInterface;
exports.deleteDir = deleteDir;
exports.deleteFile = deleteFile;
exports.updateCreationDate = updateCreationDate;
exports.mainEnd = mainEnd;
