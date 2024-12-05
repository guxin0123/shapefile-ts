import shp from '../src/index.ts'
//import shp from '../src/index.ts'


// const shpHelper = new ShpHelper();
// shpHelper.combine(shpHelper.parseShp(new Uint8Array(shpBuffer), /*optional prj str*/),shpHelper.parseDbf(new Uint8Array(dbfBuffer)));

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
//var base =  'data/htmlprj?blah=baz';
//var base =  'files/TM_WORLD_BORDERS_SIMPL-0.3.zip';
var base =  '/data/qgis.zip?aaa=bbb';
//var base =  'http://localhost:5173/files/pandr.shp';
shp(base, null, "GB18030").then(function (data) {
  //console.log(data)
  geo.addData(data);
});
const geoJsonData = await shp("/data/export_multipointz.dbf", null, "GB18030");
addByGeoJsonData(geoJsonData, "codepage");


document.getElementById("upload").addEventListener("click", () => {
  PickUploadFileLegacy((file, name) => {
    loadUploadFile(file, name);
  }, ".zip");

})
const loadUploadFile = (file, path) => {

  // const customNum = opts.customNum++;
  const name = path.split("\\").pop();

  const fileNameLower = name.toLowerCase();
  const layerName = name.split(".")[0];
  if (file && fileNameLower.endsWith(".zip")) {
      //loadShpFile(file, layerName);
      readUploadFile(file, async (result) => {
          const geoJsonData = await shp(new Uint8Array(result), null, "GB18030");
          addByGeoJsonData(geoJsonData, layerName);
      });
      return;
  }
  alert("错误,不支持的文件格式!,关闭");
}

const readUploadFile = (blobFile, onSuccess) => {
  const fileReader = new FileReader();
  fileReader.onload = async (e) => {
      onSuccess(e.target.result);
  }
  fileReader.readAsArrayBuffer(blobFile);
}
function addByGeoJsonData(a,b){
  geo.addData(a);
  console.log("layer added name :"+b)
}
//传统上传方式
function PickUploadFileLegacy(onChange, accept) {
  const input = document.createElement("input");
  input.type = "file";
  // noinspection JSValidateTypes
  input.style.display = "none";
  //input.accept = ".zip,.csv";
  if (accept) {
    input.accept = accept;
  }

  input.onchange = function () {
    if (onChange) {
      const file = input.files[0];
      const name = input.value;
      input.remove();
      onChange(file, name);
    }
  }
  document.getElementsByTagName("body")[0].appendChild(input);
  setTimeout(() => {
    input.click();
  }, 100);

}
