var langPref, shareAction, uaEnabled, remoteData = false, remoteCmsURL = "http://tour.canadascapital.ca";

function init() {
  
}

store = {
  settings:   new Lawnchair({name:'settings'}, function(){}),
  toursets:   new Lawnchair({name:'toursets'}, function(){}),
  tours:      new Lawnchair({name:'tours'}, function(){}),
  pages:      new Lawnchair({name:'pages'}, function(){}),
  topics:     new Lawnchair({name:'topics'}, function(){}),
  waypoints:  new Lawnchair({name:'waypoints'}, function(){})
}

store.settings.get("bookmarks", function(obj){
  if(!obj)
    store.settings.save({key: "bookmarks", value: []})
})

function fetchLanguage(cb){
  store.settings.get("language", function(language){
    if(language){
      cb(language.value)
    }else{
      cb(null)
    }
  })
}

function fetchData(lang, cb){
  store.settings.get("language", function(language){
    if(language){
      //console.log("Language: " + language.value)
      if(cb) cb()
    }else{
      //console.log("Language: Not Found. fetching and caching English...")
    	cacheData("English", cb)
    }
  })
}

function cacheData(language, cb){
	var dataUrl, remoteUrl = remoteCmsURL+'/ncc/json';
	var localUrl = 'data.js';
	
	dataUrl = remoteData ? remoteUrl : localUrl;
	
	if (language == "French") {
		$('body').removeClass('en fr').addClass('fr');
		$.extend(Brule.resources, Brule.frStrings);
	}
	else {
		$('body').removeClass('en fr').addClass('en');
		$.extend(Brule.resources, Brule.enStrings);
	}
	applyLang();
	
	$.ajax({ url: dataUrl, dataType: 'jsonp', jsonpCallback: 'ncc', success: function(data) {
	    store.toursets.nuke()
	    store.tours.nuke()
	    store.pages.nuke()
	    store.topics.nuke()
	    store.waypoints.nuke()
	  
	    data.nodes.forEach(function(node){
	      if(node.Type == "version"){
	        store.settings.save({
	          key: "version",
	          value: node["Number"]
	        })
	      }else if(node.Type == "page" && node.Language == language){
	        store.pages.save({
	          key: node.Tnid, 
	          value: { nid: node.Nid, tnid: node.Tnid, body: node.Body, title: node.Title }
	        })
	      }else if(node.Type == "topics" && node.Language == language){
	        
	        store.topics.save({
	          key: "collection", 
	          value: node.terms
	        })
	      }else if(node.Type == "tour_set" && node.Language == language){  
	        var title = (typeof node.Title === 'undefined') ? '' : node.Title
	        var mainImage = (typeof node.Main_image === 'undefined') ? '' : node.Main_image
	        var setImage = (typeof node.Set_image === 'undefined') ? '' : node.Set_image
	        var precis = (typeof node.Precis === 'undefined') ? '' : node.Precis
	        var tids = (typeof node.Tid === 'undefined') ? '' : trimWsCom(node.Tid)
	        store.toursets.save({
	           key: node.Tnid, 
	           value: { 
	             nid: node.Nid, 
	             tnid: node.Tnid, 
	             tids: tids, 
	             title: title, 
	             image: mainImage, 
	             setimg: setImage, 
	             precis: precis
	           }
	        })
	        node.Tours.forEach(function(tour){
	          		var title = (typeof tour.Title === 'undefined') ? '' : tour.Title;
	  			  	var mainImage = (typeof tour.Main_image === 'undefined') ? '' : tour.Main_image;
	  				var precis = (typeof tour.Precis === 'undefined') ? '' : tour.Precis;
	  				var body = (typeof tour.Body === 'undefined') ? '' : tour.Body;
	  				var tids = (typeof tour.Tid === 'undefined') ? '' : trimWsCom(tour.Tid);
	  				var persp = (typeof tour.Include_perspectives === 'undefined') ? '' : tour.Include_perspectives;
	  				
	  				store.tours.save({
		            key: tour.Tnid, 
		            tstnid: node.Tnid,
		            value: { 
		              nid: tour.Nid, 
		              tnid: tour.Tnid, 
		              tids: tids, 
		              title: title, 
		              precis: precis, 
		              body: body, 
		              image: mainImage,
		              persp: persp 
		            }
	            });
		  		tour.Waypoints.forEach(function(wp){
			    	store.waypoints.save({ 
			        	key: wp.Tnid, 
			        	ttnid: tour.Tnid,
			        	tstnid: node.Tnid,
			        	value: wp
			         });
		         });      
	        });     
	     }else{
	       //console.log("discard " + node.Type)
	     }
    });
    
    //console.log("done caching data for " + language)
  
    store.settings.save({
      key: "language",
      value: language
      }, function(){
      if(cb) cb()
    })
  }})
}

function setLang(choice) {
  cacheData(choice, function(){
    //console.log("done")
  })
}

//set up localized app strings
function bindI18tn() {
	store.settings.get("language", function(language) {
		if (language && language.value == "French") {
			$('body').removeClass('en fr').addClass('fr');
			$.extend(Brule.resources, Brule.frStrings);
		}
		else{
			$('body').removeClass('en fr').addClass('en');
			$.extend(Brule.resources, Brule.enStrings);
		}
	});
	applyLang();
}



//set app strings to reflect language choice
function applyLang() {
	$('[data-id="header"] h1').text(Brule.resources.Title);
	$('[data-role="navbar"] .ui-block-a .ui-btn-text').text(Brule.resources.Home);
	$('[data-role="navbar"] .ui-block-b .ui-btn-text').text(Brule.resources.Map);
	$('[data-role="navbar"] .ui-block-c .ui-btn-text').text(Brule.resources.Me);	
	$('.tour-times label[for="radio-tourtime-all-2"] .ui-btn-text, .tour-times label[for="radio-tourtime-all"]  .ui-btn-text').text(Brule.resources.Show_all);
	$('a#topic-filter .ui-btn-text').text(Brule.resources.Filter);
	$('a#photo-galleryx strong').text(Brule.resources.Photos);
	$('a#wpvideo strong').text(Brule.resources.Video);
	$('a#wpaudio strong').text(Brule.resources.Audio);
	$('a#wp-share strong').text(Brule.resources.Share);
	$('a#next-waypoint .ui-btn-text').text(unescapeHtml(Brule.resources.Next_wpt));
	$('label[for=geo-switch]').text(unescapeHtml(Brule.resources.Geolocation));
	$('label[for=ua-switch]').text(unescapeHtml(Brule.resources.Accessible_map));
	$('a#terms-link').text(Brule.resources.ToCs);
	$('#notifications').text(unescapeHtml(Brule.resources.Far_wps));
	$('#wp-share-fb .ui-btn-text').text(Brule.resources.Share_fb);
	$('#wp-share-tw .ui-btn-text').text(Brule.resources.Share_tw);
	$('#wp-share-cancel .ui-btn-text').text(Brule.resources.Cancel);
}

function unescapeHtml(string) {
    return $("<div>"+string+"</div>").html()
}

function jGet(id) {
	store.waypoints.get(id, function(wp) {
		console.log(wp)
	});
}