var fs = require('fs');
var response2;
var myBrowseListG;
var browse = require('./ibp_browse');
//// gcloud : https://cloud.google.com/solutions/nodejs/  /////////////////

var gcloudDownload = require('gcloud')({
  keyFilename: '/home/pi/ibox/keys/IBF_API_Download_Read_Write_Mgnt_2_3b1497f1d957.json', //  changed from IBF_API_Download_Read_Write_Mgnt_07024746373d.json 7/22
  projectId: 'ibf-read-only-89818'
});
var storageDownload = gcloudDownload.storage();

var gcloudUpload = require('gcloud')({
  keyFilename: '/home/pi/ibox/keys/IBF_API_Upload_Read_Write_200b15d98d32.json',
  projectId: 'api-project-529688790472'
});
var storageUpload = gcloudUpload.storage();


function mgntKeyExist () {
                  //var keyPath = '/home/pi/ibox/keys/IBF_API_Download_Read_Write_Mgnt_07024746373d.json';
                  //  7/22/2015 - 
                  var keyPath = '/home/pi/ibox/keys/IBF_API_Download_Read_Write_Mgnt_2_3b1497f1d957.json';
                  //var keyPath2 = '/home/pi/ibox/keys/IBF API Upload Read Write-200b15d98d32.json'; // should already exist for sharing
                  var exists = false;
                  try {
                      var stats = fs.statSync(keyPath);
                      console.log("Management key exists.");
                      exists = true;
                  } catch (errs) {
                    exists = false;
                    //console.log('Error: ' + errs.code);
                    if ((errs.code=='ENOENT') || (errs.code=='ENOTDIR')) {
                      //file doesn't exist
                      console.log("The management json key for gcloud doesn't exist.");
                    }else {
                      //something else happend
                      console.log('Something Else Happened');
                      console.log(errs.code);
                    }
                  }
                  if (exists) {
                    return true;
                  } else {
                    return false;
                  }
                }

function printMgnt (response, myBrowseList) {
    response2 = response;
    myBrowseListG = myBrowseList;


    jsonData = []; // clear json data array everytime interface is loaded


    response.write('<table class="mgntTable">');
    response.write('<tr>');
    response.write('<td>');
    response.write('<b>Upload Bucket</b>');
    response.write('</td>');
    response.write('<td>');
    response.write('<b>Download Bucket</b>');
    response.write('</td>');
    response.write('</tr>');




    response.write('<tr>');
    response.write('<td>');
    response.write('<table class="mgntTableInner">');

    //loop and print rows of files
    //print mgntUploadBucket()
    mgntUploadBucket();
    
}

var uploadPackages = [];
var uploadImages = [];

var downloadPackages = [];
var downloadImages = [];

function mgntUploadBucket () {
  var bucket = storageUpload.bucket('bucket_nano_ibf_packages');
  bucket.getFiles(function(err, files, nextQuery) {
  if (nextQuery) {
    // nextQuery will be non-null if there are more results.
    bucket.getFiles(nextQuery, function(err, files, nextQuery) {});
  }
  if (err == null) {
      uploadPackages = files;
      getUploadImages();
  }else {
    console.log("" + err);
    getUploadImages();
  }
  /*
  if (nextQuery == null) {
    //no more files
    getUploadImages();
  }
  */
    /*
  // The `metadata` property is populated for you with the metadata at the
  // time of fetching.
  files[0].metadata;

  // However, in cases where you are concerned the metadata could have
  // changed, use the `getMetadata` method.
  files[0].getMetadata(function(err, metadata) {});
  */
});
}

function getUploadImages() {
  var bucket2 = storageUpload.bucket('bucket_nano_ibf_images');
  bucket2.getFiles(function(err, files, nextQuery) {
  if (nextQuery) {
    // nextQuery will be non-null if there are more results.
    bucket2.getFiles(nextQuery, function(err, files, nextQuery) {});
  }
  if (err == null) {
      uploadImages = files;
      mgntDownloadBucket();
  }else {
    console.log("" + err);
    mgntDownloadBucket();
  }
  /*
  if (nextQuery == null) {
    //no more files
    mgntDownloadBucket();
  }
  */
    /*
  // The `metadata` property is populated for you with the metadata at the
  // time of fetching.
  files[0].metadata;

  // However, in cases where you are concerned the metadata could have
  // changed, use the `getMetadata` method.
  files[0].getMetadata(function(err, metadata) {});
  */
});
}



function mgntDownloadBucket() {
  var bucket = storageDownload.bucket('bucket_nano_ibf_packages_download');
  bucket.getFiles(function(err, files, nextQuery) {
  if (nextQuery) {
    // nextQuery will be non-null if there are more results.
    bucket.getFiles(nextQuery, function(err, files, nextQuery) {});
  }
  if (err == null) {
      downloadPackages = files;
      getDownloadImages();
  }else {
    console.log("" + err);
    getDownloadImages();
  }
    /*
  // The `metadata` property is populated for you with the metadata at the
  // time of fetching.
  files[0].metadata;

  // However, in cases where you are concerned the metadata could have
  // changed, use the `getMetadata` method.
  files[0].getMetadata(function(err, metadata) {});
  */
});

}

function getDownloadImages() {
  var bucket2 = storageDownload.bucket('bucket_nano_ibf_images_download');
  bucket2.getFiles(function(err, files, nextQuery) {
  if (nextQuery) {
    // nextQuery will be non-null if there are more results.
    bucket2.getFiles(nextQuery, function(err, files, nextQuery) {});
  }
  if (err == null) {
      downloadImages = files;
      continuePrintingTable();
  }else {
    console.log("" + err);
    continuePrintingTable();
  }
});
}


