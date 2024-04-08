import proj4 from "proj4";

class ParseShp {
  parseFunc: Function;
  buffer: Uint8Array;
  rows: any[] = [];


  constructor(buffer: Uint8Array, trans: string | boolean | proj4.Converter) {
    this.buffer = buffer;
    this.headers = this.parseHeader();
    if (this.headers.length < this.buffer.byteLength) {
      this.buffer = this.buffer.slice(0, this.headers.length);
    }
    this.shpFuncs(trans);
    this.rows = this.getRows();
  }

  headers: any; parseCoord: any;



  isClockWise = (array: string | any[]) => {
    let sum = 0;
    let i = 1;
    const len = array.length;
    let prev: any[], cur: any[];
    while (i < len) {
      prev = cur || array[0];
      cur = array[i];
      sum += ((cur[0] - prev[0]) * (cur[1] + prev[1]));
      i++;
    }
    return sum > 0;
  }

  polyReduce = (a: any[][], b: any) => {
    if (this.isClockWise(b) || !a.length) {
      a.push([b]);
    } else {
      a[a.length - 1].push(b);
    }
    return a;
  }

  makeParseCoord = (trans: string | boolean | proj4.Converter) => {
    if (trans) {
      return function (data: Uint8Array, offset: number) {
        var dataView = new DataView(data.buffer);
        const args = [dataView.getFloat64(offset, true), dataView.getFloat64(offset + 8, true)];
        return (trans as proj4.Converter).inverse(args);
      };
    } else {
      return function (data: Uint8Array, offset: number) {
        var dataView = new DataView(data.buffer);
        return [dataView.getFloat64(offset, true), dataView.getFloat64(offset + 8, true)];
      };
    }
  }

  parsePoint = (data: Uint8Array) => {
    return {
      type: 'Point',
      coordinates: this.parseCoord(data, 0)
    };
  };

  shpFuncs(tran: string | boolean | proj4.Converter) {
    let num = this.headers.shpCode;
    if (num > 20) {
      num -= 20;
    }
    if (!(num in this.shpFuncObj)) {
      throw new Error('I don\'t know that shp type');
    }
    this.parseFunc = this.shpFuncObj[num];
    this.parseCoord = this.makeParseCoord(tran);
  };

  parseZPoint = (data: Uint8Array) => {
    var dataView = new DataView(data.buffer);
    const pointXY = this.parsePoint(data);
    pointXY.coordinates.push(dataView.getFloat64(16, true));
    return pointXY;
  };
  parsePointArray = (data: Uint8Array, offset: number, num: number) => {
    const out: any[] = [];
    let done = 0;
    while (done < num) {
      out.push(this.parseCoord(data, offset));
      offset += 16;
      done++;
    }
    return out;
  };
  parseZPointArray = (data: Uint8Array, zOffset: number, num: number, coordinates: string | any[]) => {
    var dataView = new DataView(data.buffer);
    let i = 0;
    while (i < num) {
      coordinates[i].push(dataView.getFloat64(zOffset, true));
      i++;
      zOffset += 8;
    }
    return coordinates;
  };

