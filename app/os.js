var analytics;

function loadDeviceLogic() {
	//console.log('Loading support files for ' + devicePlatform);
	switch (devicePlatform) {
		case 'iPhone':
		case 'iPhone Simulator':
			//console.log('Loading support files for iOS');
			loadPGAssets(devicePlatform);
			break;		
		case 'Android':
			//console.log('Loading support files for Android');
			loadPGAssets(devicePlatform);
			break;		
		default:
			//console.log('Loading support files for fallback');
			deviceFallback();
			break;
	}
	loadBrowserAssets(navigator.userAgent);
}


function loadBrowserAssets(agent) {
	if (agent.match(/iPhone/i)) {
		//console.log('loadBrowserAssets iPhone');
		var version = parseInt($.browser.version);
		$('head').append('<link rel="stylesheet" href="css/ios.css"/>');
		if (version && (version < 534)) {
			$('head').append('<link rel="stylesheet" href="css/ios4.css"/>');
		} 
	}		
	if (agent.match(/Android/i)) {
		//console.log('loadBrowserAssets Android');
		$('head').append('<link rel="stylesheet" href="css/android.css"/>');
		$('head').append('<script type="text/javascript" charset="utf-8" src="app/video.js"></script>');		
		if (!isMobile()) droidDbFix();
		
	}
	if (agent.match(/BlackBerry/i)) {
		//console.log('loadBrowserAssets BlackBerry');
		$('head').append('<script type="text/javascript" charset="utf-8" src="app/bb.js"></script>');
		$('head').append('<link rel="stylesheet" href="css/bb.css"/>');
	}
}


function loadPGAssets(platform) {
	//console.log('loadPGAssets ' + platform);
	switch (platform) {
		case 'iPhone':
		case 'iPhone Simulator':
			$('head').append('<script type="text/javascript" charset="utf-8" src="app/ios.js"></script>');
			break;		
		case 'Android':
			$('head').append('<script type="text/javascript" charset="utf-8" src="app/android.js"></script>');
			$('head').append('<link rel="stylesheet" href="css/android.css"/>');
			break;	
	}
}

function deviceFallback() {
	$('head').append('<script type="text/javascript" charset="utf-8" src="app/desktop.js"></script>');
}

function droidDbFix() {
	JSON.originalParse = JSON.parse;

	JSON.parse = function(text){
		if (text) {
			return JSON.originalParse(text);
		} 
		else {
			return null;
		}
	}
}