# Shapefile.ts
Browser-side shapefile.js only, based on https://github.com/calvinmetcalf/shapefile-js



## Usage


    npm install shapefile-ts --save

	import shp from 'shapefile-ts/lib/shp';

## API

Has a function `shp` which accepts a string which is the path the she shapefile minus the extension and returns a promise which resolves into geojson.

```javascript
	//for the shapefiles in the folder called 'files' with the name pandr.shp
	shp("files/pandr").then(function(geojson){
		//do something with your geojson
	});
```
or you can call it on a .zip file which contains the shapefile

```javascript
	//for the shapefiles in the files folder called pandr.shp
	shp("files/pandr.zip").then(function(geojson){
		//see bellow for whats here this internally call shp.parseZip()
	});
```

or if you got the zip some other way (like the [File API](https://developer.mozilla.org/en-US/docs/Web/API/File)) then with the arrayBuffer you can call

```javascript
const geojson = await shp(buffer);
// or ZIP uses a other codepage   GB18030
const geojson = await shp(buffer,null,"GB18030");

```
If there is only one shp in the zipefile it returns geojson, if there are multiple then it will be an array.  All of the geojson objects have an extra key `fileName` the value of which is the
name of the shapefile minus the extension (I.E. the part of the name that's the same for all of them)

You could also load the arraybuffers seperately:

```javascript
shp.combine([shp.parseShp(shpBuffer, /*optional prj str*/),shp.parseDbf(dbfBuffer)]);
```

