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
			// get current location
			//getLatLong();
			
			// start watching location
			//watchLatLong();
			
			// get current location
			//getCurrentLatLng();
			break;
		case 'UNKNOWN':
		case 'NONE':
			//noInternetConnection(connectionType);
			break;
		default:
			//noInternetConnection('UNKNOWN ERROR');
			break;
	}
	
	loadDeviceLogic();
	bindI18tn();
	setUpUA();
	prepMediaPages();
	osActions();
	initAnalytics();
	buildUI();
	// install pg plugins	
	//installPlugins();
	showTourSets()
}

/*
function installPlugins(){
	switch (devicePlatform) {
		case 'iPhone':
		case 'iPhone Simulator':
			//console.log('Installing plugins for iPhone');
			cb = ChildBrowser.install();
			fbPlugin = FBConnect.install();
			break;		
		case 'Android':
			//console.log('Installing plugins for Android');
			cb = window.plugins.childBrowser;
			fbPlugin = FBConnect.install();
			break;
		case 'BlackBerry':
			//console.log('Installing plugins for BlackBerry');
			cb = window.plugins.childBrowser;
			fbPlugin = FBConnect.install();
			break;
		default:
			if(devicePlatform != 'desktop' && navigator.userAgent.match(/BlackBerry/i)) {
				//console.log('Installing plugins for BlackBerry');
				cb = window.plugins.childBrowser;
				fbPlugin = FBConnect.install();
			}
			break;		
	}	
}
*/

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