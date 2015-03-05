var remoteCmsURL = "http://tour.canadascapital.ca";

/*
* javascript objects used to store app data
*/
var pages = {
 name: "Pages",
 description: "Statics pages.",
 english: {
   items: []
 },
 french: {
   items: []
 } 
}

var topics = {
 name: "Topics",
 description: "Waypoint topics.",
 english: {
   items: []
 },
 french: {
   items: []
 } 
}

var waypoints = {
 name: "Waypoints",
 description: "Tour waypoints.",
 english: {
   items: []
 },
 french: {
   items: []
 } 
}

var favourites = {
	name: "Favourites",
	description: "Stared waypoints favourites list.",
	items: []	
}

function showBody() {
	$('.waypoint-body').toggleClass('show');
}

function keepBody() {
	$('.waypoint-body').toggleClass('keep');
}

function setUpUA() {
	$('#ua-switch').change(function(){
		uaEnabled = ($(this).val() == 'on') ? true : false;
		trackEvent('switch', 'ua', String(uaEnabled));
	});
}

// Show More Toggle
$("#body-toggle").live('tap', function() {
	$('.waypoint-body .inner').wrapInner('<div class="content" />');
	if ($('.waypoint-body .inner .content').height() < $('.waypoint-body .inner').height()) keepBody();
	else showBody();
});

$(document).delegate('input[name="radio-tourtime-2"]', "change", function(e) {
	e.preventDefault();
	currentWeight.set($(this).val());
	$.mobile.changePage( "#tour", { transition: "none"} );
	trackEvent('button', 'time', $(this).val());
});

$(document).delegate("#waypoint", "pagebeforeshow", function(e) {
  
  showWayPointDetail();
  
  var $page = $("#waypoint"),
  	  $header = $page.children(":jqmData(role=header)"),
  	  $content = $page.children(":jqmData(role=content)");
  
  $content.find("a#wpaudio").attr("href", "#audio?wp=" + currentWp.get());
  $content.find("a#wpvideo").attr("href", "#video?wp=" + currentWp.get());
  
  store.settings.get("bookmarks", function(bookmarks) {
	if(bookmarks) {
		if($.inArray(currentWp.get(), bookmarks.value) > -1) {
	    	$header.find(":jqmData(role=favourites-button)").addClass("ui-btn-active");
	    }
	    else {
	    	$header.find(":jqmData(role=favourites-button)").removeClass("ui-btn-active");
	    }  
	}
	$content.find(":jqmData(role=controlgroup)").controlgroup("refresh");
	$content.find(":jqmData(role=listview)").listview("refresh");
  });
  
  $page.page();
});

$(document).delegate("#perspectives", "pagebeforeshow", function(e) {
	//showPerspectives(currentWp.get());
	var $page = $("#perspectives"),
	$header = $page.children(":jqmData(role=header)"),
	$content = $page.children(":jqmData(role=content)");
	$content.find(":jqmData(role=listview)").listview("refresh");
	$page.page();
});

$(document).delegate(":jqmData(role=favourites-button)", "tap", function(e) {
	e.preventDefault();
	
	if($(this).hasClass("ui-btn-active")) {
		$(this).removeClass("ui-btn-active");
		store.settings.get("bookmarks", function(obj) {
			var bmArr;
			
			if(obj && obj.value) {
				//console.log(JSON.stringify(obj.value));
				if(obj.value.length < 2) {
					bmArr = [];	
				}
				else {
					for(var i = 0; i < obj.value.length; i++) {
						if(obj.value[i] == currentWp.get()) {
							obj.value.splice(i, 1);
							bmArr = obj.value;
							break;
						}
					}
				}
				
				store.settings.save({key:"bookmarks", value: bmArr }, function() {
					trackEvent('button', 'bookmark-remove', currentWp.get());  
				});				
			}
		});
	} 
	else {
		$(this).addClass("ui-btn-active");
		store.settings.get("bookmarks", function(obj) {
			var bookmarks;
			
			if(obj && obj.value) {
				bookmarks = obj.value;	
			}
			else {
				bookmarks = [];
			}
			
			bookmarks.push(currentWp.get());
			store.settings.save({key:"bookmarks", value: bookmarks}, function() {
				trackEvent('button', 'bookmark-add', currentWp.get());
			});			
		});
	}
});

$(document).delegate("#static-pages", "pagebeforeshow", function(e) {	
	var $page = $( "#static-pages" ),
		$header = $page.children( ":jqmData(role=header)" ),
		$content = $page.children( ":jqmData(role=content)" );

	if(typeof $content.find( ":jqmData(role=listview)" ) !== 'undefined') { 
		$content.find( ":jqmData(role=listview)" ).listview();
	}
});

// set settings switches to saved values
$(document).delegate("#terms-link", "tap", function(e) {
	e.preventDefault();

	var where, tnid;	
	currentTourSet.set($("#tour-home-link").attr("data-tourset-id"));
	
	store.settings.get("language", function(language){
		if(language) {
			if(language.value == "English") {
				where = 'record.value.title === "Terms \& Conditions"';
			}
			else {
				where = 'record.value.title === "Conditions"';
			}
		}
	});
	
	store.pages.where(where, function(data) {
		tnid = data[0].value.tnid;
	});
	
	$.mobile.changePage("#static-pages?nid=" + tnid, { transition: "none"} );
});

// set settings switches to saved values
$(document).delegate("#settings", "pagebeforeshow", function(e) {
	// update geolocation switch based on saved geo settings
	var geoSwitch = $("select#geo-switch");
	
	geo.get(function(state) {
		if(state == "on") {	
			geoSwitch[0].selectedIndex = 1;
		}
		else {
			geoSwitch[0].selectedIndex = 0;	
		}
	});
	
	geoSwitch.slider('refresh');

	store.settings.get("language", function(language){
		if(language && language.value == "English"){
			$("#lang-select-en").attr("checked", true).checkboxradio("refresh");
			$("#lang-select-fr").attr("checked", false).checkboxradio("refresh");
		} 
		else if(language && language.value == "French") {
			$("#lang-select-fr").attr("checked", true).checkboxradio("refresh");
			$("#lang-select-en").attr("checked", false).checkboxradio("refresh");
		}
	});
});

$(document).delegate("#next-waypoint", "tap", function(e) {
  	e.preventDefault();
  	
  	var $page = $("#waypoint"),
  		$header = $page.children(":jqmData(role=header)"),
  		$content = $page.children(":jqmData(role=content)");
  	  
	initWaypointDetail($("#next-waypoint").attr('data-wp-id'));
	showWayPointDetail();

	store.settings.get("bookmarks", function(bookmarks) {
		if(bookmarks) {
			if($.inArray(currentWp.get(), bookmarks.value) > -1) {
		    	$("#waypoint").find(":jqmData(role=favourites-button)").addClass("ui-btn-active");
		    }
		    else {
		    	$("#waypoint").find(":jqmData(role=favourites-button)").removeClass("ui-btn-active");
		    }  
		}
		$content.find(":jqmData(role=controlgroup)").controlgroup("refresh");
		$content.find(":jqmData(role=listview)").listview("refresh");
	});
	
	$.mobile.changePage("#waypoint", { transition: "none" } );
	$.mobile.silentScroll(0);
});

