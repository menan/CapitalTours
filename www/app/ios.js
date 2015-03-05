function osActions() {
	
}

//set up GA plugin
function initAnalytics() {
	var gaID = "UA-32832674-1"		//capital tours account
	window.plugins.googleAnalyticsPlugin.startTrackerWithAccountID(gaID);
	analytics = window.plugins.googleAnalyticsPlugin;
	initPagetracker();
}

//track a page in GA. Page MUST start with "/"
function trackPage(id) {
	if (analytics) {
	    //console.log("start trackpage: " + id);
	    window.plugins.googleAnalyticsPlugin.trackPageview('/'+id);
	    //console.log("end trackpage: " + id);
    }
}

//track an event in GA. 
function trackEvent(category, action, label) {
	if (analytics) {
		//console.log("start trackevent: " + category + ", " + action + ", " + label);
		window.plugins.googleAnalyticsPlugin.trackEvent(category, action, label, 333);
		//console.log("end trackevent: " + category + ", " + action + ", " + label);
	}
}

function initPagetracker() {
	trackPage('launch/ios');
}

function firstRun() {
	trackPage('first-launch');
}