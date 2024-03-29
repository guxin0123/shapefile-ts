import proj4 from 'proj4';
import unzip from './unzip'
import binaryAjax from './binaryajax-browser';
import ParseShpFile from './parseShp';
import parseDbf from 'parsedbf';
import { LRUCache as Cache } from 'lru-cache';
import { Buffer } from 'buffer';

const cache = new Cache({
  max: 20
});

function toBuffer(b: any) {
  if (!b) {
    throw new Error('forgot to pass buffer');
  }
  if (Buffer.isBuffer(b)) {
    return b;
  }
  if (isArrayBuffer(b)) {
    return Buffer.from(b);
  }
  if (isArrayBuffer(b.buffer)) {
    if (b.BYTES_PER_ELEMENT === 1) {
      return Buffer.from(b);
    }
    return Buffer.from(b.buffer);
  }
}

function isArrayBuffer(subject: any) {
  return subject instanceof ArrayBuffer || Object.prototype.toString.call(subject) === '[object ArrayBuffer]';
}
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
  parseZip = async (buffer, whiteList?, encoding?: string) => {
    let key: string;
    buffer = toBuffer(buffer);
    const zip = await unzip(buffer, encoding);
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
      let parsed, dbf;
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


  getZip = async (base, whiteList, encoding?: string) => {
    const a = await binaryAjax(base);
    return this.parseZip(a, whiteList, encoding);
  }
  handleShp = async (base) => {
    const args = await Promise.all([
      binaryAjax(base, 'shp'),
      binaryAjax(base, 'prj')
    ]);
    let prj = false;
    try {
      if (args[1]) {
        prj = proj4(args[1]);
      }
    } catch (e) {
      prj = false;
    }
    return ParseShpFile(args[0], prj);
  };



  handleDbf = async (base) => {
    const [dbf, cpg] = await Promise.all([
      binaryAjax(base, 'dbf'),
      binaryAjax(base, 'cpg')
    ]);
    if (!dbf) {
      return;
    }
    return parseDbf(dbf, cpg);
  };
  checkSuffix = (base, suffix) => {
    const url = new URL(location.href + base);
    return url.pathname.slice(-4).toLowerCase() === suffix;
  };


  getShapefile = async (base, whiteList, encoding?: string) => {
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
  parseShp = function (shp, prj) {
    shp = toBuffer(shp);
    if (Buffer.isBuffer(prj)) {
      prj = prj.toString();
    }
    if (typeof prj === 'string') {
      try {
        prj = proj4(prj);
      } catch (e) {
        prj = false;
      }
    }
    return ParseShpFile(shp, prj);
  };
  parseDbf = function (dbf, cpg) {
    dbf = toBuffer(dbf);
    return parseDbf(dbf, cpg);
  };

}


const shp = function (base, whiteList?, encoding?: string) {
  const sp = new ShpObject();
  if (typeof base === 'string' && cache.has(base)) {
    return Promise.resolve(cache.get(base));
  }
  return sp.getShapefile(base, whiteList, encoding).then(function (resp) {
    if (typeof base === 'string') {
      cache.set(base, resp);
    }
    return resp;
  });
}

export default shp;
