//  ibp_friends  // 
//  Created: 5/14/2015
//  Copyright iBox Printers Inc 2015

//  Includes
var request_obj = require('request');
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

var aryResponses = []


function main(request, response, url) {
	console.log("Called: ibp_friends->main Function")
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
	response.write('<title>iBox Nano - Friends - ' + strZeroConfigName + '</title>');
	response.write('<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />');
	response.write('<link rel="icon" href="' + strApacheRootLink + 'favicon-32.png" sizes="32x32">');
  response.write('<link rel="shortcut icon" type="image/x-icon" href="' + strApacheRootLink + 'favicon.ico"/>');
  response.write('<link rel="stylesheet" type="text/css" href="http://' + strIPAddress + ':8000/Styles.css"/>');
	response.write('</head><p>');

	response.write('<body bgcolor="#FFFFFF">');

	  ///  Tab Bar with CSS : Start  ////////////////////////////////////
  header_css( response, "friends");
  /////////// Tab Br with CSS : End  ////////////////////////////////////


	// TABS  ///////////////////////////////////////////////
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

	/// BODY - Home/Main //////////////////////////////////////////////

	//response.write('<FONT color="#c6c6c6">')
	//response.write('<FONT STYLE="' + strFontStyle + '" SIZE="+1" COLOR="#c6c6c6>');
	//response.write('<FONT SIZE="" COLOR="#c6c6c6>');

	response.write('<!-- Save for Web Slices (NanoHID_Body_Home_960x608.psd) -->');
	response.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0" align="top">');


	//////////////////////////////////////////////////////////////////////////////////////////////////////
	////  Friends ////
	///////////////////////////////////////////////////
	response.write('<br>');






		//response.write('<table>');
	response.write('<table border="0" style="background-color:#1B1B1B;border-collapse:collapse;border:0px solid #FFCC00;color:#FFFFFF;width:960" cellpadding="0" cellspacing="0">');


			


	response.write('<br>');
	response.write('<br>');
	/*
	strURL_Config_Submit_ChangeConfig = 'http://' + strIPAddress + '/manufacturing_and_test_off';
	response.write('<form name="input" action="' + strURL_Config_Submit_ChangeConfig + '" method="get">');
	response.write('<input type="submit" value="Manufacturing Mode - OFF">');
	response.write('</form>');
	response.write('<br>');
	*/

	response.write('<table border="1" style="background-color:#FFFFCC;border-collapse:collapse;border:1px solid #FFCC00;color:#000000;width:960;font-size:70%" cellpadding="3" cellspacing="3">');
	//response.write('<font size="-2">');

	strTarget_IP_Base = '192.168.1.'
	//  5/17/2015 TRC
	//  Get IP address first three octets
	var aryIPOct = strIPAddress.split('.')
	strFirstThreeOctetsOfIP_Address = aryIPOct[0] + "." + aryIPOct[1] + '.' + aryIPOct[2] + '.'
	console.log('Auto created first three octets of IP address: [' + strFirstThreeOctetsOfIP_Address + ']')
	strTarget_IP_Base = strFirstThreeOctetsOfIP_Address;
	
	bTable_Lables_Printed = false;

	i = 0;

	try { 

		for(var i=0;i<254;i++) {
			strTarget_IP = strTarget_IP_Base + i 
			strURL = 'http://' + strTarget_IP + '/status'
			console.log('Sending POST to [' + strURL + ']')
			//strURL = 'http://bahntech.com'
			request_obj.post(
			    strURL,
			    { form: { key: 'value' } },
			    function (error, response_obj, body) {
			    	if (error) {
			    		//console.log('ERROR:' + error + ' : body=' + error + ' : response_obj=' + response_obj);
			    	}
			        if (!error && response_obj.statusCode == 200) {
			            console.log(body)
			            //response.write('<br>Received from ' + strTarget_IP + '>>' + body)
			            //aryResponses.push(body)
			            //response.end();
			            
			            //  Split up string by :
						var aryData = body.split(":");
						//  The first row of the Table is the lables
						if(bTable_Lables_Printed == false) {
							bTable_Lables_Printed = true;
							response.write('<tr>');
							for(var i=0;i<aryData.length;i++) {
								aryContent = aryData[i].split("=");
								response.write('<td>')
								response.write(aryContent[0])
								response.write('</td>')
								//console.log('Ary[' + i + ']==(' + aryData[i] + ')');
							}
							response.write('<td>')
								response.write(' Go ')
							response.write('</td>')
							response.write('<td>')
								response.write('Go+Beep')
							response.write('</td>')
							response.write('</tr>');
						}
						response.write('<tr>');
						for(var i=0;i<aryData.length;i++) {
							aryContent = aryData[i].split("=");
							if(aryContent[1] == undefined) {
								console.log("=========== ERROR  =====  UNDEFIGNED  ===> Break  ========")
								break;
							}
							if(aryContent[1].indexOf("Printing") > -1) {
								response.write('<td bgcolor="#00FF00">')
							}else if(aryContent[1].indexOf("Error") > -1) {
								response.write('<td bgcolor="#FF0000">')
							}else{
								response.write('<td>')
							}
							
							if(aryContent[0] == 'IP_Address') {
								strIP_Address = aryContent[1];
							}
							response.write(aryContent[1])
							response.write('</td>')
							//console.log('Ary[' + i + ']==(' + aryData[i] + ')');
						}
						response.write('<td>')
							response.write('<form name="input" action="http://' + strIP_Address + '" method="post">');
	  						response.write('<input type="submit" value=" Go ">');
	  						response.write('</form>');
	  					response.write('</td>')
	  					response.write('<td>')
							response.write('<form name="input" action="http://' + strIP_Address + '/beep?Beep_Count=10" method="post">');
	  						response.write('<input type="submit" value="Go+Beep">');
	  						response.write('</form>');
	  					response.write('</td>')
			            response.write('</tr>');
			        }
			    }
			);
		}

		}catch (err) {
		console.log('ERROR [' + err + '] : at i=[' + i + ']')
		response.write('<br>ERROR [' + err + '] :  at i=[' + i + ']');
	}
	
//response.write('</font>');
/*
<table border="1" style="background-color:#FFFFCC;border-collapse:collapse;border:1px solid #FFCC00;color:#000000;width:960" cellpadding="3" cellspacing="3">
	<tr>
		<td>Table Cell</td>
		<td>Table Cell</td>
		<td>Table Cell</td>
		<td>Table Cell</td>
		<td>Table Cell</td>
		<td>Table Cell</td>
		<td>Table Cell</td>
	</tr>
	<tr>
		<td>Table Cell</td>
		<td>Table Cell</td>
		<td>Table Cell</td>
		<td>Table Cell</td>
		<td>Table Cell</td>
		<td>Table Cell</td>
		<td>Table Cell</td>
	</tr>
	<tr>
		<td>Table Cell</td>
		<td>Table Cell</td>
		<td>Table Cell</td>
		<td>Table Cell</td>
		<td>Table Cell</td>
		<td>Table Cell</td>
		<td>Table Cell</td>
	</tr>
</table>

*/



  //////////////////////////////////////////////////////////////////////////////////////////////////////
  ////  Back Button to Home ////
  ///////////////////////////////////////////////////
/*
  response.write('</table>');
  
  response.write('<br>');
  response.write('<form name="input" action="http://' + strIPAddress + '" method="get">');
  response.write('<input type="submit" value=" Home ">');
  response.write('</form>');

  //response.write('<br>');
  response.write('<form name="input" action="http://' + strIPAddress + '/button_settings" method="get">');
  response.write('<input type="submit" value=" Back to Settings ">');
  response.write('</form>');



	//response.write('<br>Request Object:' + request.url)

	response.write('</table></center></body></html>');
	response.write('</FONT>');

	response.write('</body>');
	response.write('</html>');
	*/
	
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


function header_css (response, varRefreshLocation) {
  //var refreshLocation = "button_browse";
  refreshLocation = varRefreshLocation
  var header = require('./header');
  header.printHeader(response, strIPAddress, refreshLocation); //strIPAddress
}