function printUploadBucketButtons () {
  response2.write('<tr>');
  response2.write('<td>');
  response2.write('<br />');
  response2.write('</td>');
  response2.write('</tr>');

  response2.write('<tr>');
  response2.write('<td>');

  //response2.write('<input type="hidden" name="isMgntInterface" value="yes" />');
  response2.write('<input type="hidden" name="project" value="upload" />');
  response2.write('<input type="radio" name="action" value="DownloadSelected" checked/>');
  response2.write('&nbsp;');
  response2.write('Download Selected');

  response2.write('</td>');
  response2.write('<td>');
  response2.write('<input type="radio" name="action" value="TransferSelected" />');
  response2.write('&nbsp;');
  response2.write('Transfer Selected');
  response2.write('</td>');
  response2.write('</tr>');

  response2.write('<tr>');
  response2.write('<td>');
  response2.write('<input type="radio" name="action" value="DeleteSelected" />');
  response2.write('&nbsp;');
  response2.write('Delete Selected');
  response2.write('</td>');
  response2.write('<td>');
  response2.write('<input type="radio" name="action" value="TransferDeleteSelected" />');
  response2.write('&nbsp;');
  response2.write('Transfer and Delete Selected');
  response2.write('</td>');
  response2.write('</tr>');

  response2.write('<tr>');
  response2.write('<td colspan="2" align="center">');
  response2.write('<input type="submit" value="Go" />');
  response2.write('</td>');
  response2.write('</tr>');
}


function printDownloadBucketButtons () {
  response2.write('<tr>');
  /*
  response2.write('<td>');
  response2.write('<br />');
  response2.write('</td>');
  */
  response2.write('</tr>');

  response2.write('<tr>');
  response2.write('<td>');

  //response2.write('<input type="hidden" name="isMgntInterface" value="yes" />');
  response2.write('<input type="hidden" name="project" value="download" />');
  //response2.write('<input type="radio" name="action" value="DownloadSelected" />');
  response2.write('&nbsp;');
  //response2.write('Download Selected');

  response2.write('</td>');
  response2.write('<td>');
  //response2.write('<input type="radio" name="action" value="TransferSelected" />');
  response2.write('&nbsp;');
  //response2.write('Transfer Selected');
  response2.write('</td>');
  response2.write('</tr>');

  response2.write('<tr>');
  response2.write('<td>');
  response2.write('<input type="radio" name="action" value="DeleteSelected" checked/>');
  response2.write('&nbsp;');
  response2.write('Delete Selected');
  response2.write('</td>');
  response2.write('<td>');
  //response2.write('<input type="radio" name="action" value="TransferDeleteSelected" />');
  response2.write('&nbsp;');
  //response2.write('Transfer and Delete Selected');
  response2.write('</td>');
  response2.write('</tr>');

  response2.write('<tr>');
  response2.write('<td colspan="2" align="center">');
  response2.write('<input type="submit" value="Go" />');
  response2.write('</td>');
  response2.write('</tr>');
}

function continuePrintingTable() {
  printUploadPackages();
}

function printUploadPackages() {
  //upload packages

          //print select all toggle
          response2.write('<script language="JavaScript">');
          response2.write('function toggle(source) {');
          response2.write('checkboxes = document.getElementsByName("modelsSelected");');
          response2.write('for(var i=0, n=checkboxes.length;i<n;i++) {');
          response2.write('checkboxes[i].checked = source.checked;');
          response2.write('}');
          response2.write('checkboxesb = document.getElementsByName("duplicatesSelected");');
          response2.write('for(var j=0, f=checkboxesb.length;j<f;j++) {');
          response2.write('checkboxesb[j].checked = source.checked;');
          response2.write('}');
          response2.write('}');
          response2.write('function toggleNon(source) {');
          response2.write('checkboxes = document.getElementsByName("modelsSelected");');
          response2.write('for(var i=0, n=checkboxes.length;i<n;i++) {');
          response2.write('checkboxes[i].checked = source.checked;');
          response2.write('}');
          response2.write('}');
          response2.write('</script>');

          response2.write('<tr>');
          response2.write('<td colspan="2">');
          response2.write('<input type="checkbox" onClick="toggle(this)" />Select All');
          response2.write('<br />');
          response2.write('<input type="checkbox" onClick="toggleNon(this)" />Select All Non-Duplicates');
          response2.write('</td>');
          response2.write('</tr>');

    response2.write('<tr>');
    response2.write('<td>');
    response2.write('<form action="/browse/mgnt" method="get">');//for upload side
    response2.write('<table>');
    if(uploadPackages.length > 0) {
      for (a=0; a < uploadPackages.length; a++) {
        response2.write('<tr>');
        response2.write('<td>');

        if (stringExistInArray(uploadPackages[a].name, downloadPackages)) {
          response2.write('<input type="checkbox" name="duplicatesSelected" value="' + uploadPackages[a].name + '" />');
          response2.write('</td>');
          response2.write('<td>');
          divHighlight();
          printUploadPackagesHelper();
        }else {
          response2.write('<input type="checkbox" name="modelsSelected" value="' + uploadPackages[a].name + '" />');
          response2.write('</td>');
          response2.write('<td>');
          response2.write('<div>');
          printUploadPackagesHelper();
        }
      }
    }else {
          response2.write('<tr><td>&nbsp;</td></tr>');
          response2.write('</table>');
          response2.write('</td>');
          response2.write('</form>');
          printUploadImages();
    }
}
function printUploadPackagesHelper() {
        response2.write('' + uploadPackages[a].name);
        response2.write('</div>');
        response2.write('</td>');
        response2.write('</tr>');
        if (a == (uploadPackages.length-1)) {
          response2.write('</table>');
          response2.write('</td>');
          printUploadImages();
        }
}

function printUploadImages() {
  //upload images
    response2.write('<td>');
    if(uploadImages.length > 0) {
      for (b=0; b < uploadImages.length; b++) {
        response2.write('' + uploadImages[b].name);
        response2.write('<br />');
        if (b == (uploadImages.length-1)) {
          response2.write('</td>');
          response2.write('</tr>');
          printUploadBucketButtons();
          response2.write('</table>');
          response2.write('</form>');
          response2.write('</td>');
          response2.write('<td>');
          response2.write('<form action="/browse/mgnt" method="get">');//for download side
          response2.write('<table class="mgntTableInner">');

          printDownloadPackages();
        }
      }
    }else {
      //response2.write('&nbsp;');
      response2.write('</table>');
      response2.write('</form>');
      response2.write('</td>');
      response2.write('<td>');
      response2.write('<form action="/browse/mgnt" method="get">');//for download side
      response2.write('<table class="mgntTableInner">');
      printDownloadPackages();
    }
}

