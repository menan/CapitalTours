function buildUI() {
	navOverride();
	surveyPageTracker();
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
	var surveyUrl = Brule.resources.Survey_URL;

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

	
}



$.fn.maxWidth = function() {
	this.width(document.width);
}