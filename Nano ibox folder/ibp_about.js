//  ibp_about  // 
//  Created: 3/15/2015
//  Copyright iBox Printers Inc 2015

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
	response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">');
	response.write('<title>iBox Nano - About</title>');
	response.write('<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />');
	  response.write('<link rel="icon" href="' + strApacheRootLink + 'favicon-32.png" sizes="32x32">');
	  response.write('<link rel="shortcut icon" type="image/x-icon" href="' + strApacheRootLink + 'favicon.ico"/>');
	response.write('</head><p>');

	response.write('<body bgcolor="#FFFFFF">');

	///  Tab Bar with CSS : Start  ////////////////////////////////////
  	header_css( response, "button_about");
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
response.write('			<a href="' + strApacheRootLink + 'help/Nano_User_Guide.htm" target="_blank">');
	response.write('				<img id="Button_User_Guide" src="' + strFullPath + 'Button_User_Guide.png" width="150" height="88" border="0" alt="User Guide" /></a></td>');
 response.write('    <td>');
  response.write('      <a href="https://www.youtube.com/channel/UCfHkl7-As8ycrRVbJ3I7Zvg" target="_blank">');
  response.write('        <img id="Button_YouTube" src="' + strFullPath + 'Button_YouTube.png" width="149" height="88" border="0" alt="YouTube" /></a></td>');
 response.write('    <td>');
response.write('			<a href="' + strApacheRootLink + 'help/Nano_Quick_Start_Guide.png" target="_blank">');
	response.write('				<img id="Button_QuickStart_Guide" src="' + strFullPath + 'Button_QuickStart_Guide.png" width="150" height="88" border="0" alt="Quick Start Guide" /></a></td>');
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
*/

	response.write('<!-- Save for Web Slices (NanoHID_Body_Home_960x608.psd) -->');
	response.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0">');
	response.write('	<tr>');
	response.write('		<td colspan="6">');
	response.write('			<img id="NanoHID_Body_Home_960x608_01" src="' + strFullPath + 'NanoHID_Body_Home_960x608_0.png" width="960" height="69" alt="" /></td>');
	response.write('	</tr>');
	response.write('	<tr>');
	response.write('		<td rowspan="4">');
	response.write('			<img id="NanoHID_Body_Home_960x608_02" src="' + strFullPath + 'NanoHID_Body_Home_960x60-02.png" width="51" height="539" alt="" /></td>');
	response.write('		<td width="420" height="218" colspan="4" bgcolor="#1B1B1B"><font color="#c6c6c6">iBox Printers<br>2475 Palm Bay Rd NE<br>Palm Bay, FL 32905');

	response.write('<br><br>For support please visit support.iboxprinters.com');
	response.write('<br>iBox Privacy Policy <a href="' + strApacheRootLink + '/help/privacypolicy.htm" target="_blank">Privacy Policy</a>');
	response.write('<br>iBox Copyright Policy <a href="' + strApacheRootLink + '/help/copyrightpolicy.htm" target="_blank">Copyright Policy</a>');


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
	response.write('		<td width="187" height="115" bgcolor="#1B1B1B"><font color="#c6c6c6">Copyright iBox Printers Inc. 2015</font></td>');
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