function printDownloadPackages() {
  //download packages
    //print select all toggle
          response2.write('<script language="JavaScript">');
          response2.write('function toggle2(source) {');
          response2.write('checkboxes = document.getElementsByName("modelsSelected");');
          response2.write('for(var i=0, n=checkboxes.length;i<n;i++) {');
          response2.write('checkboxes[i].checked = source.checked;');
          response2.write('}');
          response2.write('}');
          response2.write('</script>');

          response2.write('<tr>');
          response2.write('<td colspan="2">');
          response2.write('<input type="checkbox" onClick="toggle2(this)" />Select All');
          response2.write('</td>');
          response2.write('</tr>');

    response2.write('<tr>');
    response2.write('<td>');
    response2.write('<table>');
    for (c=0; c < downloadPackages.length; c++) {
        response2.write('<tr>');
        response2.write('<td>');
        response2.write('<input type="checkbox" name="modelsSelected" value="' + downloadPackages[c].name + '" />');
        response2.write('</td>');
        response2.write('<td>');

        if (stringExistInArray(downloadPackages[c].name, uploadPackages)) {
          divHighlight();
          printDownloadPackagesHelper();
        }else {
          response2.write('<div>');
          printDownloadPackagesHelper();
        }
    }
}

function printDownloadPackagesHelper(){
  response2.write('' + downloadPackages[c].name);
  response2.write('</div>');
  response2.write('</td>');
  response2.write('</tr>');
        if (c == (downloadPackages.length-1)) {
          response2.write('</table>');
          response2.write('</td>');
          printDownloadImages();
        }
}

function printDownloadImages() {
  //download images
    response2.write('<td>');
    for (d=0; d < downloadImages.length; d++) {
        //console.log("File: " + files[i].name);
        response2.write('' + downloadImages[d].name);
        response2.write('<br />');
        if (d == (downloadImages.length-1)) {
          response2.write('</td>');
          response2.write('</tr>');
          printDownloadBucketButtons();
          response2.write('</table>');
          response2.write('</form>');
          endMgnt();
        }
      }
}

function divHighlight() {
  response2.write('<div class="mgntHighlightDuplicate">');
}

function stringExistInArray(str, array) {
  //console.log("String: " + str);
  //console.log("array: " + array);
  for (e=0; e<array.length; e++) {
    if(array[e].name === str)
    {
      return true;
    }else if(e == (array.length-1)){
      //last iteration
      return false;
    }
  }
}

var strIPAddress = '';
function handleMgntFormData(response, IPAddress, params) {
  response2 = response;
  strIPAddress = IPAddress;
  if(params.isClearListTime == 'Yes') {
    try {
      browse.deleteFile('/home/pi/ibox/www/packages/_listTime.json');
    }catch(error) {
      console.log('There was an error deleting the file.');
      response2.write('There was an error deleting the file.');
    }
                response2.write('<head>');
                var metaString = '<META http-equiv="refresh" content="0;URL=http://' + strIPAddress + '/button_browse" />';
                response2.write('' + metaString);
                response2.write('</head>');
                response2.write('</div>');
                response2.write('</center>');
                response2.write('</body>');
                response2.write('</html>');
                response2.end();
  }else if((params.isDeleteAllMgntLocal == 'Yes') && (params.continueOn == 'Yes')) {
    //go ahead and delete all mgnt local models
    deleteAllMgntLocal();
  }else if((params.isDeleteAllLocal == 'Yes') && (params.continueOn == 'Yes')) {
    //go ahead and delete all local models
    deleteAllLocal();
  }else if(params.isDeleteAllMgntLocal == 'Yes') {
    //print are you sure form
    response2.write('<br />');
    response2.write('<div style="color:grey">Are you sure you want to delete ALL local Mgnt models forever?</div>');
    
    response2.write('<br />');
    response2.write('<table>');
    response2.write('<tr>');
    response2.write('<td align="left" width="100px">');
    response2.write('<form action="/button_browse" method="get">');
    response2.write('&nbsp;&nbsp;<input type="submit" value="Abort">');
    response2.write('</form>');
    response2.write('<td align="left" width="100px">');
    response2.write('<form action="/browse/mgnt" method="get">');
    response2.write('<td valign="top">');
    response2.write('&nbsp;&nbsp;');
    response2.write('<input type="hidden" name="isDeleteAllMgntLocal" value="Yes" />');
    response2.write('<input type="hidden" name="continueOn" value="Yes" />');
    response2.write('<input type="submit" value="Delete All Mgnt Local Models" />');
    response2.write('</td>');
    response2.write('</form>');
    response2.write('</td>');
    response2.write('</tr>');
    response2.write('</table>');
    response2.end();

  }else if(params.isDeleteAllLocal == 'Yes') {
    //print are you sure form
    response2.write('<br />');
    response2.write('<div style="color:grey">Are you sure you want to delete ALL local models forever?</div>');
    
    response2.write('<br />');
    response2.write('<table>');
    response2.write('<tr>');
    response2.write('<td align="left" width="100px">');
    response2.write('<form action="/button_browse" method="get">');
    response2.write('&nbsp;&nbsp;<input type="submit" value="Abort">');
    response2.write('</form>');
    response2.write('<td align="left" width="100px">');
    response2.write('<form action="/browse/mgnt" method="get">');
    response2.write('<td valign="top">');
    response2.write('&nbsp;&nbsp;');
    response2.write('<input type="hidden" name="isDeleteAllLocal" value="Yes" />');
    response2.write('<input type="hidden" name="continueOn" value="Yes" />');
    response2.write('<input type="submit" value="Delete All Local Models" />');
    response2.write('</td>');
    response2.write('</form>');
    response2.write('</td>');
    response2.write('</tr>');
    response2.write('</table>');
    response2.end();

  }else if(params.project == 'upload') {
    console.log('Submitted form on the upload side.');
      if(params.action == 'DownloadSelected') {
        downloadSelected(params);
      }else if(params.action == 'DeleteSelected') {
        deleteSelected(params);
      }else if(params.action == 'TransferSelected') {
        transferSelected(params, false);
      }else if(params.action == 'TransferDeleteSelected') {
        transferSelected(params, true);
      }
  }else if(params.project == 'download') {
    console.log('Submitted form on the download side.');
      if(params.action == 'DeleteSelected') {
        deleteDownloadSelected(params);
      }
  }
}


