$(function(){
	// lawnchair android fix
	// see: http://blog.doityourselfandroid.com/2012/04/06/phonegap-migrating-ios-application-android/
	JSON.originalParse = JSON.parse;

	JSON.parse = function(text){
		if (text) {
			return JSON.originalParse(text);
		} 
		else {
			// no longer crashing on null value but just returning null
			return null;
		}
	}
});

function osActions() { }

//set up GA plugin
function initAnalytics() {
	var gaID = "UA-32832674-1"		//capital tours account
	window.plugins.analytics.start(gaID);
	analytics = window.plugins.analytics;
	
	initPagetracker();
}

//track a page in GA. Page MUST start with "/"
function trackPage(id)
{
	if (analytics) {
	    //console.log("start trackpage: " + id);
	    window.plugins.analytics.trackPageView('/'+id);
	    //console.log("end trackpage: " + id);
    }
}

//track an event in GA. 
function trackEvent(category, action, label) {
	if (analytics) {
		//console.log("start trackevent: " + category + ", " + action + ", " + label);
		//category = "capitaltour";	//change this to the app name
		window.plugins.analytics.trackEvent(category, action, label, 333);
		//console.log("end trackevent: " + + category + ", " + action + ", " + label);
	}
}

function initPagetracker() {
	trackPage('launch/android');
}

function oldOS() {
	return (parseFloat(device.version) <= 2.2) ? true : false;
}

function firstRun() {
	trackPage('first-launch');
}