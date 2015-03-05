// globals
var cb;
var fbPlugin;
var devicePlatform;
var userAgent;
var analytics;

function isMobile() {
	return (typeof device !== 'undefined')
}

function onDeviceReady(){
	devicePlatform = isMobile() ? device.platform : 'desktop';
	console.log(devicePlatform + ' initialized from main.js');
	// check connection type and proceed accordingly
	var connectionType = checkConnection();
	switch (connectionType)
	{
		case 'ETHERNET':
		case 'WIFI':
		case '2G':
		case '3G':
		case '4G':		
			break;
		case 'UNKNOWN':
		case 'NONE':
		
			break;
		default:
		
			break;
	}
	
	loadDeviceLogic();
	bindI18tn();
	setUpUA();
	prepMediaPages();
	osActions();
	initAnalytics();
	buildUI();
	showTourSets()
}



function checkConnection() {
  
	var networkState = isMobile() ? navigator.network.connection.type : 'desktop';

	var states = {};
	states[Connection.UNKNOWN]  = 'UNKNOWN';
	states[Connection.ETHERNET] = 'ETHERNET';
	states[Connection.WIFI]     = 'WIFI';
	states['desktop']   		= 'WIFI';
	states[Connection.CELL_2G]  = '2G';
	states[Connection.CELL_3G]  = '3G';
	states[Connection.CELL_4G]  = '4G';
	states[Connection.NONE]     = 'NONE';

	//console.log('Connection type: ' + states[networkState]);

	return states[networkState];
}

function isConnected() {
	return ((checkConnection() != 'NONE') && (checkConnection() != 'UNKNOWN'));
}

// open childbrowser for URL
function openChildBroswer(url) {
	//console.log('Opening child browser for: ' + url);
    
	try {
		cb.showWebPage(url);
	}
	catch (err)
	{
		//console.log('Child Browser error: ' + err);
	}
}