function downloadSelected(params) {
  //get model names and loop through and download
  console.log('download models');
  var modelsToDownload = [];
  if (typeof params.modelsSelected == 'string' || params.modelsSelected instanceof String) {
    // it's a string
    modelsToDownload.push(params.modelsSelected);
  }else {
    // it's something else, must be an array of strings
    if(params.modelsSelected != undefined) {
      modelsToDownload = params.modelsSelected;
    }
  }
  if (typeof params.duplicatesSelected == 'string' || params.duplicatesSelected instanceof String) {
    // it's a string
    modelsToDownload.push(params.duplicatesSelected);
  }else {
    // it's something else, must be an array of strings
    if (params.duplicatesSelected != undefined) {
      modelsToDownload = modelsToDownload.concat(params.duplicatesSelected);
    }
  }
  console.log('Models Selected: ' + modelsToDownload);

  if(modelsToDownload.length > 0) {
      recursiveDownload(modelsToDownload);
    }else {
      //nothing was selected
      var refreshLocation = "button_browse";
      response2.write('<br />');
      response2.write('<div class="divColor">Download can not be completed because no models were selected.</div><br /><a href="' + refreshLocation + '">Back</a>');
      browse.mainEnd(response2);
    }
}


function deleteSelected(params) {
  //get model names and loop through and delete
  console.log('delete selected');
  var modelsToDelete = [];
  if (typeof params.modelsSelected == 'string' || params.modelsSelected instanceof String) {
    // it's a string
    modelsToDelete.push(params.modelsSelected);
  }else {
    // it's something else, must be an array of strings
    if(params.modelsSelected != undefined) {
      modelsToDelete = params.modelsSelected;
    }
  }
  if (typeof params.duplicatesSelected == 'string' || params.duplicatesSelected instanceof String) {
    // it's a string
    modelsToDelete.push(params.duplicatesSelected);
  }else {
    // it's something else, must be an array of strings
    if (params.duplicatesSelected != undefined) {
     modelsToDelete = modelsToDelete.concat(params.duplicatesSelected);
    }
  }
  console.log('Models Selected: ' + modelsToDelete);

    if(modelsToDelete.length > 0) {
      recursiveDelete(modelsToDelete, storageUpload, false);
    }else {
      //nothing was selected
      var refreshLocation = "button_browse";
      response2.write('<br />');
      response2.write('<div class="divColor">Delete can not be completed because no models were selected.</div><br /><a href="' + refreshLocation + '">Back</a>');
      browse.mainEnd(response2);
    }
}

//below is delete for the download project
function deleteDownloadSelected(params) {
  //get model names and loop through and delete
  console.log('delete selected');
  var modelsToDelete = [];
  if (typeof params.modelsSelected == 'string' || params.modelsSelected instanceof String) {
    // it's a string
    modelsToDelete.push(params.modelsSelected);
  }else {
    // it's something else, must be an array of strings
    modelsToDelete = params.modelsSelected;
  }
  console.log('Models Selected: ' + modelsToDelete);

  if(modelsToDelete != undefined) {
      recursiveDelete(modelsToDelete, storageDownload, true);
    }else {
      //nothing was selected
      var refreshLocation = "button_browse";
      response2.write('<br />');
      response2.write('<div class="divColor">Delete can not be completed because no models were selected.</div><br /><a href="' + refreshLocation + '">Back</a>');
      browse.mainEnd(response2);
    }
}

function transferSelected(params, deleteFlag) {
  //delete is a true or false to delete the files in the upload project after they are transfered
  deleteFromUploadProject = false;
  deleteFromUploadProject = deleteFlag;
  //clear old transfer vars
  transferJSONPath = '';
  transferPackagePath = '';
  transferImagePath = '';
  transferJSONName = '';
  transferPackageName = '';
  transferImageName = '';

  //get model names, loop through and download into memory, then upload from memory to download project
  console.log('transfer selected with delete = ' + deleteFlag);
  var modelsToTransfer = [];
  if (typeof params.modelsSelected == 'string' || params.modelsSelected instanceof String) {
    // it's a string
    modelsToTransfer.push(params.modelsSelected);
  }else {
    // it's something else, must be an array of strings
    modelsToTransfer = params.modelsSelected;
  }
  console.log('Models Selected: ' + modelsToTransfer);

  if(params.duplicatesSelected == undefined) {
    if(modelsToTransfer != undefined) {
      recursiveTransfer(modelsToTransfer, deleteFlag);
    }else {
      //nothing was selected
      var refreshLocation = "button_browse";
      response2.write('<br />');
      response2.write('<div class="divColor">Transfer can not be completed because no models were selected.</div><br /><a href="' + refreshLocation + '">Back</a>');
      browse.mainEnd(response2);
    }
  }else {
    var refreshLocation = "button_browse";
    response2.write('<br />');
    response2.write('<div class="divColor">Transfer can not be completed because duplicate models were selected.</div><br /><a href="' + refreshLocation + '">Back</a>');
    browse.mainEnd(response2);
  }
}

var transferJSONPath = '';
var transferPackagePath = '';
var transferImagePath = '';
var transferJSONName = '';
var transferPackageName = '';
var transferImageName = '';
var deleteFromUploadProject = false;

