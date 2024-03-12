import shp from '../lib/index'

var url = "/files/TM_WORLD_BORDERS_SIMPL-0.3.zip"
shp(url).then(function(data){
	var googleMap = new google.maps.Map(
		// Add a Google Map
		document.getElementById('map'), {
			center: new google.maps.LatLng(41.914541,-71.592407),
			zoom: 8,
			mapTypeId: 'roadmap'
		}
	);
	var infowindow = new google.maps.InfoWindow();
	data.features.forEach(function(feature, i){
		// Add a marker to the map
		feature.marker = new google.maps.Marker({
			position:new google.maps.LatLng(
				feature.geometry.coordinates[1],
				feature.geometry.coordinates[0]
			),
			title:feature.properties.TOWN
		});
		feature.marker.setMap(googleMap);
		// Create the info window
		//console.log(feature.properties);
		var out = [];
		for(var key in feature.properties){
			out.push(key+": "+feature.properties[key]);
		}
		var content = "<div class='iwindow'>" + out.join("<br/>") + "</div>";
		google.maps.event.addListener(
			feature.marker,
			'click',
			function() {
 				infowindow.setContent(content);
				infowindow.open(googleMap,feature.marker);
			}
		);
	});
});