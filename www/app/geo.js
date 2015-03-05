var watchID = null;

// track latitude
currentLat = {
   	lat: '',
	get: function() {		
        return this.lat;
    },
	set: function(l) {
        this.lat = l;
    }
};

// track longitude
currentLng = {
   	lng: '',
	get: function() {		
        return this.lng;
    },
	set: function(l) {
        this.lng = l;
    }
};

// set/get geo settings
geo = {
	get: function(cb) {
		store.settings.get("geolocation", function(geolocation) {
			if(geolocation) {
				//console.log("GEO value: " + geolocation.value);
				cb(geolocation.value);
			}
			else {
				// set default as on
				cb("on");
			}
		});
	},
	set: function(s) {
		store.settings.save(
		{
			key: "geolocation",
			value: s
		},
		function(obj) { 
			//console.log("Setting GEO to: " + obj.value); 
		});
	}
}

// toggle geolocation on/off
$(document).delegate("#geo-switch", "change", function(e) {
	var switchVal = $(this).val();
	
	store.settings.get("systemgeo", function(obj){
		if(obj) {
			if((obj.value == "disabled" && switchVal == "on") || !isConnected()) {
			
				navigator.notification.alert(
				    Brule.resources.Enable_geo_message,
				    geoSwitchAlertCB,
				    Brule.resources.Enable_geo_title
				);
			}
		}
		geo.set(switchVal);
	});
});

function geoSwitchAlertCB() {
	var geoSwitch = $("select#geo-switch");
	geo.set("off");
	geoSwitch[0].selectedIndex = 0;
	geoSwitch.slider('refresh');
	return false;	
}

if (typeof(Number.prototype.toRad) === "undefined") {
	Number.prototype.toRad = function() {
		return this * Math.PI / 180;
	}
}

//this is the same as distHaversine with different param types
function getDistance (lat1,lon1,lat2,lon2) {
	var R = 6371; // km
	var dLat = (lat2-lat1).toRad();
	var dLon = (lon2-lon1).toRad();
	var lat1 = lat1.toRad();
	var lat2 = lat2.toRad();
	
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	return d;
}

//given a data set of WPs, return the index of the closest one
function getClosestWP(data) {
	var distances = [];
	var smallestIx = 0;
	for (var i in data) {
		distances.push(
			getDistance(
				parseFloat(data[i].value.Coordinates.split(',')[0]),
				parseFloat(data[i].value.Coordinates.split(',')[1]),
				parseFloat(currentLat.get()),
				parseFloat(currentLng.get())
			));
	}
	var smallestNum = Math.min.apply(Math, distances);
	for (var i in distances) {
		if (distances[i] == smallestNum) smallestIx = i;
	}
	//console.log('The closest WP in the tour is at index: '+smallestIx);
	return Number(smallestIx);
}

function geoFence(coordsString, d) {
	if(d == null) { 
		d = .25;
	}
	var coords = trimWsCom(coordsString).split(",");
	var dist = getDistance(parseFloat(coords[0]), parseFloat(coords[1]), parseFloat(currentLat.get()), parseFloat(currentLng.get()));
	if (dist < d) return true;
	else return false;
}

function geoWPDistance(coordsString, d) {
	if(d == null) { 
		d = .25;
	}
	var coords = trimWsCom(coordsString).split(",");
	var dist = getDistance(parseFloat(coords[0]), parseFloat(coords[1]), parseFloat(currentLat.get()), parseFloat(currentLng.get()));
	if (dist > d) return true;
	else return false;
}

function getGeoAverage(coords) {
	var avLat = 0;
	var avLong = 0;
	var c = 0;
	for (var i in coords) {
		var lat = parseFloat(coords[i].split(',')[0]);
		var lng = parseFloat(coords[i].split(',')[1]);
		
		if(!isNaN(lat) && !isNaN(lng)) { 
			avLat  += lat;
			avLong += lng;			
			c++;
		}
	}
	avLat = avLat/c;
	avLong = avLong/c;
	return String(avLat) + ',' + String(avLong);
}

// watch lat and long using phonegap getCurrentPosition
function watchLatLong() {
	// Update every 10 minutes
    var options = { enableHighAccuracy:true, maximumAge:30000, timeout:27000 };
    watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
}

// get current lat and long using phonegap getCurrentPosition
function getcurrentLatLng() {
	//console.log('Retrieving current location...');
	navigator.geolocation.getCurrentPosition(onSuccess, onError, { enableHighAccuracy: true, maximumAge: 1000, timeout: 2000 });
}

// onSuccess getCurrentPosition / geolocation
function onSuccess(position) {
	// set lat, lng globals to current position
    currentLat.set(position.coords.latitude);
    currentLng.set(position.coords.longitude);
    //console.log("Got coords: " + currentLat.get() + " " + currentLng.get());
}

// getCurrentPosition onError Callback receives a PositionError object
function onError(error) {
	//console.log('GEO Error: ' + error.message);
	if(error.code == "1" || error.code == "2" || !isConnected()) {
		store.settings.save({key: "systemgeo", value: "disabled"});
		geo.set("off");
	}
}

// clear geo watch
function clearWatchLatLong() {
	navigator.geolocation.clearWatch(watchID);
}