function recursiveTransfer(models, deleteFlag) {
  modelsG = models;
  response2.write('<div class="divColor">');
  if(models.length > 0) {
    var nameOnGCS = models.pop();
    response2.write('Downloading ' + nameOnGCS + '...<br />');

    var bucket = storageUpload.bucket('bucket_nano_ibf_metadata');
    var packageName = nameOnGCS;
    var tempArr = packageName.split('.');
    tempName = tempArr[0];
    transferJSONPath = '/home/pi/ibox/www/packages/mgnt/temp/' + tempName + '.json';
    transferJSONName = tempName + '.json';
    bucket.file(tempName + '.json').createReadStream()
      .on('complete', function() {
          console.log('Package readstream complete');
        })
      .on('error', function() {
          console.log('There was an error trying to access the iBox Cloud file.');
          response2.write('<div class="divColor">There was an error trying to access the iBox Cloud file. Please try transfering again.</div>');
          response2.write('<br />');
          browse.mainEnd(response2);
        })
      .pipe(fs.createWriteStream('/home/pi/ibox/www/packages/mgnt/temp/' + tempName + '.json'))
      .on('finish', function() {

        //download package
        console.log('JSON fully downloaded.');
        var bucket2 = storageUpload.bucket('bucket_nano_ibf_packages');
        var packageName = tempName + '.zip';
        transferPackagePath = '/home/pi/ibox/www/packages/mgnt/temp/' + packageName;
        transferPackageName = packageName;
        response2.write('JSON fully downloaded.<br />');
        response2.write('Downloading ' + packageName + '...<br />');
        bucket2.file(packageName).createReadStream()
          .on('complete', function() {
            console.log('Package readstream complete.');
          })
          .on('error', function() {
            console.log('There was an error trying to access the iBox Cloud file.');
            response2.write('<div class="divColor">There was an error trying to access the iBox Cloud file. Please try transfering again.</div>');
            response2.write('<br />');
            browse.mainEnd(response2);
          })
          .pipe(fs.createWriteStream('/home/pi/ibox/www/packages/mgnt/temp/' + packageName))
          .on('finish', function() {
            //then download image
            console.log('Package fully downloaded.');
            var bucket2 = storageUpload.bucket('bucket_nano_ibf_images');
            var imageName = tempName + '.jpg';
            transferImagePath = '/home/pi/ibox/www/model_images/mgnt/temp/' + imageName;
            transferImageName = imageName;
            response2.write('Package fully downloaded.<br />');
            response2.write('Downloading ' + imageName + '...<br />');
            bucket2.file(imageName).createReadStream()
             .on('complete', function() {
                console.log('Image readstream complete.');
              })
             .on('error', function() {
                console.log('There was an error trying to access the iBox Cloud file.');
                response2.write('<div class="divColor">There was an error trying to access the iBox Cloud file. Please try transfering again.</div>');
                response2.write('<br />');
                browse.mainEnd(response2);
              })
              .pipe(fs.createWriteStream('/home/pi/ibox/www/model_images/mgnt/temp/' + tempName + '.jpg'))
              .on('finish', function() {
                console.log('Image fully downloaded.');
                response2.write('Image fully downloaded.<br />');
                //start transfering
                startTransfering();
              });
          });
          
      });

  }else {
    console.log('Something went wrong.');
  }
}

var jsonData = [];
function startTransfering() {
  try {
    var data = fs.readFileSync(transferJSONPath);
    jsonData.push(data.toString('utf8'));
  }catch(error) {
    console.log('Error reading: ' + transferJSONPath);
    response2.write('Error Reading: ' + transferJSONPath + '<br />');
    response2.write('Error Code: ' + error.code);
    response2.end();
  }
  uploadToDownloadProject();
}

function uploadToDownloadProject() {
    response2.write('Uploading JSON...<br />');
    var bucket = storageDownload.bucket('bucket_nano_ibf_metadata_download');
    fs.createReadStream(transferJSONPath).pipe(bucket.file(transferJSONName).createWriteStream().on('complete', function() {
      response2.write('Finished uploading JSON.<br />');
      response2.write('Uploading Package...<br />');
      //upload package
      var bucket = storageDownload.bucket('bucket_nano_ibf_packages_download');
      fs.createReadStream(transferPackagePath).pipe(bucket.file(transferPackageName).createWriteStream().on('complete', function() {
        response2.write('Finished uploading package.<br />');
        response2.write('Uploading image...<br />');
        //upload image
        var bucket = storageDownload.bucket('bucket_nano_ibf_images_download');
        fs.createReadStream(transferImagePath).pipe(bucket.file(transferImageName).createWriteStream().on('complete', function() {
          response2.write('Finished uploading image.<br />');
          //uploads done
          console.log('Finished uploading model to downloads.');
          response2.write('Finished uploading model to downloads.<br />');
          response2.write('Cleaning up...<br />');

          try {
            browse.deleteFile(transferJSONPath); //delete JSON
          }catch(error) {
            console.log('JSON was missing.');
            response2.write('JSON was not deleted.');
          }
          try {
            browse.deleteFile(transferPackagePath); //delete Package
          }catch(error) {
            console.log('Package was missing.');
            response2.write('Package was not deleted.');
          }
          try {
            browse.deleteFile(transferImagePath); //delete Image
          }catch(error) {
            console.log('Image was missing.');
            response2.write('Image was not deleted.');
          }

          if (deleteFromUploadProject) {
            //delete JSON, Package, and Image from upload project
            var bucket_metadata = storageUpload.bucket('bucket_nano_ibf_metadata');
            response2.write('Deleting ' + transferJSONName + ' from upload project...<br />');
            bucket_metadata.file(transferJSONName).delete(function() {
              var bucket_packages = storageUpload.bucket('bucket_nano_ibf_packages');
              console.log(transferJSONName + 'deleted from upload project.');
              response2.write(transferJSONName + 'deleted from upload project.<br />');
              response2.write('Deleting ' + transferPackageName + ' from upload project...<br />');
              bucket_packages.file(transferPackageName).delete(function() {
                var bucket_images = storageUpload.bucket('bucket_nano_ibf_images');
                console.log(transferPackageName + 'deleted from upload project.');
                response2.write(transferPackageName + 'deleted from upload project.<br />');
                response2.write('Deleting ' + transferImageName + ' from upload project...<br />');
                bucket_images.file(transferImageName).delete(function() {
                  console.log(transferImageName + 'deleted from upload project.');
                  response2.write(transferImageName + 'deleted from upload project.<br />');

                  //send meta refresh
                  transferMetaRefresh();
                });
              });
            });
          } else {
            //send meta refresh
            transferMetaRefresh();
          }
          
        }));
      }));
    }));
}

