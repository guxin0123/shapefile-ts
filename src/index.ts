import proj4 from 'proj4';
import { unzip } from './unzip'
import binaryAjax from './binaryajax-fetch';
import ParseShpFile from './parse-shp';
import { parseDbf } from './parse-dbf';


class ShpObject {
  combine = ([shp, dbf]) => {
    const out: { [key: string]: any } = {};
    out.type = 'FeatureCollection';
    out.features = [];
    let i = 0;
    const len = shp.length;
    if (!dbf) {
      dbf = [];
    }
    while (i < len) {
      out.features.push({
        type: 'Feature',
        geometry: shp[i],
        properties: dbf[i] || {}
      });
      i++;
    }
    return out;
  };
  parseZip = async (buffer: Uint8Array | ArrayBuffer, whiteList?: Array<string>, encoding?: string) => {
    let key: string;
    const zip = unzip(buffer, encoding);
    const names: string[] = [];
    whiteList = whiteList || [];
    for (key in zip) {
      if (key.indexOf('__MACOSX') !== -1) {
        continue;
      }
      if (key.slice(-3).toLowerCase() === 'shp') {
        names.push(key.slice(0, -4));
        zip[key.slice(0, -3) + key.slice(-3).toLowerCase()] = zip[key];
      } else if (key.slice(-3).toLowerCase() === 'prj') {
        zip[key.slice(0, -3) + key.slice(-3).toLowerCase()] = proj4(zip[key]);
      } else if (key.slice(-4).toLowerCase() === 'json' || whiteList.indexOf(key.split('.').pop()) > -1) {
        names.push(key.slice(0, -3) + key.slice(-3).toLowerCase());
      } else if (key.slice(-3).toLowerCase() === 'dbf' || key.slice(-3).toLowerCase() === 'cpg') {
        zip[key.slice(0, -3) + key.slice(-3).toLowerCase()] = zip[key];
      }
    }
    if (!names.length) {
      throw new Error('no layers founds');
    }
    const geojson = names.map((name: string) => {
      let parsed: { [x: string]: any; fileName?: any; }, dbf: any[];
      const lastDotIdx = name.lastIndexOf('.');
      if (lastDotIdx > -1 && name.slice(lastDotIdx).indexOf('json') > -1) {
        parsed = JSON.parse(zip[name]);
        parsed.fileName = name.slice(0, lastDotIdx);
      } else if (whiteList.indexOf(name.slice(lastDotIdx + 1)) > -1) {
        parsed = zip[name];
        parsed.fileName = name;
      } else {
        if (zip[name + '.dbf']) {
          dbf = parseDbf(zip[name + '.dbf'], zip[name + '.cpg']);
        }
        parsed = this.combine([ParseShpFile(zip[name + '.shp'], zip[name + '.prj']), dbf]);
        parsed.fileName = name;
      }
      return parsed;
    });
    if (geojson.length === 1) {
      return geojson[0];
    } else {
      return geojson;
    }
  };


  getZip = async (base: string, whiteList: Array<string>, encoding?: string) => {
    const a = await binaryAjax(base) as Uint8Array;
    return this.parseZip(a, whiteList, encoding);
  }
  handleShp = async (base: string) => {
    const args = await Promise.all([
      binaryAjax(base, 'shp'),
      binaryAjax(base, 'prj')
    ]);
    let prj: boolean | proj4.Converter = false;
    try {
      if (args[1]) {
        prj = proj4(args[1] as string);
      }
    } catch (e) {
      prj = false;
    }
    return ParseShpFile(args[0] as Uint8Array, prj);
  };



  handleDbf = async (base: string) => {
    const [dbf, cpg] = await Promise.all([
      binaryAjax(base, 'dbf'),
      binaryAjax(base, 'cpg')
    ]);
    if (!dbf) {
      return;
    }
    return parseDbf(dbf as Uint8Array, cpg as string);
  };
  checkSuffix = (base: string, suffix: string) => {
    const url = new URL(location.href + base);
    return url.pathname.slice(-4).toLowerCase() === suffix;
  };


  getShapefile = async (base: string | Uint8Array | ArrayBuffer, whiteList: Array<string>, encoding?: string) => {
    if (typeof base !== 'string') {
      return this.parseZip(base, whiteList, encoding);
    }
    if (this.checkSuffix(base, '.zip')) {
      return this.getZip(base, whiteList, encoding);
    }
    const results = await Promise.all([
      this.handleShp(base),
      this.handleDbf(base)
    ]);
    return this.combine(results);
  };
  parseShp =  (shp: Uint8Array, prj: string | boolean | proj4.Converter)=>{
    //shp = toBuffer(shp);
    //if (Buffer.isBuffer(prj)) {
    prj = prj.toString();
    // }
    if (typeof prj === 'string') {
      try {
        prj = proj4(prj);
      } catch (e) {
        prj = false;
      }
    }
    return ParseShpFile(shp, prj);
  };
  parseDbf =  (dbf: Uint8Array, cpg: string)=> {
    //dbf = toBuffer(dbf);
    return parseDbf(dbf, cpg);
  };

}


const shp = async function (base: string | Uint8Array | ArrayBuffer, whiteList?: Array<string>, encoding?: string) {
  const sp = new ShpObject();
  const resp = await sp.getShapefile(base, whiteList, encoding);
  return resp;
}

export default shp;
