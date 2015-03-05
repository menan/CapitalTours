var uaEnabled = false;

function setUpUA() {
	$('#ua-switch').change(function(){
		uaEnabled = ($(this).val() == 'on') ? true : false;
		trackEvent('switch', 'ua', String(uaEnabled));
	});
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
			name: 'info tents',
			kind: 'info',
			lat: 49.289404,
			long: -123.129981
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
			name: 'the restroom of autobox',
			kind: 'stairs',
			lat: 49.290125,
			long: -123.129734
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