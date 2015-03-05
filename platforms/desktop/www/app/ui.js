function buildUI() {
	navOverride();
	//surveyPageTracker();
	//trackTime();
}

var offeredSurvey, pagesViewed = 0, pagesBeforeSurveyOffer = 100;
function surveyPageTracker() {

	store.settings.get("surveyed", function(obj){
	  if(!obj) {
	  	store.settings.save({key: "surveyed", value: false});
	  	offeredSurvey = false;
	  }
	  else offeredSurvey = obj.value;
	})

	if (!offeredSurvey) $(document).bind("pagechange", pageIncrement);
	
	function pageIncrement() {
	
		pagesViewed++;
		if (pagesViewed >= pagesBeforeSurveyOffer && !offeredSurvey) {
			offeredSurvey = true;
			store.settings.save({key: "surveyed", value: true});
			if (typeof navigator.notification !== 'undefined') 
				navigator.notification.confirm(unescapeHtml(Brule.resources.Offer_survey), surveyAction, ' ', ''+Brule.resources.Yes+','+Brule.resources.No+'');
			$(document).unbind("pagechange", pageIncrement);
		}
	}
}

function surveyAction(btn) {
	var surveyUrl = "http://www.canadascapital.gc.ca/";

	if (btn == 1) {
		trackEvent('feedback', 'survey', 'open');
		if(typeof window.plugins.childBrowser === 'undefined') {
			if(devicePlatform == "iPhone" || devicePlatform == "iPhone Simulator") {
				var cb = ChildBrowser.install();
			}
			else {
				cb = window.plugins.childBrowser;
			}
		}
	
		window.plugins.childBrowser.showWebPage(surveyUrl, { showLocationBar: false });
	
		window.plugins.childBrowser.onLocationChange = function(loc) {
		    if (loc === remoteCmsURL+"/social/twitter/index.html?success") {
				trackEvent('feedback', 'survey', 'complete');
				window.plugins.childBrowser.close();
				return false;
			}
		};
		
		window.plugins.childBrowser.onClose = function() {
			return false;
		}
	}
}

//disable tap toggle on fixed toolbars
function navOverride() {
	$("[data-role=footer], [data-role=header]").fixedtoolbar({ tapToggle: false });

	/*
$('[data-role=navbar] .home a').bind('tap', function(e){
		e.preventDefault();
		//console.log('go home!');
		$.mobile.changePage($('#tour-home'),{allowSamePageTransition:true});
	});
*/
}

//persist time settings across "tour set" and "waypoint" -- needs expansion into general time prefs tracking
//deprecated
function trackTime() {
	$('.tour-times .radio-tourtime').change(function(){
		$('.tour-times .radio-tourtime').attr('checked',false).checkboxradio("refresh");
	    var sel = $(this).attr('value');
	    $('[value=' + sel + ']').attr('checked',true).checkboxradio("refresh");
	});
}

$.fn.maxWidth = function() {
	this.width(document.width);
}