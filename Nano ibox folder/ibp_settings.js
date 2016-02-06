//  ibp_settings  // 
//  Created: 3/16/2015
//  Copyright iBox Printers Inc 2015


//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
/////////////   THIS FILE NOT USED  /////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////


//  Includes
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

function main(request, response) {
	console.log("Called: ibp_help->main Function")
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
	response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#c6c6c6">');
	response.write('<title>iBox Nano - Settings</title>');
	response.write('<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />');
	response.write('<link rel="icon" href="' + strApacheRootLink + 'favicon-32.png" sizes="32x32">');
  	response.write('<link rel="shortcut icon" type="image/x-icon" href="' + strApacheRootLink + 'favicon.ico"/>');
	response.write('</head><p>');

	response.write('<body bgcolor="#FFFFFF">');

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
	response.write('			<a href="button_help">');
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

	/// BODY - Home/Main //////////////////////////////////////////////

response.write('<!-- Save for Web Slices (NanoHID_Body_Infinity_960x608.psd) -->');
response.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0">');
response.write('	<tr>');
response.write('		<td colspan="3">');
response.write('			<img id="NanoHID_Body_Infinity_960x608_01" src="' + strFullPath + 'NanoHID_Body_Infinity_960x6.png" width="960" height="27" alt="" /></td>');
response.write('	</tr>');
response.write('	<tr>');
response.write('		<td>');
response.write('			<img id="NanoHID_Body_Infinity_960x608_02" src="' + strFullPath + 'NanoHID_Body_Infinity_96-02.png" width="38" height="581" alt="" /></td>');
//response.write('		<td width="881" height="581" bgcolor="#1B1B1B">TEXT INFINITE BODY</td>');
response.write('		<td width="881" height="581" bgcolor="#1B1B1B">');
////////// SPLIT : START  ////////////////////////////////////





////////// SPLIT : END  ////////////////////////////////////
response.write('		</td>');
response.write('		<td>');
response.write('			<img id="NanoHID_Body_Infinity_960x608_04" src="' + strFullPath + 'NanoHID_Body_Infinity_96-03.png" width="41" height="581" alt="" /></td>');
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
	
	response.write('<br>');
	response.write('<form name="input" action="http://' + strIPAddress + '" method="get">');
	response.write('<input type="submit" value="Back">');
	response.write('</form>');
	

	//response.write('<br>Request Object:' + request.url)

	response.write('</table></center></body></html>');
	response.write('</FONT>');

	response.write('</body>');
	response.write('</html>');
	response.end();
	
	//return response;
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