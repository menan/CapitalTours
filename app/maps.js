// google maps globals
var geocoder,
	map,
	infowindow,
	directionsDisplay,
	directionsService = new google.maps.DirectionsService();

// initialize and display google maps
function initMap() {
	var latLng,
		title = "You Are Here",
		zoom = 16,
		coords = [],
		pageType = "#tour",
		where = 'record.ttnid === "' + currentTour.get() + '"';
	
	if(currentTour.get() === false) {
		where = 'record.tstnid === "' + currentTourSet.get() + '"';
		pageType = "#tour-home";
	}

	directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
	
	// set options for writing map
	var myOptions = {
	    zoom: zoom,
		disableDefaultUI: true,
	    mapTypeId: google.maps.MapTypeId.ROADMAP,
	    styles: [
		    {
	        	featureType: "poi",
	        	elementType: "labels",
	        	stylers: [{ visibility: "off" }]
	        }
        ]
	};

	// create map
	map = new google.maps.Map(document.getElementById('map_canvas'), myOptions);
	
	geo.get(function(state) {
		if(state == "on") {
			// set latitude and longitude
			latLng = new google.maps.LatLng(currentLat.get(), currentLng.get());
				    
			// create marker
			var marker = new google.maps.Marker({
				position: latLng,
				map: map,
				title: title,
				center: latLng,
				icon: new google.maps.MarkerImage(
					'css/images/map-2x.png',
					new google.maps.Size(13, 12),
					new google.maps.Point(4, 88),
					null,
					new google.maps.Size(169,121)
				)		
			});
			marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
		}
		else {
			store.waypoints.where(where, function(data) {
				$.each(data, function(i, item) {
					coords.push(trimWsCom(item.value.Coordinates));
				});
			});
			
			var latLngSplit = getGeoAverage(coords).split(',');
			latLng = new google.maps.LatLng(latLngSplit[0], latLngSplit[1]);		
			//console.log(latLngSplit + " " + where);
		}
	});
	
	//fake location
	/*
latLng = new google.maps.LatLng(45.424773, -75.699642);
	var marker = new google.maps.Marker({
				position: latLng,
				map: map,
				title: title,
				center: latLng,
				icon: new google.maps.MarkerImage(
					'css/images/map-2x.png',
					new google.maps.Size(13, 12),
					new google.maps.Point(4, 88),
					null,
					new google.maps.Size(169,121)
				)		
			});
	marker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
*/
	
	infowindow = new InfoBox({
		content: title,
		position: latLng,
		size: new google.maps.Size(50,50),
		boxClass: 'map-infobox',
		closeBoxURL: "",
		alignBottom: true,
		maxWidth: 250,
		pixelOffset: new google.maps.Size(-100,-60),
		pane: 'floatPane'				
	});

	map.setCenter(latLng);
	
	//infowindow.open(map);
	
	// centre map around marker
	directionsDisplay.setMap(map);
	
	// place markers
	setMapMarkers(pageType);	
	placeStaticPins();
}

function setMapMarkers(type) {
	var where, weight = currentWeight.get();
	
	switch(type)
	{
		case '#tour-home':
			where = 'record.tstnid === "' + currentTourSet.get() + '"';
			break;
		case '#waypoint':
		case '#tour':
			where = 'record.ttnid === "' + currentTour.get() + '"';
			break;
		default:
			where = 'record.tstnid === "' + currentTourSet.get() + '"';
			break;
	}	
		
	store.waypoints.where(where, function(data) {
		$.each(data, function(i, item) {			
			if((weight == '1' && item.value.Weight == '1') || weight == 'waypoint') {
				setMapMarkersContent(item);
			}
			else if(weight == '2' && (item.value.Weight == '1' || item.value.Weight == '2')) {
				setMapMarkersContent(item);
			}
			else if(weight == '3' && (item.value.Weight == '1' || item.value.Weight == '2' || item.value.Weight == '3')) {
				setMapMarkersContent(item);
			}						
			else if(weight == '4') {
				setMapMarkersContent(item);
			}			
			
		});
	});
}

// loop through an array of map markers and place them on the map
function setMapMarkersContent(wp) {
	var noticeMsg = '', coords = trimWsCom(wp.value.Coordinates).split(",");
	
	if($.trim(coords[0]) != '' || $.trim(coords[1]) != '') {
		if (wp.value.Notice) {
			noticeMsg = '<span class="wp-info-notice">!</span>';
		}
		var contentString = '<div class="content">' +
							'<a href="#waypoint" onclick="javascript:initWaypointDetail(' 
							+ '\'' + wp.key + '\',' + '\'' + wp.ttnid + '\'' + '); ">' +
							noticeMsg +
							'<div class="iw-image"><img src="' + wp.value.Main_image + '"  /></div>' +
							'<div class="iw-title">' + wp.value.Title + '</div>' +
							'<a/>' +
							'</div>';
							
		placeMarker(coords[0], coords[1], contentString);
	}
}

// place markers on map
function placeMarker(lat, lng, infoWindowContent) {
	// set latitude and longitude
	var latLng = new google.maps.LatLng(lat, lng);	

	// create marker
	var marker = new google.maps.Marker({
		position: latLng,
		map: map,
		icon: new google.maps.MarkerImage(
			'css/images/map-2x.png',
			new google.maps.Size(22, 33),
			null,
			null,
			new google.maps.Size(169,121)
		)
	});
	
	// display caption window on click
	google.maps.event.addListener(marker, 'click', function() {
		if (infowindow) {
			infowindow.close();
		}
		infowindow.setContent(infoWindowContent);
		infowindow.open(map, marker);
	});
	
}

function refreshMap() {
	google.maps.event.trigger(map, 'resize');
}

