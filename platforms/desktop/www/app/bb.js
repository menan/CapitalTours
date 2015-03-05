function osActions() {
	
}

//set up GA plugin
function initAnalytics() {

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-11666211-12']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    analytics = true;
  })();
	
	setTimeout(initPagetracker,1000)
}

//track a page in GA. Page MUST start with "/"
function trackPage(id)
{
	if (analytics) {
	    //console.log("start trackpage: " + id);
	    _gaq.push(['_trackPageview', '/'+id]);
	    //console.log("end trackpage: " + id);
    }
}

//track an event in GA. 
function trackEvent(category, action, label) {
	if (analytics) {
		//console.log("start trackevent: " + category + ", " + action + ", " + label);
		//category = "capitaltour";	//change this to the app name
		_gaq.push(['_trackEvent', category, action, label]);
		//console.log("end trackevent: " + category + ", " + action + ", " + label);
	}
}

function initPagetracker() {
	trackPage('launch/blackberry');
}

function firstRun() {
	navigator.notification.alert(Brule.resources.BB_remote_connect, null, '');
	trackPage('first-launch');
}