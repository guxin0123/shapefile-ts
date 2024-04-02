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
//var base = location.href + '/files/沉积岩.zip';
shp(base, null, "GB18030").then(function (data) {
  geo.addData(data);
});

// document.getElementById("upload").addEventListener("click", () => {
//   PickUploadFileLegacy((file, name) => {
//     loadUploadFile(file, name);

//   }, ".zip,.csv,.json,.geojson,.gml");

// })
// const loadUploadFile = (file, path) => {

//   // const customNum = opts.customNum++;
//   const name = path.split("\\").pop();

//   const fileNameLower = name.toLowerCase();
//   const layerName = name.split(".")[0];
//   if (file && fileNameLower.endsWith(".zip")) {
//       //loadShpFile(file, layerName);
//       readUploadFile(file, async (result) => {
//           const geoJsonData = await shp(result, null, "GB18030");
//           addByGeoJsonData(geoJsonData, layerName);
//       });
//       return;
//   }
//   if (file && fileNameLower.endsWith(".csv")) {
//       loadCsvFile(file, layerName);
//       return;
//   }
//   if (file && (fileNameLower.endsWith(".geojson") || fileNameLower.endsWith(".json"))) {
//       //loadGeoJsonFile(file, layerName);
//       readUploadFile(file, async (result) => {
//           const geoJsonData = result;
//           addByGeoJsonData(geoJsonData, layerName);
//       });
//       return;
//   }
//   if (file && fileNameLower.endsWith(".gml")) {
//       //loadGmlFile(file, layerName);
//       readUploadFile(file, async (result) => {
//           const geoJsonData = gml2geojson.parseGML(result);
//           addByGeoJsonData(geoJsonData, layerName);
//       });
//       return;
//   }
//   if (file && (fileNameLower.endsWith(".tif") || fileNameLower.endsWith(".tiff"))) {
//       // loadGeoTiffFile(file, layerName);
//       //return;
//   }
//   //coco.alert("不支持的文件格式!");
//   Report.failure("错误","不支持的文件格式!","关闭");
// }

// const readUploadFile = (blobFile, onSuccess) => {
//   const fileReader = new FileReader();
//   fileReader.onload = async (e) => {
//       onSuccess(e.target.result);
//   }
//   fileReader.readAsArrayBuffer(blobFile);
// }
// function addByGeoJsonData(a,b){
//   geo.addData(a);
// }
// //传统上传方式
// function PickUploadFileLegacy(onChange, accept) {
//   const input = document.createElement("input");
//   input.type = "file";
//   // noinspection JSValidateTypes
//   input.style.display = "none";
//   //input.accept = ".zip,.csv";
//   if (accept) {
//     input.accept = accept;
//   }

//   input.onchange = function () {
//     if (onChange) {
//       const file = input.files[0];
//       const name = input.value;
//       input.remove();
//       onChange(file, name);
//     }
//   }
//   document.getElementsByTagName("body")[0].appendChild(input);
//   setTimeout(() => {
//     input.click();
//   }, 100);
// }