function transferMetaRefresh() {
  //final actions
      //after extacting do below
            response2.write('<head>');
            if (modelsG.length > 0) {
              var metaString = '<META http-equiv="refresh" content="0;URL=http://' + strIPAddress + '/browse/mgnt?';
              for (d=0; d<modelsG.length; d++) {
              metaString += 'modelsSelected=' + modelsG[d] + '&';
              if (d == modelsG.length-1) {
                //last iteration
                if(deleteFromUploadProject) {
                  metaString += 'project=upload&action=TransferDeleteSelected"';
                }else {
                  metaString += 'project=upload&action=TransferSelected"';
                }
                response2.write('' + metaString);
                response2.write('</head>');
                response2.write('</div>');
                response2.write('</center>');
                response2.write('</body>');
                response2.write('</html>');
                response2.end();
              }
              }
            } else {
              //append to the JSON here and then do the below code
              updateListJSON(true); // true for append
            }
            //end of final actions
}


function updateListJSON(isAppend) {
  var bucket = storageDownload.bucket('bucket_nano_ibf_metadata_download');
  response2.write('Downloading _list.json file...');
    bucket.file('_list.json').createReadStream()
      .on('complete', function() {
        console.log('Readstream complete');
      })
      .on('error', function() {
            console.log('There was an error trying to access the iBox Cloud file.');
            response2.write('<div class="divColor">There was an error trying to access the iBox Cloud _list.json file. Please try again.</div>');
            response2.write('<br />');
            browse.mainEnd(response2);
      })
      .pipe(fs.createWriteStream('/home/pi/ibox/www/packages/mgnt/temp/_list.json'))
      .on('finish', function(){
        console.log('_list.json fully downloaded.');
        response2.write('_list.json fully downloaded.<br />');
        response2.write('Reading JSON file...<br />');
        var data;
        try{
          data = fs.readFileSync('/home/pi/ibox/www/packages/mgnt/temp/_list.json');
          response2.write('JSON file read.<br />');
          response2.write('Updating JSON file...');
          //take data string and add everything from jsonData array to it
          data = data.toString('utf8');
          editJSONString(data, jsonData, isAppend);//data is old and json data is new info
          response2.write('Finished Updating.<br />');
          uploadListJSON();

        }catch(error) {
          console.log('Error reading: ' + '/home/pi/ibox/www/packages/mgnt/temp/_list.json');
          response2.write('Error Reading: ' + '/home/pi/ibox/www/packages/mgnt/temp/_list.json' + '<br />');
          console.log('Error Code: ' + error.code);
          response2.write('Error Code: ' + error.code);
          response2.end();
        }
      });
}

function uploadListJSON() {
  //upload _list.json back onto gcloud
  var bucket = storageDownload.bucket('bucket_nano_ibf_metadata_download');
  response2.write('Uploading _list.json...<br />');



  response2.write('Uploading JSON...<br />');
  var myTime = Math.floor((new Date).getTime()/1000);
    var bucket = storageDownload.bucket('bucket_nano_ibf_metadata_download');
    fs.createReadStream('/home/pi/ibox/www/packages/mgnt/temp/_list.json').pipe(bucket.file('_list.json').createWriteStream({
    metadata: {
      contentType: 'application/json',
      metadata: {
        lastUpdateTime: '' + myTime
      }
    }
  }).on('complete', function(){
  
            console.log('Finished uploading _list.json.');
            response2.write('Finished uploading _list.json.<br />');
            response2.write('Deleting /mgnt/temp/_list.json...');
            browse.deleteFile('/home/pi/ibox/www/packages/mgnt/temp/_list.json');// delete _list.json
            response2.write('Deleted.<br />');
            response2.write('Done.');

            //they are all transfered
                response2.write('<head>');
                var metaString = '<META http-equiv="refresh" content="0;URL=http://' + strIPAddress + '/button_browse" />';
                response2.write('' + metaString);
                response2.write('</head>');
                response2.write('</div>');
                response2.write('</center>');
                response2.write('</body>');
                response2.write('</html>');
                response2.end();

  }));

}


function editJSONString(oldData, newDataArray, isAppend) {
  //takes the two variables and generates the updated json string
  console.log('isAppend: ' + isAppend);
  if(isAppend) {
    //append to the json
    console.log('==========================editJSONString : BEFORE REPLACE : oldData=')
    oldData = oldData.replace('{"models": [', ('{"models": [\n' + newDataArray.pop() + ','));
    console.log('==========================editJSONString : DONE :  oldData=')
  }else {
    //remove from the json
    var strToRemove = newDataArray.pop();
    if(oldData.indexOf(',\n' + strToRemove) > -1) {
      oldData = oldData.replace((',\n' + strToRemove), '');
    }else {
      //it must be on top
      console.log('It must be on top.');
      oldData = oldData.replace((strToRemove + ',\n'), '');
    }
    
  }

  if (newDataArray.length > 0) {
    editJSONString(oldData, newDataArray, isAppend);
  }else {
    //done appending json string
    //console.log('newData: ' + oldData);
    saveJSONString(oldData);
  }
}
function saveJSONString(jsonString) {
  //saves the string to the _list.json file in the temp directory
  fs.writeFileSync("/home/pi/ibox/www/packages/mgnt/temp/_list.json", jsonString);
}