  parseArrayGroup = (data: Uint8Array, offset: number, partOffset: number, num: number, tot: number) => {
    var dataView = new DataView(data.buffer);
    const out: any[] = [];
    let done = 0;
    let curNum; let nextNum = 0;
    let pointNumber;
    while (done < num) {
      done++;
      partOffset += 4;
      curNum = nextNum;
      if (done === num) {
        nextNum = tot;
      } else {
        nextNum = dataView.getInt32(partOffset, true);
      }
      pointNumber = nextNum - curNum;
      if (!pointNumber) {
        continue;
      }
      out.push(this.parsePointArray(data, offset, pointNumber));
      offset += (pointNumber << 4);
    }
    return out;
  };
  parseZArrayGroup = (data: Uint8Array, zOffset: number, num: number, coordinates: (string | any[])[]) => {
    let i = 0;
    while (i < num) {
      coordinates[i] = this.parseZPointArray(data, zOffset, coordinates[i].length, coordinates[i]);
      zOffset += (coordinates[i].length << 3);
      i++;
    }
    return coordinates;
  };
  parseMultiPoint = (data: Uint8Array) => {
    var dataView = new DataView(data.buffer);
    const out: { [key: string]: any } = {};
    let num = null;
    try {
      num = dataView.getInt32(32, true);
    } catch (RangeError) {
      return null;
    }

    const mins = this.parseCoord(data, 0);
    const maxs = this.parseCoord(data, 16);
    out.bbox = [
      mins[0],
      mins[1],
      maxs[0],
      maxs[1]
    ];
    const offset = 36;
    if (num === 1) {
      out.type = 'Point';
      out.coordinates = this.parseCoord(data, offset);
    } else {
      out.type = 'MultiPoint';
      out.coordinates = this.parsePointArray(data, offset, num);
    }
    return out;
  };
  parseZMultiPoint = (data: Uint8Array) => {
    var dataView = new DataView(data.buffer);
    const geoJson = this.parseMultiPoint(data);
    if (!geoJson) {
      return null;
    }
    let num: number;
    if (geoJson.type === 'Point') {
      geoJson.coordinates.push(dataView.getFloat64(72, true));
      return geoJson;
    } else {
      num = geoJson.coordinates.length;
    }
    const zOffset = 52 + (num << 4);
    geoJson.coordinates = this.parseZPointArray(data, zOffset, num, geoJson.coordinates);
    return geoJson;
  };
  parsePolyline = (data: Uint8Array) => {
    var dataView = new DataView(data.buffer);
    const out: { [key: string]: any } = {};
    const numParts = dataView.getInt32(32, true);
    if (!numParts) {
      return null;
    }
    const mins = this.parseCoord(data, 0);
    const maxs = this.parseCoord(data, 16);
    out.bbox = [
      mins[0],
      mins[1],
      maxs[0],
      maxs[1]
    ];
    const num = dataView.getInt32(36, true);
    let offset: number, partOffset: number;
    if (numParts === 1) {
      out.type = 'LineString';
      offset = 44;
      out.coordinates = this.parsePointArray(data, offset, num);
    } else {
      out.type = 'MultiLineString';
      offset = 40 + (numParts << 2);
      partOffset = 40;
      out.coordinates = this.parseArrayGroup(data, offset, partOffset, numParts, num);
    }
    return out;
  };
  parseZPolyline = (data: Uint8Array) => {
    const geoJson = this.parsePolyline(data);
    if (!geoJson) {
      return null;
    }
    const num = geoJson.coordinates.length;
    let zOffset: number;
    if (geoJson.type === 'LineString') {
      zOffset = 60 + (num << 4);
      geoJson.coordinates = this.parseZPointArray(data, zOffset, num, geoJson.coordinates);
      return geoJson;
    } else {
      const totalPoints = geoJson.coordinates.reduce(function (a, v) {
        return a + v.length;
      }, 0);
      zOffset = 56 + (totalPoints << 4) + (num << 2);
      geoJson.coordinates = this.parseZArrayGroup(data, zOffset, num, geoJson.coordinates);
      return geoJson;
    }
  };



  polyFuncs = (out: { [x: string]: any; type?: any; coordinates?: any; }) => {
    if (!out) {
      return out;
    }
    if (out.type === 'LineString') {
      out.type = 'Polygon';
      out.coordinates = [out.coordinates];
      return out;
    } else {
      out.coordinates = out.coordinates.reduce(this.polyReduce, []);
      if (out.coordinates.length === 1) {
        out.type = 'Polygon';
        out.coordinates = out.coordinates[0];
        return out;
      } else {
        out.type = 'MultiPolygon';
        return out;
      }
    }
  };
  parsePolygon = (data: Uint8Array) => {
    return this.polyFuncs(this.parsePolyline(data));
  };
  parseZPolygon = (data: Uint8Array) => {
    return this.polyFuncs(this.parseZPolyline(data));
  };

  shpFuncObj = {
    1: this.parsePoint,
    3: this.parsePolyline,
    5: this.parsePolygon,
    8: this.parseMultiPoint,
    11: this.parseZPoint,
    13: this.parseZPolyline,
    15: this.parseZPolygon,
    18: this.parseZMultiPoint
  };

  getShpCode = () => {
    return this.parseHeader().shpCode;
  };
  parseHeader = () => {
    const view: Uint8Array = this.buffer.slice(0, 100);
    var dataView = new DataView(view.buffer);
    return {
      length: dataView.getInt32(6 << 2) << 1,
      version: dataView.getInt32(7 << 2, true),
      shpCode: dataView.getInt32(8 << 2, true),
      bbox: [
        dataView.getFloat64(9 << 2, true),
        dataView.getFloat64(11 << 2, true),
        dataView.getFloat64(13 << 2, true),
        dataView.getFloat64(13 << 2, true)
      ]
    };
  };
  getRows = () => {
    let offset = 100;
    const len = this.buffer.byteLength;
    const out: any[] = [];
    let current;
    while (offset < len) {
      current = this.getRow(offset);
      if (!current) {
        break;
      }
      offset += 8;
      offset += current.len;
      if (current.type) {
        out.push(this.parseFunc(current.data));
      } else {
        out.push(null);
      }
    }
    return out;
  };
  getRow = (offset: number) => {
    const view: Uint8Array = this.buffer.slice(offset, offset + 12);
    var dataView = new DataView(view.buffer);
    const len = dataView.getInt32(4) << 1;
    const id = dataView.getInt32(0);
    if (len === 0) {
      return {
        id: id,
        len: len,
        type: 0
      };
    }
    return {
      id: id,
      len: len,
      data: this.buffer.slice(offset + 12, offset + len + 8),
      type: dataView.getInt32(8, true)
    };
  };

}

const ParseShpFile = (buffer: Uint8Array, trans: string | boolean | proj4.Converter) => {
  return new ParseShp(buffer, trans).rows;
};
export default ParseShpFile;