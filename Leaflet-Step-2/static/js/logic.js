url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"



plates_file = "Resources/plates.json"


d3.json(plates_file).then(function(platesData) {

  //finding max and min for depths

     
console.log(platesData)







// Perform a GET request to the query URL
d3.json(url).then(function(data) {

  //finding max and min for depths
depths = []
     for (var i = 0; i < data.features.length; i++) {
      depth = data.features[i].geometry.coordinates[2]
      depths.push(depth)
     }
console.log((depths))
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features, platesData.features);
});
});



function createFeatures(earthquakeData, plates) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    
    layer.on({
      // When a user's mouse touches a map feature, the mouseover event calls this function, that feature's opacity changes to 90% so that it stands out
      mouseover: function(event) {
        layer = event.target;
        layer.setStyle({
          fillOpacity: 1
        });
      },
      // When the cursor no longer hovers over a map feature - when the mouseout event occurs - the feature's opacity reverts back to 50%
      mouseout: function(event) {
        layer = event.target;
        layer.setStyle({
          fillOpacity: 0.8
        });
      },
      // When a feature (neighborhood) is clicked, it is enlarged to fit the screen
      // click: function(event) {
      //   myMap.fitBounds(event.target.getBounds());
      // }
    });


    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + "<strong> Magnitude: </strong>" + feature.properties.mag + "<br>" 
       + "<strong> Depth: </strong>" + feature.geometry.coordinates[2] + "<br>" 
      + new Date(feature.properties.time) + "</p>");
  }


  plates = L.geoJSON(plates,{  
    style: function(feature){
        return {
            color:"orange",
            fillColor: "white",
            fillOpacity:0
        }
    },      
    onEachFeature: function(feature,layer){
        console.log(feature.coordinates);
        layer.bindPopup("Plate Name: "+feature.properties.PlateName);
    }
  });
 
  function getColor(depth) {
    if (depth > 50) {
      return "#d73027"
    }
    else if (depth > 20){
      return "#fc8d59"
    }
    else if (depth > 10){
      return "#fee08b"
    }
    else if (depth > 5){
      return "#ffffbf"
    }
    else if (depth > 2){
      return "#d9ef8b"
    }
    else {
      return "#91cf60"
    }
    ["#d73027","#fc8d59","#fee08b","#ffffbf","#d9ef8b","#91cf60","#1a9850"]
  }


  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      var geojsonMarkerOptions = {
        radius: 7*feature.properties.mag,
        fillColor: getColor(feature.geometry.coordinates[2]),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes, plates);
}

function createMap(earthquakes, plates) {

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
    Plates: plates,
    Earthquakes: earthquakes
    
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var map = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, plates, earthquakes]
  });


  // map.createPane('labels');

  // map.getPane('labels').style.pointerEvents = 'none';

  
  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);


  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
  
    function chooseColor(depth) {
      if (depth > 90) {
        return "#d73027"
      }
      else if (depth > 70){
        return "#fc8d59"
      }
      else if (depth > 50){
        return "#fee08b"
      }
      else if (depth > 30){
        return "#ffffbf"
      }
      else if (depth > 10){
        return "#d9ef8b"
      }
      else {
        return "#91cf60"
      }
      ["#d73027","#fc8d59","#fee08b","#ffffbf","#d9ef8b","#91cf60","#1a9850"]
    }





      var div = L.DomUtil.create('div', 'info legend'),
          grades = [0, 10, 30, 50, 70, 90],
          labels = [];
  
          div.innerHTML = "<h3>Depth (km)</h3>"

      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML += 
              '<i style="background:' + chooseColor(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
  
      return div;
  };
  
  legend.addTo(map);

};

















// d3.json(url).then(function(data){
//   // selecting 2 lat and long using slicing
//     console.log(data.features[0].geometry.coordinates.slice(0,2))
//     var features = data.features
   
//     for (var i = 0; i < features.length; i++) {
//       console.log(features[i].geometry.coordinates.slice(0,2))



//        // Add circles to map
//  L.circle(features[i].geometry.coordinates.slice(0,2), {
//   fillOpacity: 0.75,
//   color: "white",
//   fillColor: 'green',
//   // Adjust radius
//   radius: "1500"
// })

    // }



//     var myMap = L.map("map", {
//       center: [15.5994, -28.6731],
//       zoom: 3
//     });
    
//     L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
//       attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
//       tileSize: 512,
//       maxZoom: 18,
//       zoomOffset: -1,
//       id: "mapbox/streets-v11",
//       accessToken: API_KEY
//     }).addTo(myMap);

// })






