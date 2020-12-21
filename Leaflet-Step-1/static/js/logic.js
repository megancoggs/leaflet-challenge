/// Create function to assign color based on depth

// Per USGS:
// Shallow earthquakes are between 0 and 70 km deep;
// Intermediate earthquakes are between 70 - 300 km deep; 
// Deep earthquakes are between 300 - 700 km deep.
// Shallow earthquakes typically cause more damage

function assignColor(depth) {
  if (depth > 300) {return "#239B56"} // green
  else if (depth > 70) {return "#F4D03F"} // yellow
  else {return "#E74C3C"} // red
  };

// Create function to assign radius based on magnitude
// Earthquake magnitude classes:
// Great:	8 or more
// Major:	7 - 7.9
// Strong:	6 - 6.9
// Moderate:	5 - 5.9
// Light:	4 - 4.9
// Minor:	3 -3.9

function assignRadius(magnitude) {
  return magnitude * 3
};

// Set query URL
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_day.geojson"

// Use D3 to pull JSON data from API
d3.json(queryUrl, function(data) {

  // Send the data.features object to the createFeatures function
  createFeatures(data.features);
  console.log(data.features);
});

function createFeatures(earthquakeData) {

  // Create function to give earthquake a pop-up
  function onEachFeature(feature, layer) {  
    layer.bindPopup(`<h3> ${feature.properties.place}</h3><hr>
      <p>Magnitude: ${feature.properties.mag}</p>
      <p>Depth: ${feature.geometry.coordinates[2]}</p>
      <p>Time: ${new Date(feature.properties.time)}</p>`);
  
  }

  // Create function to assign marker with radius based on magnitude
  // and color based on depth (functions defined at bottom of script)
  function onEachLayer(feature) {

    // Note coordinates are displayed in API as longitude, latitude rather than latitude, longitude
    var coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
    
    return new L.CircleMarker(coords, {
      radius: assignRadius(feature.properties.mag),
      fillColor: assignColor(feature.geometry.coordinates[2]),
      color: assignColor(feature.geometry.coordinates[2]),
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    });
  }

  // Create a GeoJSON layer 
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature, 
    pointToLayer: onEachLayer
  });


  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
};

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // LEGEND NOT DISPLAYING CORRECTLY 
  // // Create a legend
  // var key = L.control({
  //   position: "bottomright"
  // });

  // // When layer is added, insert div with class of legend
  // key.onAdd = function() {
  //   var div = L.DomUtil.create("div", "legend");
  //   var colors = ["#239B56", "#F4D03F", "#E74C3C"];
  //   var labels = ["300+km", "70-300km", ">70km"];

  //   for (var j = 0; j < labels.length; j++) {
  //     div.innerHTML = `<i style='background: ${colors[j]}></i>${labels[j]}<br>`
  //   };

  //   return div;
  // };
  // key.addTo(myMap);

};