var packagesString = 'bucket_nano_ibf_packages';
var imagesString = 'bucket_nano_ibf_images';
var metadataString = 'bucket_nano_ibf_metadata';
var imageName;
var jsonName;
function recursiveDelete(models, storage, isDownloadProject) {

  if(isDownloadProject) {
    packagesString = 'bucket_nano_ibf_packages_download';
    imagesString = 'bucket_nano_ibf_images_download';
    metadataString = 'bucket_nano_ibf_metadata_download';
  }

  if (models.length > 0) {
  response2.write('<div class="divColor">');
  var nameOnGCS = models.pop();
  modelsG = models;
  var tempArr = nameOnGCS.split('.');
  tempName = tempArr[0];
  imageName = tempName + '.jpg';
  jsonName = tempName + '.json';

  if(isDownloadProject) {
    //download the json and get and add the string to jsonData before deleting
    var bucket = storage.bucket(metadataString);
    bucket.file(jsonName).createReadStream()
      .on('complete', function() {
          console.log('Package readstream complete');
        })
      .on('error', function() {
            console.log('There was an error trying to access the iBox Cloud file.');
            response2.write('<div class="divColor">There was an error trying to access the iBox Cloud file. Please try downloading again.</div>');
            response2.write('<br />');
            browse.mainEnd(response2);
          })
      .pipe(fs.createWriteStream('/home/pi/ibox/www/packages/mgnt/temp/' + jsonName))
      .on('finish', function() {
        console.log('JSON fully downloaded.');
        response2.write('JSON fully downloaded.<br />');

        try {
          var data = fs.readFileSync('/home/pi/ibox/www/packages/mgnt/temp/' + jsonName);
          jsonData.push(data.toString('utf8'));
        }catch(error) {
          console.log('Error reading: ' + '/home/pi/ibox/www/packages/mgnt/temp/' + jsonName);
          response2.write('Error Reading: ' + '/home/pi/ibox/www/packages/mgnt/temp/' + jsonName + '<br />');
          response2.write('Error Code: ' + error.code);
          response2.end();
        }
        browse.deleteFile('/home/pi/ibox/www/packages/mgnt/temp/' + jsonName);
        //delete files from project
        gcloudDelete(storage, nameOnGCS, imageName, jsonName, isDownloadProject);

      });

  }else {
    gcloudDelete(storage, nameOnGCS, imageName, jsonName, isDownloadProject);
  }

}else {

  if(isDownloadProject) {
    updateListJSON(false);//false do not append, remove instead
  }else {
    //finished deleteing everything
                response2.write('<head>');
                var metaString = '<META http-equiv="refresh" content="0;URL=http://' + strIPAddress + '/button_browse" />';
                response2.write('' + metaString);
                response2.write('</head>');
                response2.write('</div>');
                response2.write('</center>');
                response2.write('</body>');
                response2.write('</html>');
                response2.end();
  }
  
}

}


function gcloudDelete(storage, nameOnGCS, imageName, jsonName, isDownloadProject) {
  var bucket = storage.bucket(packagesString);
  bucket.file(nameOnGCS).delete(function() {
    response2.write('Package ' + nameOnGCS + ' deleted.<br />');
    var bucket2 = storage.bucket(imagesString);
    bucket2.file(imageName).delete(function() {
      response2.write('Image ' + imageName + ' deleted.<br />');
      var bucket3 = storage.bucket(metadataString);
      bucket3.file(jsonName).delete(function() {
      response2.write('JSON ' + jsonName + ' deleted.<br />');
      recursiveDelete(modelsG, storage, isDownloadProject);
      });
    });
  });
}

var modelsG = [];
var tempName = '';
function recursiveDownload(models) {
  modelsG = models;
  response2.write('<div class="divColor">');
  if(models.length > 0) {
    var nameOnGCS = models.pop();
    response2.write('Downloading ' + nameOnGCS + '...<br />');

    var bucket = storageUpload.bucket('bucket_nano_ibf_packages');
    var packageName = nameOnGCS;
    var tempArr = packageName.split('.');
    tempName = tempArr[0];
    bucket.file(packageName).createReadStream()
      .on('complete', function() {
          console.log('Package readstream complete');
        })
      .on('error', function() {
            console.log('There was an error trying to access the iBox Cloud file.');
            response2.write('<div class="divColor">There was an error trying to access the iBox Cloud file. Please try downloading again.</div>');
            response2.write('<br />');
            browse.mainEnd(response2);
        })
      .pipe(fs.createWriteStream('/home/pi/ibox/www/packages/mgnt/compressed/' + packageName))
      .on('finish', function() {
        console.log('Package fully downloaded.');
        var bucket2 = storageUpload.bucket('bucket_nano_ibf_images');
        var imageName = tempName + '.jpg';
        response2.write('Package fully downloaded.<br />');
        response2.write('Downloading ' + imageName + '...<br />');
        bucket2.file(imageName).createReadStream()
          .on('complete', function() {
            console.log('Image readstream complete.');
          })
          .on('error', function() {
            console.log('There was an error trying to access the iBox Cloud file.');
            response2.write('<div class="divColor">There was an error trying to access the iBox Cloud file. Please try downloading again.</div>');
            response2.write('<br />');
            browse.mainEnd(response2);
          })
          .pipe(fs.createWriteStream('/home/pi/ibox/www/model_images/mgnt/' + tempName + '.jpg'))
          .on('finish', function() {
            console.log('Image fully downloaded.');
            //recursiveDownload(modelsG);
            response2.write('Image fully downloaded.<br />Extracting package...<br />');

            startExtracting(tempName);
            
            
          });


          
      });

  }else {
    console.log('Something went wrong.');
  }
}

