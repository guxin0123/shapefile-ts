import shp from '../src/index.ts'

var m = L.map('map').setView([34.74161249883172, 18.6328125], 2);
var geo = L.geoJson({ features: [] }, {
  onEachFeature: function popUp(f, l) {
    var out = [];
    if (f.properties) {
      for (var key in f.properties) {
        out.push(key + ": " + f.properties[key]);
      }
      l.bindPopup(out.join("<br />"));
    }
  }
}).addTo(m);
var base = location.href + '/files/TM_WORLD_BORDERS_SIMPL-0.3.zip';
shp(base, null, "GB18030").then(function (data) {
  geo.addData(data);
});