// Listen for any attempts to call changePage().
$(document).bind( "pagebeforechange", function( e, data ) {

	// We only want to handle changePage() calls where the caller is
	// asking us to load a page by URL.
  
	if ( typeof data.toPage === "string" ) {

		// We are being asked to load a page by URL, but we only
		// want to handle URLs that request the data for a specific
		// category.
		var u = $.mobile.path.parseUrl( data.toPage );

		if ( u.hash.search(/^#me/) !== -1 ) {

			// We're being asked to display the items for a specific category.
			// Call our internal method that builds the content for the category
			// on the fly based on our in-memory category data structure.
						
			showPages( u, data.options, data.options.fromPage.selector );

			// Make sure to tell changePage() we've handled this call so it doesn't
			// have to do anything.
			e.preventDefault();
		}
		else if ( u.hash.search(/^#tour-home$/) !== -1 ) {
  			showTours( u, data.options );
  			e.preventDefault();
		}
		else if ( u.hash.search(/^#tour$/) !== -1 ) {
			showWayPoints( u, data.options );
			e.preventDefault();
		}				
		else if ( u.hash.search(/^#static-pages/) !== -1 ) {
			showPageDetail( u, data.options, data.options.fromPage.selector );
			e.preventDefault();
		}
		else if ( u.hash.search(/^#topics/) !== -1 ) {
			showTopics( u, data.options );
			e.preventDefault();
		}
		else if ( u.hash.search(/^#topic-filter/) !== -1 ) {
			showTopicFilter( u, data.options );
			e.preventDefault();
		}
		else if ( u.hash.search(/^#topdetail/) !== -1 ) {
			showTopicsDetail( u, data.options );
			e.preventDefault();
		}
		else if ( u.hash.search(/^#audio/) !== -1 ) {
			showWpAudio( u, data.options );
			e.preventDefault();
		}
		else if ( u.hash.search(/^#video/) !== -1 ) {
			showWpVideo( u, data.options );
			e.preventDefault();
		}
		else if ( u.hash.search(/^#favourites/) !== -1 ) {
			showWayPointFavourites( u, data.options );
			e.preventDefault();
		}
		else if ( u.hash.search(/^#map/) !== -1 ) {
			showMap( u, data.options );
			e.preventDefault();
		}
		else if ( u.hash.search(/^#tour-sets$/) !== -1 ) {
			$('.tourset-landing-main-img').removeClass('active');
		}		
	}
  
});

// track page change
$(document).bind("pagechange", function(event, data){
	if(data.toPage.selector == "#tour-home"){
		if(data.options.fromPage.selector == "#tour"){
			//console.log("use cached page for #tour-home")
			$('.tour-set-img-leader').html($('.tour-set-img-leader')[0].outerHTML)
			unrenderTour();
		}
		else {
			renderTours(data);
		}
	}
	else if(data.toPage.selector == "#tour") {
		renderTour(data);
	}
	else if(data.toPage.selector == "#map") {
		renderMap(data.options.fromPage.selector);
	}
	else if (data.toPage.selector.match('waypoint')) {
		if (returnFromDialogue != 0) {
			showBody();
			$.mobile.silentScroll(returnFromDialogue);
			returnFromDialogue = 0;
		}
	}

	if(data.options.fromPage.selector == "#map") {
		unrenderMap();
	}
});

function renderMap(page) {
	if (checkConnection() == "UNKNOWN" || checkConnection() == "NONE") {
		blankMap();
	} 
	else {
		$("#map_canvas .throbber").css("display", "block");
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.id = "gmaps-api";
		script.async = true;
		script.src = "http://maps.google.com/maps/api/js?sensor=false&callback=mapApiReady";
		document.body.appendChild(script);
	}	
}

function mapApiReady() {
	loadMapScripts({url: "lib/js/infobox_packed.js", id: "infobox"}, function() {
		loadMapScripts({url: "app/maps.js", id: "maps-js"}, function() {
			initMap();
		});	
	});
}

function loadMapScripts(opts, cb) {
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src = opts.url;
	script.id = opts.id;
	script.onload = cb;
	document.body.appendChild(script);
}

function unrenderMap() {
	if(typeof $("#gmaps-api") !== 'undefined') {
		$("#gmaps-api").next().remove();
		$("#gmaps-api").remove();
	}
	
	if(typeof $("#infobox") !== 'undefined') { $("#infobox").remove(); }
	if(typeof $("#maps-js") !== 'undefined') { $("#maps-js").remove(); }
	
	$("#map_canvas").empty();

	for(var j = 0; j < 3; j++) {
		var s = document.head.getElementsByTagName('script');
	    // loop threw all scripts in head
	    for(var i = 0; i < s.length; i++) {
	        // get source
	        var src = s[i].src;
	        // if the result is not false
	        if((src.search(/gstatic/) != -1) || (src.search(/googleapis/) != -1)) {
	        	// remove the script
	        	$(s[i]).remove();
	        }
	    }
    }
}

var currentTourSet = {
  ts: false,
  get: function(){
    return this.ts;
  },
  set: function(tsId){
    this.ts = tsId;
  }
}

// track current tour
var currentTour = {
   	t: false,
	get: function() {
        return this.t;
    },
	set: function(tId) {
        this.t = tId;
    }
};

// track current wp
var currentWp = {
   	wp: false,
	get: function() {
        return this.wp;
    },
	set: function(wpId) {
        this.wp = wpId;
    }
};

function initGal(val) {
	fsGallery.set(val);
}

// set gallery to fullscreen
var fsGallery = {
   	gal: false,
	get: function() {
        return this.gal;
    },
	set: function(val) {
        this.gal = val;
    }
};

// set tour times
var currentWeight = {
   	weight: 1,
	get: function() {
        return this.weight;
    },
	set: function(w) {
        this.weight = w;
    }
};

// set tour times
var currentTopicsType = {
   	type: 'tourset',
	get: function() {
        return this.type;
    },
	set: function(t) {
        this.type = t;
    }
};

function trimWsCom(data) {
	return data.replace(/(^\s*,)|(,\s*$)/g, '');	
}

function fbLocChanged(cb, loc) {
	if(loc == remoteCmsURL + "/social/fb/index.html") {
		cb.close();
		navigator.notification.alert(unescapeHtml(Brule.resources.Share_success), null, '');
		trackEvent('share', 'facebook', tour + '/' + name);
	}
}

// text: the text to share
// image: the image to display near the link
// url: the url of the article
function shareOnFaceBook(description, picture, link, name, tour) {
	var lang = '';
	var postLang = '';
	
	//console.log("shareOnFaceBook reached");

	// live app creds
	//var client_id = "403754549668731", redir_url = remoteCmsURL + "/social/fb/index.html?success=1", lang = 'en';
	
	// dev app creds
	//var client_id = "433758126681052", redir_url = remoteCmsURL + "/social/fb/index.html?success=1", lang = 'en';
	
	//navigator.notification.activityStart(); //Phonegap function to show a waiting message
	if (typeof fbPlugin === 'undefined') {
		//console.log('Had to install FBConnect');
		if(typeof window.plugins.childBrowser === 'undefined') {
			if(devicePlatform == "iPhone" || devicePlatform == "iPhone Simulator") {
				//console.log('Had to install ChildBrowser for iPhone');
				var cb = ChildBrowser.install();
			}
			else {
				//console.log('Had to install ChildBrowser for Android or BB');
				var cb = window.plugins.childBrowser;
			}
		}
		var fbPlugin = FBConnect.install();
	}

	// code for like button method
	store.settings.get("language", function(language){
		if(language) {
			lang = language.value;
		}
	});
	
	if(lang == "English") { 
		postLang = "en_CA";
	}
	else {
		postLang = "fr_CA";
	}
	
	console.log(remoteCmsURL + '/sites/default/' + picture);
	
	var uid = Math.random().toString(36).substring(8);
	
    var postUrl = remoteCmsURL + "/social/fb/fbPost.php"
    			+ "?uid=" + uid
    		  	+ "&title=" + encodeURIComponent(name)
    		  	+ "&image=" + encodeURIComponent(remoteCmsURL + '/sites/default/' + picture) 
    		  	+ "&description=" + encodeURIComponent(description)
    		  	+ "&lang=" + postLang;
    
	window.plugins.childBrowser.showWebPage(postUrl, { showLocationBar: false });
	window.plugins.childBrowser.onLocationChange = function(loc){ fbLocChanged(this, loc); };
	
	/*
	old FB connect method
	fbPlugin.connect(client_id, redir_url, "touch");

	try {
		fbPlugin.onConnect = function() {
			//console.log('onFBConnected id=' + window.plugins.fbConnect.accessToken);
			window.plugins.fbConnect.getUserInfo(function(data) {
				//console.log('Inside callback after getUserInfo');
				var message = data.first_name + " visted " + name + " on CapitalTour";
				//remoteCmsURL + "/sites/default/" + 
				window.plugins.fbConnect.postFBWall(description, link, remoteCmsURL + '/sites/default/' + picture, name, message, function() {
					//console.log('Inside callback after postFBWall' + remoteCmsURL + "/sites/default/" + picture);
					navigator.notification.alert(unescapeHtml(Brule.resources.Share_success), null, '');
					trackEvent('share', 'facebook', tour + '/' + name);
				});
			});
		};
	}
	catch(e) {
		//console.log("Error: fbPlugin.onConnect shareOnFaceBook in app.js. " + e.message);
	}
	*/
}

//fb it
$(document).delegate("#wp-share-fb", "click", function(e) {
	e.preventDefault();
	var picture, share, name, description, tour, link = Brule.resources.Share_URL_dest;
	
	//message, picture, link, name, caption, description, source, place, tags
	store.waypoints.get(currentWp.get(), function(item) {
		name = item.value.Title;
		picture = item.value.Main_image[0];
		description = item.value.Share;
	});

	store.tours.get(currentTour.get(), function(item) {
		tour = item.value.title;
	});
	
	shareOnFaceBook(description, picture, link, name, tour);
});

//tweet it up
$(document).delegate("#wp-share-tw", "click", function(e) {
	//console.log("wp-share-tw clicked");
	e.preventDefault();
	
	var img, share, title, twUrl, tweet, stringLen, lang,
		hashTags = '#capitaltour #tourcapitale',
		url = Brule.resources.Share_URL_dest;
	
	store.waypoints.get(currentWp.get(), function(item) {
		title = item.value.Title; 
		img = item.value.Main_image[0];
		share = item.value.Share;
	});
	
	fetchLanguage(function(language){
		lang = language;
	});
	
	tweet = hashTags + ' ' + url;
	stringLen = 140 - tweet.length;
	share = share.substring(0, stringLen - 4);
	tweet = share + "... " + tweet;
	twUrl = remoteCmsURL+"/social/twitter/index.html?content=" + encodeURIComponent(tweet) + "&lang=" + lang;

	if(typeof window.plugins.childBrowser === 'undefined') {
		if(devicePlatform == "iPhone" || devicePlatform == "iPhone Simulator") {
			//console.log('Had to install ChildBrowser for iPhone');
			var cb = ChildBrowser.install();
		}
		else {
			//console.log('Had to install ChildBrowser for Android or BB');
			cb = window.plugins.childBrowser;
		}
	}

	window.plugins.childBrowser.showWebPage(twUrl, { showLocationBar: false });

	window.plugins.childBrowser.onLocationChange = function(loc) {
	    if (loc.match('/intent/tweet/complete')) {
			if (!shareAction) {
				navigator.notification.alert(unescapeHtml(Brule.resources.Share_success), null, '');
				shareAction = true;
				trackEvent('share', 'twitter', title);
			}
			window.plugins.childBrowser.close();
			return false;
		}
	};
	
	window.plugins.childBrowser.onClose = function() {
		return false;
	}
});

function checkVersion() {
	var remoteVersion, localVersion;
	
	store.settings.get('version', function(obj){
	    localVersion = obj.value;
    });

	$.ajax({url: remoteCmsURL+'/capitaltour/version', dataType: 'jsonp', jsonpCallback: 'ncc', success: function(json) {
	    $.each(json.nodes, function(i, node) {
	       if (node.version) remoteVersion = node.version;
	    });
	    
		//console.log('Remote: '+ remoteVersion + ' Local: '+ localVersion +'\nVersion sync is ' + (remoteVersion > localVersion ));
		
		if (remoteVersion > localVersion) {
			userPromptAppUpdate();
		}
	} });
	
}

function userPromptAppUpdate() {
	navigator.notification.alert(Brule.resources.Updatemsg, null, '');
}

// DOM helper
function createElementHelper(tag, attributes, html) {
  var tmpTag = document.createElement(tag); 
  for(var at in attributes ) {
    tmpTag[at] = attributes[at];
  }
  
  if (html) {
    tmpTag.innerHTML = html;
  }
  
 return tmpTag;
}

// ------------------------------------
// Init Application
// ------------------------------------

function showTourSets() {
  setTimeout(function(){    
    fetchLanguage(function(lang){
      if(lang){
        renderTourSets()
      }else{
        $("#language-choice").show();
        firstRun();
      }
    })
  }, 0)
}

// ------------------------------------
// Home Page - Render list of TourSets
// ------------------------------------

function unrenderTourSets(){
  $("#tourset-list").html("")
  $("#tour-sets .throbber").show()
}

function renderTourSets() {
  
	$('#terms').show();
	var html = ""
	store.toursets.each(function(record) {
    var el = '<div class="tourset-landing-main-img">'
          + '<a href="#tour-home" id="tour-home-link" data-tourset-id="' + record.value.tnid +'">'
          + '<div class="set-img">'
          + '<img src="' + record.value.setimg + '" large="' + record.value.image + '" />'
          + '<img src="' + record.value.image + '"  width="1px" height="1px" style="display:none;" />'
          + '</div>'
          + '<span class="ui-icon ui-icon-arrow-r ui-icon-shadow"></span>'
          + '<h2 class="tourset-landing-title">' + record.value.title + '</h2>'
          + '<p class="tourset-landing-precis">' + record.value.precis + '</p>'
          + '</a></div>'
    html += el
  })
  $("#tour-sets .throbber").hide()
  $("#tourset-list").html(html)
  if (isConnected()) checkVersion()
  //if (isConnected()) initAnalytics();
}

// ------------------------------------
// Tour Home - Show list of Tours
// ------------------------------------

function unrenderTours(){
  $(".tour-set-main-img").html('')
  $(".tour-set-title").html("")
  $(".tour-set-main-img-precis").hide().html("")
  
  $("#tour-list").html("")
  $("#tour-home .throbber").show()
}

function renderTours(){
  //console.log("RENDER: renderTours")
  var $page = $("#tour-home")
  var $header = $page.children(":jqmData(role=header)")
  
  
  gtnid = null;
  var markup = "";
  store.tours.where('record.tstnid === "' + currentTourSet.get() + '"', function(tours) { 
    tours.forEach(function(tour) {
      gtnid = tour.value.tnid;
      markup += '<li><a href="#tour" data-waypoint-id="' + tour.value.tnid +'"><h3>' + tour.value.title + '</h3></a></li>';
    });   
  });

  store.toursets.get(currentTourSet.get(), function(tourSet) {
  	img = tourSet.value.image;
  	title = tourSet.value.title;
  	precis = tourSet.value.precis;  	
  });
  
  markup += '<li data-role="list-divider" class="ui-bar-c"></li><li data-theme="b"><a href="#topics?type=tourset"><h3>'+ Brule.resources.Topics +'</h3></a></li></ul>';
  
  // inset content
  $(".tour-set-main-img").html('<img src="' + img + '"></img>')
  $(".tour-set-title").html(title)
  $(".tour-set-main-img-precis").html(precis).show()

  //CHECK GEO HERE
  
  // trackPage('tourset/'+ title);
  
  $page.page()
  $page.trigger("create")
  
  // inset content
  $("#tour-home .throbber").hide()
  $("#tour-list").html(markup).listview("refresh")  
}


function initTours(tourSetId) {
	// set tour set id global
	currentTourSet.set(tourSetId);
}

function initWaypoints(tourId) {
	// set tour set id global
	currentTour.set(tourId);
}

function initWaypointDetail(wpId, tnid) {
	//console.log("initWaypointDetail tnid: " + tnid);
	// set tour set id global
	currentWp.set(wpId);
	
	if(typeof tnid !== 'undefined') {
		//currentTour.set("false");
		currentTour.set(tnid);
	}
}

function initTopics(type) {
	// set tour set id global
	//currentTopicsType.set(type);
	//showTopics();
}

// display topics
function showTopics( urlObj, options ) {
	var topicType = urlObj.hash.replace( /.*type=/, "" ),
		tourTopics,
		backLink;
	
	console.log("TOPIC: " + topicType);
	
	
	switch(topicType)
	{
		case 'tourset':
			store.toursets.get(currentTourSet.get(), function(item) {
				tourTopics = trimWsCom(item.value.tids).split(",");
			});
			backLink = '#tour-home';
			break;
		case 'tour':
			store.tours.get(currentTour.get(), function(item) {
				tourTopics = trimWsCom(item.value.tids).split(",");
			});
			backLink = '#tour';
			break;
		case 'waypoint':
			store.waypoints.get(currentWp.get(), function(item) {
				tourTopics = trimWsCom(item.value.Tid).split(",");
			});
			backLink = '#waypoint';
			break;
		default:
			store.toursets.get(currentTourSet.get(), function(item) {
				tourTopics = trimWsCom(item.value.tids).split(",");
			});
			backLink = '#tour-home';
			break;
	}
	
	store.topics.get("collection", function(obj) {
		var topicsData = obj.value,
	  		pageSelector = urlObj.hash.replace( /\?.*$/, "" ),
	  		$page = $( pageSelector ),
	  		$header = $page.children( ":jqmData(role=header)" ),
	  		$content = $page.children( ":jqmData(role=content)" ),
	  		markup = '<ul data-role="listview" data-inset="false">',
	  		tItems = topicsData,
	  		numItems = tItems.length;
  	
	  	for(var i = 0; i < numItems; i++) {
	  		var wpCount = 0;
	  		
	  		store.waypoints.all(function(data) {
	  			$.each(data, function(j, wp) {
					var tt = trimWsCom(wp.value.Tid).split(",");
					var tourSet = wp.tstnid;
					var curTS = currentTourSet.get();
					if($.inArray(tItems[i].Tid, tt) > -1 && tourSet == curTS) {
						wpCount++;			
					}
	  			});
	  		});
	
	  		if(tItems[i].Checked == "1") {
	  			// create list html
	  			markup += '<li><a href="#topdetail?id=' + tItems[i].Tid + '-' + i + '"><h3>' + tItems[i].Term + '</h3><span class="ui-li-count">' + wpCount + '</span></a></li>';	
	  		}
	  		
	  		if($.inArray(tItems[i].Tid, tourTopics) > -1 && tItems[i].Checked == "2") {
	  			// create list html
	  			markup += '<li><a href="#topdetail?id=' + tItems[i].Tid + '-' + i + '"><h3>' + tItems[i].Term + '</h3><span class="ui-li-count">' + wpCount + '</span></a></li>';	
	  		}	
	  	}
	
	  	markup += "</ul>";
	  	
	  	var filterButton = "#topic-filter?type=" +  topicType;
	  	$header.find(":jqmData(role=topics-back-link)").attr("href", backLink);
	  	$header.find(":jqmData(role=topics-filter-button)").attr("href", filterButton);
	  	
	  	if ($(':jqmData(role=topics-filter-button) .ui-btn-text').length) {
	  		$(':jqmData(role=topics-filter-button) .ui-btn-text').text(Brule.resources.Filter);
	  	}
	  	else {
	  		$(':jqmData(role=topics-filter-button)').text(Brule.resources.Filter);
	  	}
	  	
	  	$content.html(markup);
	  	
	  	$page.page();
	  	
	  	$content.find(":jqmData(role=listview)").listview().listview("refresh");
	  	//$page.trigger("create");
	  	options.dataUrl = urlObj.href;
	  	//applyLang();
	  	
	  	trackPage('topics/');
	  	
	  	$.mobile.changePage($page, options);
	});
}

// display the list of topics
function showTopicFilter( urlObj, options ) {
	var topicType = urlObj.hash.replace( /.*type=/, "" ),
		tourTopics;
	
	switch(topicType)
	{
		case 'tourset':
			store.toursets.get(currentTourSet.get(), function(item) {
				tourTopics = trimWsCom(item.value.tids).split(",");
			});
			break;
		case 'tour':
			store.tours.get(currentTour.get(), function(item) {
				tourTopics = trimWsCom(item.value.tids).split(",");
			});
			break;
		case 'waypoint':
			store.waypoints.get(currentWp.get(), function(item) {
				tourTopics = trimWsCom(item.value.Tid).split(",");
			});
			break;
		default:
			store.toursets.get(currentTourSet.get(), function(item) {
				tourTopics = trimWsCom(item.value.tids).split(",");
			});
			break;
	}

	var markup = '<div class="topic-filter-options" data-role="navbar">';
	markup += '<ul>';
	markup += '<li><a href="#" onclick="checkAll()">'+ Brule.resources.Topic_all +'</a></li>';
	markup += '<li><a href="#" onclick="checkNone()">'+ Brule.resources.Topic_none +'</a></li>';
	markup += '</ul>';
	markup += '</div>';
	markup += '<div id="topic-filter-items-data" data-role="fieldcontain" class="topic-filter-items">';
	markup += '<fieldset data-role="controlgroup">';

	store.topics.get("collection", function(obj){
		var	topicsData = obj.value
		var pageSelector = urlObj.hash.replace( /\?.*$/, "" ),
		$page = $( pageSelector ),
		$header = $page.children( ":jqmData(role=header)" ),
		$content = $page.children( ":jqmData(role=content)" ),
		tItems = topicsData,
		numItems = tItems.length;
		
		for(var i = 0; i < numItems; i++) {
			if(($.inArray(tItems[i].Tid, tourTopics) > -1 && tItems[i].Checked == "2") || (tItems[i].Checked == "1")) {
				markup += '<input type="checkbox" onclick="javascript:topicFilterClick(this); return false;" name="checkbox-' + i + '" id="checkbox-' + i + '" class="custom" checked="checked" />'
			+ '<label for="checkbox-' + i + '">' + tItems[i].Term + '</label>';
			}
			else if(tItems[i].Checked == "0") {
				markup += '<input type="checkbox" onclick="javascript:topicFilterClick(this); return false;" name="checkbox-' + i + '" id="checkbox-' + i + '" class="custom" />'
			+ '<label for="checkbox-' + i + '">' + tItems[i].Term + '</label>';
			}
			else {
				markup += '<input type="checkbox" onclick="javascript:topicFilterClick(this); return false;" name="checkbox-' + i + '" id="checkbox-' + i + '" class="custom" />'
			+ '<label for="checkbox-' + i + '">' + tItems[i].Term + '</label>';			
			}
		}
		
		markup += '</fieldset>';
		markup += '</div>';
		
		var filterButton = "#topics?type=" +  topicType;
		$header.find( ":jqmData(role=topics-filter-button)" ).attr( "href", filterButton );
		
		if ($(':jqmData(role=topics-filter-button) .ui-btn-text').length) {
			$(':jqmData(role=topics-filter-button) .ui-btn-text').text(Brule.resources.Filter);
		} 
		else {
			$(':jqmData(role=topics-filter-button)').text(Brule.resources.Filter);
		}
		
		$content.html(markup);
		$page.page();
		$content.find(":jqmData(role=fieldcontain)").fieldcontain();
		$content.find(":jqmData(role=controlgroup)").controlgroup();
		$page.trigger("create");
		trackPage('topics/filter');		
		options.dataUrl = urlObj.href;
		$.mobile.changePage( $page, options );
	});	
}

function showTopicsDetail( urlObj, options ) {
	store.topics.get("collection", function(obj){
		var	topicsData = obj.value,
			topicId = urlObj.hash.replace( /.*id=/, "" ),
			pageSelector = urlObj.hash.replace( /\?.*$/, "" ),
			$page = $( pageSelector ),
			$header = $page.children( ":jqmData(role=header)" ),
			$content = $page.children( ":jqmData(role=content)" ),
			$footer = $page.children( ":jqmData(role=footer)" ),
			id = topicId.split('-'),
			tid,tIndex,title;
		
		if(typeof id[0] !== 'undefined') {
			tid = id[0];
			tIndex = id[1];
			
			var markup = '<h3 class="topic-detail-title">' + topicsData[tIndex].Term + '</h3><ul data-role="listview" data-inset="false">';

	  		store.waypoints.all(function(data) {
	  			$.each(data, function(j, record) {
					var tourTopics = trimWsCom(record.value.Tid).split(",");
					var tourSet = record.tstnid;
					var curTS = currentTourSet.get();
					if($.inArray(tid, tourTopics) > -1 && tourSet == curTS) {
						var thumb = record.value.Main_image_thumb ? record.value.Main_image_thumb[0] : '';
						markup += '<li><a href="#waypoint" onclick="javascript:initWaypointDetail(' + '\'' + record.key + '\'' + '); return false;"><img src="' + thumb + '" alt="" /><h3>' + record.value.Title + '</h3><p>' + record.value.Topics + '</p></a></li>';
						title = record.value.Title;
					}
	  			});
	  		});
		}
		
		markup += '</ul>';
		$content.html( markup );
		$footer.find( ":jqmData(role=topdet-me-link)" ).attr( "href", "#me?page=topdetail?id=" + topicId);
		$footer.find( ":jqmData(role=topdet-map-link)" ).attr( "href", "#map?page=topdetail?id=" + topicId);
		$page.page();
		$content.find( ":jqmData(role=listview)" ).listview();	
		options.dataUrl = urlObj.href;
		trackPage('topics/'+topicsData[tIndex].Term);    	
		$.mobile.changePage( $page, options );
	});	
}

// add and remove topics
function topicFilterClick(el) {
	store.topics.get("collection", function(obj){
		var	topicsData = obj.value
		var checkbox = $(el).attr('id');
		var id = checkbox.split("-");
		topicsData[id[1]].Checked = ($(el).attr('checked') === 'checked') ? "1" : "0";
		store.topics.save({key:"collection", value: topicsData });
	});
}

function checkAll() {
	var cbs = $("input[type='checkbox']");
	cbs.attr("checked",true).checkboxradio("refresh");
	$.each(cbs, function(i, item) {
		topicFilterClick(item)
	});	
}

function checkNone() {
	var cbs = $("input[type='checkbox']");
	cbs.attr("checked",false).checkboxradio("refresh");
	$.each(cbs, function(i, item) {
		topicFilterClick(item)
	});	
}

function showPerspective(tourId) {
	var showPer = false;
	store.tours.get(tourId, function(data) {
		//console.log(data.value.persp);
		if(data.value.persp == "yes") {
			//console.log(tourId + " " + data.value.persp);
			showPer = true;
		}
	});
	//console.log(tourId);
	return showPer;
}

// display perspectives
function showPerspectives(wpid) {
	//console.log("showPerspectives: " + wpid);
	
	var perspectives, wpTnid;
	
	$('#perspectives-list').html('');
	
	store.waypoints.get(wpid, function(item) {
		perspectives = trimWsCom(item.value.Perspectives_nid).split(",");
		realWpNid = item.value.Nid;
	});
	
	if(perspectives.length > 0) {
		for(var i = 0; i < perspectives.length; i++) {
			store.waypoints.where('record.value.Nid === "' + perspectives[i] + '"', function(wp) {
				if(wp[0] && typeof wp[0] !== 'undefined') {
					//console.log("perspectives[i]" + perspectives[i]);
					if(perspectives[i] != realWpNid && showPerspective(wp[0].ttnid)) {
						var html = '<li><a href="#waypoint" onclick="javascript:initWaypointDetail(' + '\'' + wp[0].key + '\',' + '\'' + wp[0].ttnid + '\'' + '); return false;"><img src="' + wp[0].value.Main_image_thumb[0] + '" alt="" /><h3>' + wp[0].value.Title + '</h3><p>' + wp[0].value.Topics + '</p></a></li>';
						$('#perspectives-list').append(html);
					}
				}
			});
		}
	}
	
	trackPage('perspectives/' + wpid);
}

function unrenderTour() {
  $("#tour .tour-title").html("Locating waypoints...")
  $("#tour .tour-body").html("Using your geo data to find locations nearest to you.")
  $("#tour .tour-main-img a").html('')
  $("#wp-list").html("");
  $("#tour .throbber").show()
}

// Render the content for the Tour Show
function renderTour(data) {	
	if (currentTour.get() === "false") {
	  // We got here by myCurrentTour from settings, without having been on any tours
	  $.mobile.changePage("#tour-home");
	  return false;
	}
	
	var $page = $("#tour")
	var $content = $page.children(":jqmData(role=content)");
	
	
	var gTour = null;
	store.tours.get(currentTour.get(), function(tour) {
		gTour = tour;
		$("#tour .tour-title").html(tour.value.title)
		$("#tour .tour-body").html(tour.value.body)
		var imgurl = isConnected() ? createStaticMap(): tour.value.image;
		$("#tour .tour-main-img a").html('<img src="' + imgurl + '"  />');
		$('#notifications').hide();
	});
  
	var markup = ''
	store.waypoints.where('record.ttnid === "' + currentTour.get() + '"', function(data) {
		//start returning WPs at index of closest WP
		var start = getClosestWP(data);
		var ix;
	
		geo.get(function(state) {
			if(state == "on") {
				ix = start;
			}
			else {
				ix = 0;
			}
		});
	
		for (var i = 0; i < data.length; i++) {
			markup += insertWP(data[ix]);
			if ((ix+1) < data.length) {
				ix++;
			}
			else {
				ix = 0;
			}
		};
	});
   
	markup += '<li data-role="list-divider" class="ui-bar-c"></li><li data-theme="b"><a href="#topics?type=tourset"><h3>'+ Brule.resources.Topics +'</h3></a></li></ul>';
	
	$("#tour .throbber").hide()
	
	applyLang();
	trackPage('tour/'+ gTour.key  + '/' + gTour.value.title);
	
	//$page.page();
	//$page.trigger("refresh");
	
	$("#wp-list").html(markup).listview("refresh");
	$content.find(":jqmData(role=listview)").listview().listview("refresh");
}

function showTours(urlObj, options) {
	var $page = $(urlObj.hash.replace( /\?.*$/, "" ));
	options.dataUrl = urlObj.href;
	if (!isPlatform('BlackBerry')) getcurrentLatLng();	
	$.mobile.changePage( $page, options );  
	$page = null;
}

function flagDistance(coords, dist) {
  	var flag = geoWPDistance(coords, dist);
  	var flagClass = '';
  	var count = 0;
  	
  	if(flag) {
	  	flagClass = 'class="warning"';
	  	$('#notifications').show();
	  	count++;
  	}
  	
  	
  	return flagClass;
}

function insertWP(item) {	
	var title = (typeof item.value.Title === 'undefined') ? 'N/A' : item.value.Title;
	var topics = (typeof item.value.Topics === 'undefined') ? 'N/A' : item.value.Topics;
	var weight = (typeof item.value.Weight === 'undefined') ? '0' : item.value.Weight;
	var mainImage = (typeof item.value.Main_image_thumb === 'undefined') ? '<img src="" />' : '<img src="' + item.value.Main_image_thumb[0] + '" />';
	
  
	if(currentWeight.get() == '1' && weight == '1') {
		return '<li ' + flagDistance(item.value.Coordinates, .8) + '><a href="#waypoint" data-waypoint-detail-id="' + item.value.Tnid + '">' + mainImage +' <h3>' + title + '</h3><p>' + topics + '</p></a></li>';
	}
	else if(currentWeight.get() == '2' && (weight == '1' || weight == '2')) {
		return '<li ' + flagDistance(item.value.Coordinates, 1.1) + '><a href="#waypoint" data-waypoint-detail-id="' + item.value.Tnid + '">' + mainImage +' <h3>' + title + '</h3><p>' + topics + '</p></a></li>';
	}
	else if(currentWeight.get() == '3' && (weight == '1' || weight == '2' || weight == '3')) {
		return '<li ' + flagDistance(item.value.Coordinates, 2.5) + '><a href="#waypoint" data-waypoint-detail-id="' + item.value.Tnid + '">' + mainImage +' <h3>' + title + '</h3><p>' + topics + '</p></a></li>';
	}						
	else if(currentWeight.get() == '4') {
		$('#notifications').hide();
		return '<li><a href="#waypoint" data-waypoint-detail-id="' + item.value.Tnid + '">' + mainImage +' <h3>' + title + '</h3><p>' + topics + '</p></a></li>';
	}
	
	return '';
}

// Moved most of the rendering to renderTour() now deferred in the call stack
function showWayPoints( urlObj, options ) {
	var pageSelector = urlObj.hash.replace( /\?.*$/, "" );
	var $page = $( pageSelector );
	options.dataUrl = urlObj.href;
	if (!isPlatform('BlackBerry')) getcurrentLatLng();
	$page.page();
	$.mobile.changePage( $page, options );
}

function getNextWP(len, start, data) {
	var nextWp = '';
	for(var j = start; j < len; j++) {
		var weight = data[j].value.Weight;
		if(currentTour.get() == data[j].ttnid && currentWeight.get() == '1' && weight == '1') {
			nextWp = data[j].key;
			return nextWp;
		}
		else if(currentTour.get() == data[j].ttnid && currentWeight.get() == '2' && (weight == '1' || weight == '2')) {
			nextWp = data[j].key;
			return nextWp;
		}
		else if(currentTour.get() == data[j].ttnid && currentWeight.get() == '3' && (weight == '1' || weight == '2' || weight == '3')) {
			nextWp = data[j].key;
			return nextWp;
		}
		else if(currentTour.get() == data[j].ttnid && currentWeight.get() == '4') {
			nextWp = data[j].key;
			return nextWp;
		}
	}
	return '';
}

// display waypoint detail
function showWayPointDetail() {
	var item, nextWp = '';	
	$('#wp-related').html('');
	
	var items = false;
	store.waypoints.all(function(data) {
		items = data;	
	});

	for(var i = 0; i < items.length; i++) {
		if(items[i].key == currentWp.get() && currentTour.get() == items[i].ttnid) {				
			var len = items.length, start = i + 1, item = items[i];
			nextWp = getNextWP(len, start, items);
		}	
	}
	
	if(typeof item === 'undefined') { store.waypoints.get(currentWp.get(), function(data) { item = data }); }
	
	$('h3.waypoint-title').html(item.value.Title);
	
	var mainImageWp = (typeof item.value.Main_image === 'undefined') ? '' : item.value.Main_image[0];
	var mainImage = (typeof item.value.Main_image_thumb === 'undefined') ? '' : item.value.Main_image_thumb[0];
	var title = (typeof item.value.Title === 'undefined') ? 'N/A' : item.value.Title;
	var body = (item.value.Notice) ? ('<div class="notice">'+item.value.Notice+'</div>' + item.value.Body) : item.value.Body;
	$('div.waypoint-body').removeClass('show keep').find('.inner').html(body);

	if(nextWp == '') {
		start = 0;
		len = items.length;		
		nextWp = getNextWP(len, start, items);
	}
	
	//console.log("next waypoint: " + nextWp);
	
	$("#next-waypoint").attr('data-wp-id', nextWp);
	parseDefinitions();
	
	$('div.waypoint-main-img').html('<a href="#photo-gallery" onclick="javascript:initGal(' + '\'yes\'' + '); return false;"><img src="' + mainImageWp + '" /></a>');

	// create gallery
	if(typeof item.value.Imgs_full === 'undefined') {
		$('.gallery').html('<li><a href="' + mainImage + '" rel="external"><img src="' + mainImage + '" alt="' + title + '" /></a></li>');		
	}
	else {
		var gallery = (typeof item.value.Imgs_full !== 'undefined') ? item.value.Imgs_full : false;
		var galleryThumbs = (typeof item.value.Imgs_thumb !== 'undefined') ? item.value.Imgs_thumb : false;
		var galleryCaptions = (typeof item.value.Imgs_caption !== 'undefined') ? item.value.Imgs_caption : false;
		
		if(mainImage != '' && !gallery) {
			gallery = [];
			gallery.push(mainImage);
			galleryThumbs = [];
			galleryThumbs.push(mainImage);
		}
		else if(mainImage != '' && gallery.length > 0) {
			if(mainImage != gallery[0]) {
				gallery.unshift(mainImage);
				galleryThumbs.unshift(mainImage);
			}			
		}
		
		if(!galleryCaptions) {
			galleryCaptions = [];
		}
		
		createWpGalleries(gallery, galleryThumbs, galleryCaptions);
	}

	if(typeof item.value.Video === 'undefined') {
		$('#wpvideo').removeClass('ui-enabled');
		$('#wpvideo').addClass('ui-disabled');								
	}
	else {			
		$('#wpvideo').removeClass('ui-disabled');
		$('#wpvideo').addClass('ui-enabled');
	}

	if(typeof item.value.Audio === 'undefined') {			
		$('#wpaudio').removeClass('ui-enabled');
		$('#wpaudio').addClass('ui-disabled');							
	}
	else {						
		$('#wpaudio').removeClass('ui-disabled');
		$('#wpaudio').addClass('ui-enabled');		
	}

	if(typeof item.value.More_info_label !== 'undefined') {
		$('#wp-related').append('<li data-theme="c"><a href="#fun-facts" onclick="javascript:showMoreInfo(' + '\'' + title + '\'' + '); return false;"><h3>' + item.value.More_info_label[0] + '</h3></a></li>');
	}
	
	var j = 0;
	if(typeof item.value.Perspectives_nid !== 'undefined') {
		var perspectives = trimWsCom(item.value.Perspectives_nid).split(",");	
		if(perspectives.length > 0 && $.trim(perspectives) != '') {
			for(var i = 0; i < perspectives.length; i++) {				
				if(perspectives[i] != item.value.Nid) {
			  		store.waypoints.all(function(data) {
			  			$.each(data, function(k, wp) {
							if(wp.value.Nid == perspectives[i] && showPerspective(wp.ttnid)) {
								j++;
							}
			  			});
			  		});
				}
			}
		}
	}
	
	if(j > 0) {
		var perspec = '<li data-theme="c"><a href="#perspectives" onclick="javascript:showPerspectives(' + '\'' + currentWp.get() + '\'' + '); false;"><h3>'+ Brule.resources.Perspectives +'</h3></a></li>';
		$('#wp-related').append(perspec);
	}
	
	if(typeof item.value.Tid !== 'undefined') {
		var tids = trimWsCom(item.value.Tid).split(",");
		if(tids.length > 0 && $.trim(tids) != '') {
			var topics = '<li data-role="list-divider" class="ui-bar-c"></li><li data-theme="b"><a href="#topics?type=waypoint"><h3>'+ Brule.resources.Topics +'</h3></a></li>';
			$('#wp-related').append(topics);
		}
	}

	applyLang();
	$('#wp-related').listview('refresh');
			
	shareAction = false;

	//if the visitor is 250m or less from WP, tag via analytics
	geo.get(function(state) {
		if(state == "on") {
			var geo = geoFence(item.value.Coordinates, .25) ? '#geo' : '';
			trackPage('waypoint/'+item.value.Nid+'/'+item.value.Title+geo);
		}
	});	
	//});
}

// display waypoint favourites
function showWayPointFavourites( urlObj, options ) {
	var pageSelector = urlObj.hash.replace( /\?.*$/, "" ),
		$page = $( pageSelector ),
		$header = $page.children( ":jqmData(role=header)" ),
		$content = $page.children( ":jqmData(role=content)" ),
		markup = '';

	store.settings.get("bookmarks", function(obj) {
		if(obj && obj.value) {
			//console.log(obj.value);
			markup = '<ul data-role="listview" data-inset="false" class="bookmarks">';
			obj.value.forEach(function(item) {
				store.waypoints.get(item, function(wp) {
					markup += '<li><a href="#waypoint" onclick="javascript:initWaypointDetail(' + '\'' + wp.key + '\'' + '); return false;"><img src="' + wp.value.Main_image_thumb[0] + '" alt="" /><h3>' + wp.value.Title + '</h3><p>' + wp.value.Topics + '</p></a></li>';
				});
			});
			markup += "</ul>";
		}
	});
	
	$content.html('<h3 class="bookmarks-title">'+ Brule.resources.My_bookmarks +'</h3>' + markup);
	$page.page();
	if(markup != '') { $content.find(":jqmData(role=listview)").listview(); }
	options.dataUrl = urlObj.href;
	
	trackPage('bookmarks');
	
	$.mobile.changePage( $page, options );
}

// Load the data for a specific category, based on
// the URL passed in. Generate markup for the items in the
// category, inject it into an embedded page, and then make
// that page the current active page.
function showPages( urlObj, options, fromPage ) {
	//var categoryName = urlObj.hash.replace( /.*category=/, "" ),
	
	// Get the object that represents the category we
	// are interested in. Note, that at this point we could
	// instead fire off an ajax request to fetch the data, but
	// for the purposes of this sample, it's already in memory.
	// var  category = (language.get() === 'English') ? pages.english : pages.french;
	
	// The pages we use to display our content are already in
	// the DOM. The id of the page we are going to write our
	// content into is specified in the hash before the '?'.
	var pageSelector = urlObj.hash.replace( /\?.*$/, "" ),
		prevPage = urlObj.hash.replace( /.*page=/, "" ),
		$page = $( pageSelector ),

		// Get the header for the page.
		$header = $page.children( ":jqmData(role=header)" ),

		// Get the content area element for the page.
		$content = $page.children( ":jqmData(role=content)" ),

		// The markup we are going to inject into the content
		// area of the page.
		markup = '<ul data-role="listview" data-inset="false"><li class="current-tour"><a href="#tour" onclick="javascript:initWaypoints(' + '\'' + currentTour.get() + '\'' + '); return false;"><h3>'+ Brule.resources.Current_tour +'</h3></a></li><li class="favourites"><a href="#favourites"><h3>'+ Brule.resources.My_bookmarks +'</h3></a></li><li data-role="list-divider" class="ui-bar-c"></li><li><a href="#settings"><h3>'+ Brule.resources.Settings +'</h3></a></li>';
			
	store.pages.all(function(category){
		$.each(category, function(i, item) {
			markup += '<li><a href="#static-pages?nid=' + item.value.tnid + '"><h3>' + item.value.title + '</h3></a></li>';
		});
	});
      
	markup += "</ul>";
	
	// Find the h1 element in our header and inject the name of
	// the category into it.
	//$header.find( "h1" ).html( category.name );
	
	//console.log("showPages: " + fromPage + " prevPage: " + prevPage);
		
	prevPage = prevPage.replace("#","");
	
	if(prevPage == "static-pages") {
		prevPage = "tour-sets";
	}
	else if(prevPage == "me") {
		prevPage = "tour-sets";
	}
	
	$header.find( ":jqmData(role=pages-back-link)" ).attr( "href", "#" + prevPage );
	
	// Inject the category items markup into the content element.
	$content.html( markup );
	
	// Pages are lazily enhanced. We call page() on the page
	// element to make sure it is always enhanced before we
	// attempt to enhance the listview markup we just injected.
	// Subsequent calls to page() are ignored since a page/widget
	// can only be enhanced once.
	$page.page();
	
	// Enhance the listview we just injected.
	$content.find( ":jqmData(role=listview)" ).listview();
	
	// We don't want the data-url of the page we just modified
	// to be the url that shows up in the browser's location field,
	// so set the dataUrl option to the URL for the category
	// we just loaded.
	options.dataUrl = urlObj.href;
	
	trackPage('me');
	
	// Now call changePage() and tell it to switch to
	// the page we just modified.
	$.mobile.changePage( $page, options );	
}

function showMap( urlObj, options ) {	
	var pageSelector = urlObj.hash.replace( /\?.*$/, "" ),
		prevPage = urlObj.hash.replace( /.*page=/, "" ),
		$page = $( pageSelector ),
		$header = $page.children( ":jqmData(role=header)" ),
		$content = $page.children( ":jqmData(role=content)" ),
		$footer = $page.children( ":jqmData(role=footer)" );
	
	$footer.find( ":jqmData(role=map-button)" ).addClass('ui-disabled');
	$header.find( ":jqmData(role=map-back-link)" ).attr( "href", "#" + prevPage );
	$page.page();
	options.dataUrl = urlObj.href;

	getcurrentLatLng();	
	trackPage('map');
	$.mobile.changePage( $page, options );
}

function showPageDetail( urlObj, options, fromPage ) {
	var pageId = urlObj.hash.replace( /.*nid=/, "" ),
		pageSelector = urlObj.hash.replace( /\?.*$/, "" ),
		$page = $( pageSelector ),
		$header = $page.children( ":jqmData(role=header)" ),
		$content = $page.children( ":jqmData(role=content)" ),
		markup = '';
		pageTitle = '';
	
	store.pages.get(pageId,function(pageObj){
		var markup = pageObj.value;
		pageTitle = markup.title;
		$content.html('<h3 class="title">' + markup.title + '</h3>' + markup.body);
	});
	
	//console.log("showPageDetail fromPage " + fromPage);
	
	if(fromPage == "#me") {
		$header.find(":jqmData(role=static-pages-back-link)").attr("href", "#me");	
	}
	else {
		$header.find(":jqmData(role=static-pages-back-link)").attr("href", "#tour-sets");
	}
		
	$page.page();
	
	// set the dataUrl option to the URL for the category
	// we just loaded.
	options.dataUrl = urlObj.href;

	trackPage(pageId+'/'+pageTitle);

	// Now call changePage() and tell it to switch to
	// the page we just modified.
	$.mobile.changePage( $page, options );
}

var createStaticMap = function() {
	var iconpathWp = remoteCmsURL + "/sites/default/files/maps/wp.png";
	iconpathWp = 'http://tinyurl.com/anoh2kd';							//use url shortened path for shorter map url
	var iconpathMe = remoteCmsURL + "/sites/default/files/maps/me.png";
	var where = 'record.ttnid === "' + currentTour.get() + '"';
	var mkrStr = '';
	var coordsList = [];
	var c = 1;
		
	geo.get(function(state) {
		if(state == "on") {
			mkrStr = '&markers=icon:' + iconpathMe + '|' + $.trim(currentLat.get()) + ',' + $.trim(currentLng.get());
		}	
	});
	
	store.waypoints.where(where, function(data) {
		$.each(data, function(i, item) {
			var wp = item.value;
			coordsList.push(trimWsCom(wp.Coordinates));
			var coords = trimWsCom(wp.Coordinates).split(",");
			
			if($.trim(coords[0]) != '' || $.trim(coords[1]) != '') {
				if(currentWeight.get() == '1' && wp.Weight == '1') {	
					mkrStr += smMarkUp(iconpathWp, coords[0], coords[1]);
				}
				else if(currentWeight.get() == '2' && (wp.Weight == '1' || wp.Weight == '2')) {			
					mkrStr += smMarkUp(iconpathWp, coords[0], coords[1]);
				}
				else if(currentWeight.get() == '3' && (wp.Weight == '1' || wp.Weight == '2' || wp.Weight == '3')) {			
					mkrStr += smMarkUp(iconpathWp, coords[0], coords[1]);
				}						
				else if(currentWeight.get() == '4') {
					mkrStr += smMarkUp(iconpathWp, coords[0], coords[1]);
				}
			}
			
			if(c > 15) {
				return false;
			}
			 
			c++;		
		});
	});
	
	return 'http://maps.google.com/maps/api/staticmap?center='+ getGeoAverage(coordsList) + '&zoom=14&size=320x206&scale=2&maptype=roadmap' + mkrStr + '&sensor=false&key=AIzaSyAlyOD4eG246HLkKW-YiRCdDMdfA5z8VSU';
}

function smMarkUp(icon, lat, lng) {
	return '&markers=icon:' + icon + '|shadow:false|' + $.trim(lat) + ',' + $.trim(lng);	
}

var createWpGalleries = function(im, tn, caps) {
	try {		
		// empty gallery
		$('.gallery').html('');
		
		for(i = 0; i < im.length; i++) {
			if(typeof caps[i] === 'undefined') {
				var caption = 'Image ' + i;
			}
			else {
				var caption = caps[i];
			}
			
			$('.gallery').append('<li><a href="' + im[i] + '" rel="external"><img src="' + tn[i] + '" alt="' + caption + '" /></a></li>');
		}
	}
	catch(e) {
		//console.log("Exception in createWpGalleries: " + e.message);
	}
}

function showWpAudio( urlObj, options ) {
	var wpId = urlObj.hash.replace( /.*wp=/, "" ),
		pageSelector = urlObj.hash.replace( /\?.*$/, "" ),
		$page = $( pageSelector ),
		$header = $page.children( ":jqmData(role=header)" ),
		$content = $page.children( ":jqmData(role=content)" ),
		markup = '<ul data-role="listview" data-inset="false" class="audio-list">',
		title;
		
	store.waypoints.get(wpId, function(item) {
		
		var audio = (typeof item.value.Audio !== 'undefined') ? item.value.Audio : false;
		var audioTitles = (typeof item.value.Audio_titles !== 'undefined') ? item.value.Audio_titles : false;
		var audioCaptions = (typeof item.value.Audio_captions !== 'undefined') ? item.value.Audio_captions : false;
        var audioId = null;
		title = item.value.Title;
		
		for(i = 0; i < audio.length; i++) {
			if(!audioTitles) {
				var clipTitle = 'Audio ' + i;
			}
			else {
				var clipTitle = audioTitles[i];
			} 
					
			if(!audioCaptions) {
				var caption = 'Audio ' + i;
			}
			else {
				var caption = audioCaptions[i];
			} 
			
			audioId = 'audio_' + i;

      
			if (navigator.userAgent.match(/BlackBerry/i)) {
        markup += '<li><a href="#" onclick="createBBAudio(this, \''+ audio[i] + '\')"><h3 class="ui-li-heading">' + clipTitle + '</h3><p class="ui-li-desc">' + caption + '</p><img src="css/images/icon-audio-2x.png" /></a></li>';			  
		  } else if ((navigator.userAgent.match(/Android/i))) {
			  markup += '<li><a href="#" onclick="playMediaY(\'file:///android_asset/www/' + audio[i] + '\')"><h3 class="ui-li-heading">' + clipTitle + '</h3><p class="ui-li-desc">' + caption + '</p><img src="css/images/icon-audio-2x.png" /></a><audio id="'+audioId+'" style="display:none" ><source src="' + audio[i] +'"  type="audio/mpeg" ></audio></li>';	
		  }
		  else {
		  
        markup += '<li><a href="#" onclick="toggleAudio(this, \'#'+ audioId + '\')"><h3 class="ui-li-heading">' + clipTitle + '</h3><p class="ui-li-desc">' + caption + '</p><img src="css/images/icon-audio-2x.png" /></a><audio id="'+audioId+'" style="display:none" ><source src="' + audio[i] +'"  type="audio/mpeg" ></audio></li>';		    
		  }
		  
		}
		
	});

	markup += "</ul>";
		
	$content.html( '<h3 class="audio-wp-title">Audio: ' + title + '</h3>' + markup );
	$page.page();
	$content.find( ":jqmData(role=listview)" ).listview();
	options.dataUrl = urlObj.href;
	$.mobile.changePage( $page, options );
	trackPage('audio/'+wpId+'/'+title);
}

function createBBAudio(e, src) {
	var audio = new Audio;          
	audio.setAttribute("src", src);
	audio.load();
	$(e).parents('li').toggleClass('playing');
	audio.play();
}


var gAudioPlay = 0;
function toggleAudio(e, id) {

  var el = $(id).get(0);
  
  
  $(e).parents('li').toggleClass('playing');
  
  if (gAudioPlay) {
    el.pause();
  } else {
    el.play();
  }
  
  gAudioPlay ^= 1;
  
}

function playMediaX(id) {
  if ($(id).get(0).paused) $(id).get(0).play();
  else $(id).get(0).pause()
}

function showWpVideo( urlObj, options ) {
	var wpId = urlObj.hash.replace( /.*wp=/, "" ),
		pageSelector = urlObj.hash.replace( /\?.*$/, "" ),
		$page = $( pageSelector ),
		$header = $page.children( ":jqmData(role=header)" ),
		$content = $page.children( ":jqmData(role=content)" ),
		markup = '<ul data-role="listview" data-inset="false" class="video-list">',
		wpTitle;
		
	store.waypoints.get(wpId, function(item) {
		
		var video = (typeof item.value.Video !== 'undefined') ? item.value.Video : false;
		var videoBB = (typeof item.value.Video_bb !== 'undefined') ? item.value.Video_bb : false;
		var videoThumbs = (typeof item.value.Video_thumbs !== 'undefined') ? item.value.Video_thumbs : false;
		var videoTitles = (typeof item.value.Video_titles !== 'undefined') ? item.value.Video_titles : false;
		var videoCaptions = (typeof item.value.Video_captions !== 'undefined') ? item.value.Video_captions : false;
		wpTitle = (typeof item.value.Title !== 'undefined') ? item.value.Title : false;
		
		for(i = 0; i < video.length; i++) {
			var vidData = encodeURI(video[i]);
			var vidDataBB = encodeURI(videoBB[i]);
			var vidThumb = encodeURI(videoThumbs[i]);
			var videoId = "video_" + i;
			var title;
      
			if(typeof videoTitles[i] === 'undefined') {
				title = 'Video ' + i;
			}
			else {
				title = videoTitles[i];
			}
			
			if(typeof videoCaptions[i] === 'undefined') {
				var caption = 'Video ' + i;
			}
			else {
				var caption = videoCaptions[i];
			}

			if(typeof videoThumbs[i] === 'undefined') {
				var vidPoster = '';
			}
			else {
				var vidPoster = videoThumbs[i];
			}
			
			if (navigator.userAgent.match(/Android/i)) {
			  // Android
			  		markup += '<li data-icon="false"><a href="#"  onclick="playMediaY(\'file:///android_asset/www/' + vidData + '\')" ><h3 class="ui-li-heading">' + title + '</h3><p class="ui-li-desc">' + caption + '</p></a></li>';  
			
			} else if (navigator.userAgent.match(/BlackBerry/i)) {
				//BB
				markup += '<li data-icon="false"><a href="#" onclick="playMediaZ(\''+vidDataBB+'\')" ><h3 class="ui-li-heading">' + title + '</h3><p class="ui-li-desc">' + caption + '</p></a></li>';
			}
			else {
			  // IOS
			  markup += '<li data-icon="false"><a href="#" onclick="playMediaX(\'#'+ videoId + '\')" ><h3 class="ui-li-heading">' + title + '</h3><p class="ui-li-desc">' + caption + '</p><video id="'+videoId+'" width="47" height="47" poster="'+vidPoster+'" controls preload="none"><source src="'+ vidData +'" type="video/mp4" /></video></a></li>';
			} 
		}
	});

	markup += "</ul>";
	
	$content.html( '<h3 class="video-wp-title">Video: ' + wpTitle + '</h3>' + markup );
	$page.page();
	$content.find( ":jqmData(role=listview)" ).listview();
	//$page.trigger( "create" );
	options.dataUrl = urlObj.href;
	$.mobile.changePage( $page, options );
	trackPage('video/'+wpId+'/'+wpTitle);
}

function playMediaY(id) {
  window.plugins.videoPlayer.play(id);
}

function playMediaZ(url) {
	if(typeof window.plugins.childBrowser === 'undefined') {
		cb = window.plugins.childBrowser;
	}
	window.plugins.childBrowser.showWebPage(url, { showLocationBar: false });
}

function showMoreInfo() {
	store.waypoints.get(currentWp.get(), function(item) {
		$('.fun-facts-title').html(item.value.More_info_label[0]);
		$('#fun-facts-body').html(item.value.More_info[0]);
		parseDefinitions();
	});
}

function isPlatform(name) {
	return navigator.userAgent.match(name) ? true : false;
}
