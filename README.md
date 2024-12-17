



# Shapefile.ts
Browser-side shapefile.js only, based on https://github.com/calvinmetcalf/shapefile-js

# Status
<a href="https://npmjs.com/package/shapefile-ts"><img src="https://img.shields.io/npm/v/shapefile-ts.svg" alt="npm package"></a>
<a href="https://github.com/guxin0123/shapefile-ts/actions/workflows/npm-publish.yml"><img src="https://github.com/guxin0123/shapefile-ts/actions/workflows/npm-publish.yml/badge.svg" alt="build status"></a>



# Differ

- No NodeBuffer error. No global error.
- Zip library changed to fflate
- Not using rollup-plugin-node-polyfills
- Convert to typescript file

# Increase

- Automatically decode non-utf8 text according to the browser language (zip and dbf file)
- Custom zip and dbf file encoding


## Usage


    npm install shapefile-ts --save

	import shp from 'shapefile-ts';

    or

    import shp from 'https://unpkg.com/shapefile-ts@latest/lib/index.esm.js'


Or include directly in your webpage from:

	https://unpkg.com/shapefile-ts@latest/lib/shp.umd.js
    

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
const geojson = await shp(buffer,"GB18030");

```
If there is only one shp in the zipefile it returns geojson, if there are multiple then it will be an array.  All of the geojson objects have an extra key `fileName` the value of which is the
name of the shapefile minus the extension (I.E. the part of the name that's the same for all of them)

You could also load the arraybuffers seperately:

```javascript
import {ShpHelper} from 'shapefile-ts'

ShpHelper.combine(ShpHelper.parseShp(shpBuffer, /*optional prj str*/),ShpHelper.parseDbf(dbfBuffer));

// or umd 
shp.ShpHelper.combine(shp.ShpHelper.parseShp(shpBuffer, /*optional prj str*/),shp.ShpHelper.parseDbf(dbfBuffer));

```

You can pass in an object with `shp`, `dbf`, `prj`, and `cpg` properties.

```javascript
const readBlobFile = (blobFile, onSuccess) => {
    const fileReader = new FileReader();
    fileReader.onload = async (e) => {
        onSuccess(e.target.result);
    }
    fileReader.readAsArrayBuffer(blobFile);
}

const object = {}
object.shp = await readBlobFile(shpBlob);
// dbf is optional, but needed if you want attributes
object.dbf = await readBlobFile(dbfBlob);
// prj is optional, but needed if your file is in some projection you don't want it in
object.prj = await readBlobFile(prjBlob);
// cpg is optional but needed if your dbf is in some weird (non utf8) encoding.
object.cpg = await readBlobFile(cpgBlob);

const geojson = await shp(object)
```

## on zipfiles

If there is only one shp in the zipefile it returns geojson, if there are multiple then it will be an array.  All of the geojson objects have an extra key `fileName` the value of which is the
name of the shapefile minus the extension (I.E. the part of the name that's the same for all of them).


## Decode zip files and dbf files that do not contain cpg

1. By passing in the parameters
2. If the parameters are omitted, decode non-utf-8 text by getting the navigator.language parameter

| navigator.language | TextDecoder utfLabel |
|--------------------|----------------------|
| zh-CN              | GB18030              |
| zh-TW              | big5                 |
| ja-JP              | euc-jp               |
| ko-KR              | euc-KR               |
| ru                 | windows-1251         |