function blankMap() {
	$('#map_canvas').html('<p class="no-connection">'+ unescapeHtml(Brule.resources.Offlinemap) +'</p>');
}



function placeStaticPins() {
	 var pinData = [
		{
			name: 'drinking fountain',
			kind: 'fountain',
			lat: 45.423794,
			long: -75.701487
		},
		{
			name: 'restroom',
			kind: 'restroom',
			lat: 45.423825,
			long: -75.701401
		},
		{
			name: 'info kiosk',
			kind: 'info',
			lat: 45.425718,
			long: -75.698918
		},
		{
			name: 'info north of alexandra bridge',
			kind: 'info',
			lat: 45.432009,
			long: -75.710199
		},
		{
			name: 'fountain near major hill',
			kind: 'fountain',
			lat: 45.428448,
			long: -75.698285
		},
		{
			name: 'info on albert',
			kind: 'info',
			lat: 45.421895,
			long: -75.696874
		},
		{
			name: 'restroom near major hill',
			kind: 'restroom',
			lat: 45.428425,
			long: -75.698521
		}
	]
	
	var pinUAData = [
		{
			name: 'ramp entrance west',
			kind: 'ramp',
			lat: 45.42331,
			long: -75.698875
		},
		{
			name: 'ramp entrace center',
			kind: 'ramp',
			lat: 45.423497,
			long: -75.698478
		},
		{
			name: 'ramp entrance east',
			kind: 'ramp',
			lat: 45.423656,
			long: -75.698065
		},
		{
			name: 'ramp entrance far east',
			kind: 'ramp',
			lat: 45.424058,
			long: -75.697088
		},
		{
			name: 'ramp behind queen vic',
			kind: 'ramp',
			lat: 45.42396,
			long: -75.701369
		},
		{
			name: 'ramp by summer pavilion',
			kind: 'ramp',
			lat: 45.425684,
			long: -75.701313
		},
		{
			name: 'ramp by bytown',
			kind: 'ramp',
			lat: 45.425577,
			long: -75.698172
		},
		{
			name: 'crosswalk 1',
			kind: 'crosswalk',
			lat: 45.422654,
			long: -75.699888
		},
		{
			name: 'crosswalk 2',
			kind: 'crosswalk',
			lat: 45.423162,
			long: -75.699524
		},
		{
			name: 'crosswalk 3',
			kind: 'crosswalk',
			lat: 45.423478,
			long: -75.697914
		},
		{
			name: 'crosswalk 4',
			kind: 'crosswalk',
			lat: 45.424051,
			long: -75.697614
		},
		{
			name: 'crosswalk 5',
			kind: 'crosswalk',
			lat: 45.424092,
			long: -75.696563
		},
		{
			name: 'stairs 1',
			kind: 'stairs',
			lat: 45.422733,
			long: -75.700146
		},
		{
			name: 'stairs behind east block',
			kind: 'stairs',
			lat: 45.424774,
			long: -75.696158
		},
		{
			name: 'stairs west of centre block',
			kind: 'stairs',
			lat: 45.424148,
			long: -75.700425
		},
		{
			name: 'stairs to centre block',
			kind: 'stairs',
			lat: 45.424408,
			long: -75.699282
		},
		{
			name: 'stairs east of centre block',
			kind: 'stairs',
			lat: 45.425021,
			long: -75.69844
		},
		{
			name: 'stairs to centre block door',
			kind: 'stairs',
			lat: 45.424755,
			long: -75.699567
		},
		{
			name: 'stairs behind east block',
			kind: 'stairs',
			lat: 45.425185,
			long: -75.697692
		},
		{
			name: 'stairs behind west block',
			kind: 'stairs',
			lat: 45.423666,
			long: -75.701627
		},
		{
			name: 'stairs to queen vic',
			kind: 'stairs',
			lat: 45.424111,
			long: -75.701026
		},
		{
			name: 'stairs to summer pavilion',
			kind: 'stairs',
			lat: 45.425482,
			long: -75.701267
		},
		{
			name: 'crosswalk wellington',
			kind: 'crosswalk',
			lat: 45.419359,
			long: -75.70764
		},
		{
			name: 'ramp near sparks',
			kind: 'ramp',
			lat: 45.418828,
			long: -75.70775
		},
		{
			name: 'crosswalk at mackenzie',
			kind: 'crosswalk',
			lat: 45.428591,
			long: -75.696992
		},
		{
			name: 'ramp before alexandra bridge',
			kind: 'ramp',
			lat: 45.429122,
			long: -75.700328
		}
	]
	
	var pinSprites = [
		{
			kind: 'restroom',
			x: 42,
			y: 0
		},
		{
			kind: 'fountain',
			x: 123,
			y: 0
		},
		{
			kind: 'info',
			x: 82,
			y: 0
		},
		{
			kind: 'ramp',
			x: 123,
			y: 33
		},
		{
			kind: 'crosswalk',
			x: 42,
			y: 33
		},
		{
			kind: 'stairs',
			x: 82,
			y: 33
		}
	]
	
	if (uaEnabled) pinData = pinData.concat(pinUAData);
	
	for (var i in pinData) {
		var latLng = new google.maps.LatLng(pinData[i].lat, pinData[i].long);
		
		var posX, posY;
		for (var p in pinSprites) {
			if (pinData[i].kind == pinSprites[p].kind) {
				posX = pinSprites[p].x;
				posY = pinSprites[p].y;
			}
		}
		
		var marker = new google.maps.Marker({
			position: latLng,
			map: map,
			optimized: true,
			icon: new google.maps.MarkerImage(
				'css/images/map-2x.png',
				new google.maps.Size(17, 18),
				new google.maps.Point(posX, posY),
				null,
				new google.maps.Size(169,121)
			)
		});
	}
}