var AdmZip = require('adm-zip');
var zip;
function startExtracting(name) {
  try{
      zip = new AdmZip("/home/pi/ibox/www/packages/mgnt/compressed/" + name + ".zip");
      console.log(name + ' is extracting into expanded directory.');
      zip.extractAllTo(/*target path*/"/home/pi/ibox/www/packages/mgnt/expanded/" + name + "/", /*overwrite*/true);
      console.log('Finished extracting: ' + name);
      response2.write('Finished extracting: ' + name +'<br />');
      browse.updateCreationDate(name, true);
      //final actions
      //after extacting do below
            response2.write('<head>');
            if (modelsG.length > 0) {
              var metaString = '<META http-equiv="refresh" content="0;URL=http://' + strIPAddress + '/browse/mgnt?';
              for (d=0; d<modelsG.length; d++) {
              metaString += 'modelsSelected=' + modelsG[d] + '&';
              if (d == modelsG.length-1) {
                //last iteration
                metaString += 'project=upload&action=DownloadSelected"';
                response2.write('' + metaString);
                response2.write('</head>');
                response2.write('</div>');
                response2.write('</center>');
                response2.write('</body>');
                response2.write('</html>');
                response2.end();
              }
              }
            } else {
              //they are all downloaded
                response2.write('<head>');
                var metaString = '<META http-equiv="refresh" content="0;URL=http://' + strIPAddress + '/button_browse" />';
                response2.write('' + metaString);
                response2.write('</head>');
                response2.write('</div>');
                response2.write('</center>');
                response2.write('</body>');
                response2.write('</html>');
                response2.end();
            }
            //end of final actions

    }catch(err) {
      console.log('There was an error trying to extract compressed download.');
      console.log('Error Code: ' + err.code);
      //response2.write('<div style="color:grey">Error Code: ' + err.code + '</div>');
      response2.write('<div style="color:grey">There was an error trying to extract the downloaded model "' + name + '". Please try downloading the model again.</div>');
    }
}

function printMgntOptions(response) {
  //response.write('<br />');
  response.write('<table align="center" valign="top">');
  response.write('<tr>');
  //below not needed anymore because list time is updated automatically
  /*
  response.write('<form action="/browse/mgnt" method="get">');
  response.write('<td valign="top">');
  response.write('<input type="hidden" name="isClearListTime" value="Yes" />');
  response.write('<input type="submit" value="Clear iBox Cloud _listTime.json" />');
  response.write('</td>');
  response.write('</form>');
  */
  response.write('<form action="/browse/mgnt" method="get">');
  response.write('<td valign="top">');
  response.write('&nbsp;&nbsp;');
  response.write('<input type="hidden" name="isDeleteAllMgntLocal" value="Yes" />');
  response.write('<input type="submit" value="Delete All Mgnt Local Models" />');
  response.write('</td>');
  response.write('</form>');
  response.write('<form action="/browse/mgnt" method="get">');
  response.write('<td valign="top">');
  response.write('&nbsp;&nbsp;');
  response.write('<input type="hidden" name="isDeleteAllLocal" value="Yes" />');
  response.write('<input type="submit" value="Delete All Local Models" />');
  response.write('</td>');
  response.write('</form>');
  response.write('</tr>');
  response.write('</table>');
}

function deleteAllLocal() {
  console.log('Delete all local called.');

  fs.readdirSync('/home/pi/ibox/www/packages/expanded').forEach(function(file,index){
    var curPath = '/home/pi/ibox/www/packages/expanded' + "/" + file;
    if(fs.lstatSync(curPath).isDirectory()) {
      browse.deleteDir(curPath);
    }
  });
  fs.readdirSync('/home/pi/ibox/www/packages/compressed').forEach(function(file,index){
    var curPath = '/home/pi/ibox/www/packages/compressed' + "/" + file;
    if(!fs.lstatSync(curPath).isDirectory()) {
      browse.deleteFile(curPath);
    }
  });
  fs.readdirSync('/home/pi/ibox/www/model_images').forEach(function(file,index){
    var curPath = '/home/pi/ibox/www/model_images' + "/" + file;
    if(!fs.lstatSync(curPath).isDirectory()) {
      browse.deleteFile(curPath);
    }
  });
  console.log('Finished Deleting');
      var refreshLocation = "button_browse";
      response2.write('<br />');
      response2.write('<div class="divColor">All Local Models deleted.</div><br /><a href="' + refreshLocation + '">Back</a>');
      browse.mainEnd(response2);
}
function deleteAllMgntLocal() {
  console.log('Delete all mgnt local called.');

  fs.readdirSync('/home/pi/ibox/www/packages/mgnt/expanded').forEach(function(file,index){
    var curPath = '/home/pi/ibox/www/packages/mgnt/expanded' + "/" + file;
    if(fs.lstatSync(curPath).isDirectory()) {
      browse.deleteDir(curPath);
    }
  });
  fs.readdirSync('/home/pi/ibox/www/packages/mgnt/compressed').forEach(function(file,index){
    var curPath = '/home/pi/ibox/www/packages/mgnt/compressed' + "/" + file;
    if(!fs.lstatSync(curPath).isDirectory()) {
      browse.deleteFile(curPath);
    }
  });
  fs.readdirSync('/home/pi/ibox/www/model_images/mgnt').forEach(function(file,index){
    var curPath = '/home/pi/ibox/www/model_images/mgnt' + "/" + file;
    if(!fs.lstatSync(curPath).isDirectory()) {
      browse.deleteFile(curPath);
    }
  });
  console.log('Finished Deleteing');
    var refreshLocation = "button_browse";
      response2.write('<br />');
      response2.write('<div class="divColor">All Mgnt Local models deleted.</div><br /><a href="' + refreshLocation + '">Back</a>');
      browse.mainEnd(response2);
}

function endMgnt() {
  response2.write('</td>');
  response2.write('</tr>');
  response2.write('</table>');
  response2.write('<br />');
  //browse.printUserInterface(response2, myBrowseListG);
  browse.mainEnd(response2);
}

exports.mgntKeyExist = mgntKeyExist;
exports.printMgnt = printMgnt;
exports.handleMgntFormData = handleMgntFormData;
exports.printMgntOptions = printMgntOptions;