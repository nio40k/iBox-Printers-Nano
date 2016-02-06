//  ibp_help  // 
//  Created: 3/11/2015
//  Copyright iBox Printers Inc 2015

//  Includes
var fs = require('fs');
var strFontStyle = ('font-family: "Arial Black", "Arial Bold", Gadget, sans-serif;');
var strIPAddress = '127.0.0.1';
var strFullPath = "http://" + strIPAddress + ':8000' ; //  Apache is on port 8000 just to serve files FAST, Node.js is set up to also serve the files, but its slow.


function main(request, response) {
	console.log("Called: ibp_help->main Function")
	fcnUpdate_IP_Address();
	response.writeHead(200, {'content-type': 'text/html'});
	response.write('<html><body bgcolor="#1B1B1B">');
	response.write('<center><table class="layout" border="0" width="960" bgcolor="#000000">');
	response.write('<head>');
	response.write('<FONT STYLE="' + strFontStyle + '" SIZE="" COLOR="#00ceef">');
	response.write('<title>iBox Nano - Help Center</title>');
	response.write('<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />');
	response.write('</head><p>');
	response.write('<h1>Please select Help Option from list:</h1>');
	response.write('<br><br>User Installation Instructions:');
	response.write('<br><a href="' + strApacheRootLink + '/help/User_Instruction_Draft_2_5_15.htm" target="_blank">iBox Nano - Installation Guide</a>');

	response.write('<br><br>iBox Online Forums:');
	response.write('<br><a href="http://support.iboxprinters.com" target="_blank">iBox - Support Forums</a>');

	response.write('<br><br>iBox YouTube Videos:');
	response.write('<br><a href="https://www.youtube.com/channel/UCfHkl7-As8ycrRVbJ3I7Zvg" target="_blank">iBox - YouTube Videos</a>');


	//////////////////////////////////////////////////////////////////////////////////////////////////////
	////  Back Button to Home ////
	///////////////////////////////////////////////////
	response.write('<br><br>');
	response.write('<form name="input" action="http://' + strIPAddress + '" method="get">');
	response.write('<input type="submit" value="Back">');
	response.write('</form>');

	response.write('<br>Request Object:' + request.url)

	response.write('</table></center></body></html>');
	response.write('</FONT>');
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
	
	strZeroConfigName = os.hostname();
	//console.log('IP Address is:',strIPAddress)
	
}