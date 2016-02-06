module.exports = {
  printHeader: function (response, IPAddress, refreshLocation) {

  	strIPAddress = IPAddress; //"http://192.168.2.103"
	strApacheRootLink = 'http://' + IPAddress + ":8000/"
	strFullPath = "http://" + IPAddress + ':8000/images/';

    response.write('<link rel="stylesheet" type="text/css" href="http://' + strIPAddress + ':8000/Styles.css"/>');
	response.write('<!-- Save for Web Slices (NanoHID_Header_960x72.psd) -->');
  	response.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0">');
  	response.write('  <tr>');
  	response.write('    <td colspan="11">');
  	response.write('      <img id="NanoHID_Header_960x72_01" src="' + strFullPath + 'NanoHID_Header_960x72_01.png" width="960" height="8" alt="" /></td>');
  	response.write('  </tr>');
  	response.write('  <tr>');
  	response.write('    <td rowspan="2">');
  	response.write('      <img id="NanoHID_Header_960x72_02" src="' + strFullPath + 'NanoHID_Header_960x72_02.png" width="601" height="64" alt="" /></td>');
  	response.write('<td>');
  	response.write('<table class="tabs" border="0" cellspacing="0" cellpadding="0">');
  	response.write('<tr>');
  	response.write('    <td>');
  	response.write('      <a href="' + refreshLocation + '">');
  	response.write('        <img id="Button_Refresh_Header" src="' + strFullPath + 'Button_Refresh_Header.png" width="54" height="38" alt="Refresh" /></a></td>');
  	response.write('</tr>');
  	response.write('</table>');
  	response.write('</td>');
  	response.write('    <td rowspan="2">');
  	response.write('      <img id="NanoHID_Header_960x72_04" src="' + strFullPath + 'NanoHID_Header_960x72_04.png" width="46" height="64" alt="" /></td>');
  	response.write('<td>');
  	response.write('<table class="tabs" border="0" cellspacing="0" cellpadding="0">');
  	response.write('<tr>');
  	response.write('    <td>');
  	response.write('      <a href="http://' + strIPAddress + '/button_home">');
  	response.write('        <img id="Button_Home" src="' + strFullPath + 'Button_Home.png" width="54" height="38" alt="Home" /></a></td>');
  	response.write('</tr>');
  	response.write('</table>');
  	response.write('</td>');
  	response.write('    <td rowspan="2">');
  	response.write('      <img id="NanoHID_Header_960x72_06" src="' + strFullPath + 'NanoHID_Header_960x72_06.png" width="6" height="64" alt="" /></td>');
  	response.write('<td>');
  	response.write('<table class="tabs" border="0" cellspacing="0" cellpadding="0">');
  	response.write('<tr>');
  	response.write('    <td>');
  	response.write('      <a href="http://' + strIPAddress + '/button_help">');
  	response.write('        <img id="Button_Help_Header" src="' + strFullPath + 'Button_Help_Header.png" width="54" height="38" alt="Help" /></a></td>');
  	response.write('</tr>');
  	response.write('</table>');
  	response.write('</td>');
  	response.write('    <td rowspan="2">');
  	response.write('      <img id="NanoHID_Header_960x72_08" src="' + strFullPath + 'NanoHID_Header_960x72_08.png" width="6" height="64" alt="" /></td>');
  	response.write('<td>');
  	response.write('<table class="tabs" border="0" cellspacing="0" cellpadding="0">');
  	response.write('<tr>');
  	response.write('    <td class="tabs">');
  	response.write('      <a href="http://' + strIPAddress + '/button_settings">');
  	response.write('        <img id="Button_Settings_Header" src="' + strFullPath + 'Button_Settings_Header.png" width="54" height="38" alt="Settings" /></a></td>');
  	response.write('</tr>');
  	response.write('</table>');
  	response.write('</td>');
  	response.write('    <td rowspan="2">');
  	response.write('      <img id="NanoHID_Header_960x72_10" src="' + strFullPath + 'NanoHID_Header_960x72_10.png" width="6" height="64" alt="" /></td>');
  	response.write('<td>');
  	response.write('<table class="tabs" border="0" cellspacing="0" cellpadding="0">');
  	response.write('<tr>');
  	response.write('    <td class="tabs">');
  	response.write('      <a href="button_about">');
  	response.write('        <img id="http://' + strIPAddress + '/Button_About_Header" src="' + strFullPath + 'Button_About_Header.png" width="54" height="38" alt="About" /></a></td>');
  	response.write('</tr>');
  	response.write('</table>');
  	response.write('</td>');
  	response.write('    <td rowspan="2">');
  	response.write('      <img id="NanoHID_Header_960x72_12" src="' + strFullPath + 'NanoHID_Header_960x72_12.png" width="25" height="64" alt="" /></td>');
  	response.write('  </tr>');
  	response.write('  <tr>');
  	response.write('    <td>');
  	response.write('      <img id="NanoHID_Header_960x72_13" src="' + strFullPath + 'NanoHID_Header_960x72_13.png" width="54" height="26" alt="" /></td>');
  	response.write('    <td>');
  	response.write('      <img id="NanoHID_Header_960x72_14" src="' + strFullPath + 'NanoHID_Header_960x72_14.png" width="54" height="26" alt="" /></td>');
  	response.write('    <td>');
  	response.write('      <img id="NanoHID_Header_960x72_15" src="' + strFullPath + 'NanoHID_Header_960x72_15.png" width="54" height="26" alt="" /></td>');
  	response.write('    <td>');
  	response.write('      <img id="NanoHID_Header_960x72_16" src="' + strFullPath + 'NanoHID_Header_960x72_16.png" width="54" height="26" alt="" /></td>');
  	response.write('    <td>');
  	response.write('      <img id="NanoHID_Header_960x72_17" src="' + strFullPath + 'NanoHID_Header_960x72_17.png" width="54" height="26" alt="" /></td>');
  	response.write('  </tr>');
  	response.write('</table>');
  	response.write('<!-- End Save for Web Slices -->');
  },
  printUserGuideBar: function (response, IPAddress) {
    strIPAddress = IPAddress; //"http://192.168.2.103"
  strApacheRootLink = 'http://' + IPAddress + ":8000/"
  strFullPath = "http://" + IPAddress + ':8000/images/';

    response.write('<!-- Save for Web Slices (NanoHID_Tabs_960x88.psd) -->');
    response.write('<table id="Table_01" width="960" border="0" cellpadding="0" cellspacing="0">');
    response.write('  <tr>');
    response.write('    <td>');
    response.write('      <img id="NanoHID_Tabs_960x88_01" src="' + strFullPath + 'NanoHID_Tabs_960x88_01.png" width="31" height="88" alt="" /></td>');
    response.write('<td>');
    response.write('<table class="tabs2" border="0" cellpadding="0" cellspacing="0">');
    response.write('<tr>');
    response.write('    <td>');
    response.write('      <a href="' + strApacheRootLink + '/help/User_Instruction_Draft_2_5_15.htm" target="_blank">');
    response.write('        <img id="Button_User_Guide" src="' + strFullPath + 'Button_User_Guide.png" width="150" height="88" alt="User Guide" /></a></td>');
    response.write('    <td>');
    response.write('      <a href="https://www.youtube.com/channel/UCfHkl7-As8ycrRVbJ3I7Zvg" target="_blank">');
    response.write('        <img id="Button_YouTube" src="' + strFullPath + 'Button_YouTube.png" width="149" height="88" alt="YouTube" /></a></td>');
    response.write('    <td>');
    response.write('      <a href="button_updates" target="">');
    response.write('        <img id="Button_Updates" src="' + strFullPath + 'Button_Updates.png" width="150" height="88" alt="Check for software updates" /></a></td>');
    response.write('    <td>');
    response.write('      <a href="http://support.iboxprinters.com" target="_blank">');
    response.write('        <img id="Button_Forums" src="' + strFullPath + 'Button_Forums.png" width="151" height="88" alt="Forums" /></a></td>');
    response.write('    <td>');
    response.write('      <a href="http://wiki.iboxprinters.com" target="_blank">');
    response.write('        <img id="Button_Wiki" src="' + strFullPath + 'Button_Wiki.png" width="149" height="88" alt="iBox Wiki" /></a></td>');
    response.write('    <td>');
    response.write('      <a href="http://wiki.iboxprinters.com" target="_blank">');
    response.write('        <img id="Button_FAQ" src="' + strFullPath + 'Button_FAQ.png" width="150" height="88" alt="FAQ" /></a></td>');
    response.write('</tr>');
    response.write('</table>');
    response.write('</td>');
    response.write('    <td>');
    response.write('      <img id="NanoHID_Tabs_960x88_08" src="' + strFullPath + 'NanoHID_Tabs_960x88_08.png" width="30" height="88" alt="" /></td>');
    response.write('  </tr>');
    response.write('</table>');
    response.write('<!-- End Save for Web Slices -->');
  }
};
