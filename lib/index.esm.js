import * as fflate from 'fflate';
import proj4 from 'proj4';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const unzip = (buffer, encoding) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        let zipBuffer;
        if (buffer instanceof ArrayBuffer) {
            zipBuffer = new Uint8Array(buffer);
        }
        else {
            zipBuffer = buffer;
        }
        const out = {};
        try {
            const decompressed = fflate.unzipSync(zipBuffer);
            for (const key in decompressed) {
                let fileName = key;
                if (encoding) {
                    const decoder = new TextDecoder(encoding);
                    const u8 = stringToUint8Array(key);
                    fileName = decoder.decode(u8);
                }
                let result;
                if (fileName.slice(-3).toLowerCase() === 'shp' || fileName.slice(-3).toLowerCase() === 'dbf') {
                    result = decompressed[key];
                }
                else {
                    result = fflate.strFromU8(decompressed[key]);
                }
                out[fileName] = result;
            }
        }
        catch (ex) {
            reject('bad zip be rejected');
        }
        resolve(out);
    });
});
function stringToUint8Array(str) {
    const arr = [];
    for (let i = 0, j = str.length; i < j; ++i) {
        arr.push(str.charCodeAt(i));
    }
    return new Uint8Array(arr);
}

class ShpRow {
    constructor(id, len, type, data) {
        this.id = id;
        this.len = len;
        this.type = type;
        this.data = data;
    }
}

class ShpHeader {
    constructor(length, version, shpCode, bbox) {
        this.length = length;
        this.version = version;
        this.shpCode = shpCode;
        this.bbox = bbox;
    }
}

class ShpBase {
    constructor(trans) {
        this.parseCoordinateArray = (data, offset, num) => {
            const out = [];
            let done = 0;
            while (done < num) {
                out.push(this.parseCoordinate(data, offset));
                offset += 16;
                done++;
            }
            return out;
        };
        this.parseArrayGroup = (data, offset, partOffset, num, tot) => {
            const dataView = new DataView(data.buffer);
            const out = [];
            let done = 0;
            let curNum;
            let nextNum = 0;
            let pointNumber;
            while (done < num) {
                done++;
                partOffset += 4;
                curNum = nextNum;
                if (done === num) {
                    nextNum = tot;
                }
                else {
                    nextNum = dataView.getInt32(partOffset, true);
                }
                pointNumber = nextNum - curNum;
                if (!pointNumber) {
                    continue;
                }
                out.push(this.parseCoordinateArray(data, offset, pointNumber));
                offset += (pointNumber << 4);
            }
            return out;
        };
        this.polyFuncs = (out) => {
            if (!out) {
                return out;
            }
            if (out.type === 'LineString') {
                out.type = 'Polygon';
                out.coordinates = [out.coordinates];
                return out;
            }
            else {
                out.coordinates = out.coordinates.reduce(this.polyReduce, []);
                if (out.coordinates.length === 1) {
                    out.type = 'Polygon';
                    out.coordinates = out.coordinates[0];
                    return out;
                }
                else {
                    out.type = 'MultiPolygon';
                    return out;
                }
            }
        };
        this.parseZPointArray = (data, zOffset, num, coordinates) => {
            const dataView = new DataView(data.buffer);
            let i = 0;
            while (i < num) {
                coordinates[i].push(dataView.getFloat64(zOffset, true));
                i++;
                zOffset += 8;
            }
            return coordinates;
        };
        this.parseZArrayGroup = (data, zOffset, num, coordinates) => {
            let i = 0;
            while (i < num) {
                coordinates[i] = this.parseZPointArray(data, zOffset, coordinates[i].length, coordinates[i]);
                zOffset += (coordinates[i].length << 3);
                i++;
            }
            return coordinates;
        };
        this.isClockWise = (array) => {
            let sum = 0;
            let i = 1;
            const len = array.length;
            let prev, cur;
            while (i < len) {
                prev = cur || array[0];
                cur = array[i];
                sum += ((cur[0] - prev[0]) * (cur[1] + prev[1]));
                i++;
            }
            return sum > 0;
        };
        this.polyReduce = (a, b) => {
            if (this.isClockWise(b) || !a.length) {
                a.push([b]);
            }
            else {
                a[a.length - 1].push(b);
            }
            return a;
        };
        this.trans = trans;
    }
    parse(data) {
        console.error("no instantiation");
    }
    parseCoordinate(data, offset) {
        const dataView = new DataView(data.buffer);
        if (this.trans) {
            const args = [dataView.getFloat64(offset, true), dataView.getFloat64(offset + 8, true)];
            return this.trans.inverse(args);
        }
        else {
            return [dataView.getFloat64(offset, true), dataView.getFloat64(offset + 8, true)];
        }
    }
}

class ShpPoint extends ShpBase {
    parse(data) {
        return {
            type: 'Point',
            coordinates: this.parseCoordinate(data, 0)
        };
    }
}

class ShpPolyline extends ShpBase {
    parse(data) {
        const dataView = new DataView(data.buffer);
        const out = {};
        const numParts = dataView.getInt32(32, true);
        if (!numParts) {
            return null;
        }
        const mins = this.parseCoordinate(data, 0);
        const maxs = this.parseCoordinate(data, 16);
        out.bbox = [
            mins[0],
            mins[1],
            maxs[0],
            maxs[1]
        ];
        const num = dataView.getInt32(36, true);
        let offset, partOffset;
        if (numParts === 1) {
            out.type = 'LineString';
            offset = 44;
            out.coordinates = this.parseCoordinateArray(data, offset, num);
        }
        else {
            out.type = 'MultiLineString';
            offset = 40 + (numParts << 2);
            partOffset = 40;
            out.coordinates = this.parseArrayGroup(data, offset, partOffset, numParts, num);
        }
        return out;
    }
}

class ShpPolygon extends ShpPolyline {
    constructor() {
        super(...arguments);
        this.parse = (data) => {
            return this.polyFuncs(super.parse(data));
        };
    }
}

class ShpMultiPoint extends ShpBase {
    parse(data) {
        console.log("ShpMultiPoint");
        const dataView = new DataView(data.buffer);
        const out = {};
        let num = null;
        try {
            num = dataView.getInt32(32, true);
        }
        catch (RangeError) {
            return null;
        }
        const mins = this.parseCoordinate(data, 0);
        const maxs = this.parseCoordinate(data, 16);
        out.bbox = [
            mins[0],
            mins[1],
            maxs[0],
            maxs[1]
        ];
        const offset = 36;
        if (num === 1) {
            out.type = 'Point';
            out.coordinates = this.parseCoordinate(data, offset);
        }
        else {
            out.type = 'MultiPoint';
            out.coordinates = this.parseCoordinateArray(data, offset, num);
        }
        return out;
    }
    ;
}

class ShpZPoint extends ShpPoint {
    constructor() {
        super(...arguments);
        this.parse = (data) => {
            const dataView = new DataView(data.buffer);
            const pointXY = super.parse(data);
            pointXY.coordinates.push(dataView.getFloat64(16, true));
            return pointXY;
        };
    }
}

class ShpZPolyline extends ShpPolyline {
    parse(data) {
        const geoJson = super.parse(data);
        if (!geoJson) {
            return null;
        }
        const num = geoJson.coordinates.length;
        let zOffset;
        if (geoJson.type === 'LineString') {
            zOffset = 60 + (num << 4);
            geoJson.coordinates = this.parseZPointArray(data, zOffset, num, geoJson.coordinates);
            return geoJson;
        }
        else {
            const totalPoints = geoJson.coordinates.reduce(function (a, v) {
                return a + v.length;
            }, 0);
            zOffset = 56 + (totalPoints << 4) + (num << 2);
            geoJson.coordinates = this.parseZArrayGroup(data, zOffset, num, geoJson.coordinates);
            return geoJson;
        }
    }
    ;
}

class ShpZPolygon extends ShpZPolyline {
    parse(data) {
        return this.polyFuncs(super.parse(data));
    }
    ;
}

class ShpZMultiPoint extends ShpMultiPoint {
    parse(data) {
        console.log("ShpZMultiPoint");
        const dataView = new DataView(data.buffer);
        const geoJson = super.parse(data);
        if (!geoJson) {
            return null;
        }
        let num;
        if (geoJson.type === 'Point') {
            geoJson.coordinates.push(dataView.getFloat64(72, true));
            return geoJson;
        }
        else {
            num = geoJson.coordinates.length;
        }
        const zOffset = 52 + (num << 4);
        geoJson.coordinates = this.parseZPointArray(data, zOffset, num, geoJson.coordinates);
        return geoJson;
    }
    ;
}

class ParseShp {
    constructor(buffer, trans) {
        this.rows = [];
        this.shpObjArray = {
            1: ShpPoint,
            3: ShpPolyline,
            5: ShpPolygon,
            8: ShpMultiPoint,
            11: ShpZPoint,
            13: ShpZPolyline,
            15: ShpZPolygon,
            18: ShpZMultiPoint
        };
        this.getShpCode = () => {
            return this.parseHeader().shpCode;
        };
        this.parseHeader = () => {
            const view = this.buffer.slice(0, 100);
            const dataView = new DataView(view.buffer);
            return new ShpHeader(dataView.getInt32(6 << 2) << 1, dataView.getInt32(7 << 2, true), dataView.getInt32(8 << 2, true), [
                dataView.getFloat64(9 << 2, true),
                dataView.getFloat64(11 << 2, true),
                dataView.getFloat64(13 << 2, true),
                dataView.getFloat64(13 << 2, true)
            ]);
        };
        this.getRows = () => {
            let offset = 100;
            const len = this.buffer.byteLength;
            const rows = [];
            let current;
            while (offset < len) {
                current = this.getRow(offset);
                if (!current) {
                    break;
                }
                offset += 8;
                offset += current.len;
                if (current.type) {
                    rows.push(this.shpGeoObject.parse(current.data));
                }
                else {
                    rows.push(null);
                }
            }
            return rows;
        };
        this.getRow = (offset) => {
            const view = this.buffer.slice(offset, offset + 12);
            const dataView = new DataView(view.buffer);
            const len = dataView.getInt32(4) << 1;
            const id = dataView.getInt32(0);
            if (len === 0) {
                return new ShpRow(id, len, 0);
            }
            return new ShpRow(id, len, dataView.getInt32(8, true), this.buffer.slice(offset + 12, offset + len + 8));
        };
        if (buffer instanceof ArrayBuffer) {
            buffer = new Uint8Array(buffer);
        }
        this.buffer = buffer;
        this.headers = this.parseHeader();
        if (this.headers.length < this.buffer.byteLength) {
            this.buffer = this.buffer.slice(0, this.headers.length);
        }
        this.trans = trans;
        this.setShpObjType();
        this.rows = this.getRows();
    }
    setShpObjType() {
        let num = this.headers.shpCode;
        if (num > 20) {
            num -= 20;
        }
        if (!(num in this.shpObjArray)) {
            throw new Error('I don\'t know that shp type');
        }
        this.shpGeoObject = new this.shpObjArray[num]();
    }
    ;
}
const ParseShpFile = (buffer, trans) => {
    return new ParseShp(buffer, trans).rows;
};

function binaryAjax(_url, type) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = combine(_url, type);
        const isOptionalTxt = type === 'prj' || type === 'cpg';
        try {
            const resp = yield fetch(url, { mode: 'cors' });
            if (resp.status > 399) {
                if (!isOptionalTxt) {
                    console.error(url + "--" + resp.statusText);
                }
                return false;
            }
            if (isOptionalTxt) {
                return resp.text();
            }
            return new Uint8Array(yield resp.arrayBuffer());
        }
        catch (e) {
            console.log('ERROR', e, type);
            if (isOptionalTxt || type === 'dbf') {
                return false;
            }
            throw e;
        }
    });
}
const combine = function (base, type) {
    if (!type) {
        return base;
    }
    let resUrl = base.startsWith("http") ? new URL(base) : new URL(base, location.href);
    const shpExt = ["shp", "dbf", "shx", "prj", "sbn"];
    shpExt.map((ext) => {
        if (resUrl.pathname.endsWith("." + ext)) {
            resUrl.pathname = resUrl.pathname.substring(0, resUrl.pathname.length - (ext.length + 1));
        }
    });
    resUrl.pathname = resUrl.pathname + "." + type;
    return resUrl.href;
};

class ShpEntity {
}

function defaultDecoder(data) {
    const decoder = new TextDecoder();
    const out = decoder.decode(data);
    return out.replace(/\0/g, '').trim();
}
const regex = /^(?:ANSI\s)?(\d+)$/m;
function createDecoder(encoding, second) {
    if (!encoding) {
        return defaultDecoder;
    }
    try {
        new TextDecoder(encoding.trim());
    }
    catch (e) {
        const match = regex.exec(encoding);
        if (match && !second) {
            return createDecoder('windows-' + match[1], true);
        }
        else {
            return defaultDecoder;
        }
    }
    return browserDecoder;
    function browserDecoder(buffer) {
        const decoder = new TextDecoder(encoding);
        const out = decoder.decode(buffer, {
            stream: true
        }) + decoder.decode();
        return out.replace(/\0/g, '').trim();
    }
}

class DbfHeader {
}

var _a;
class ParseDbf {
    static readDbfHeader(data) {
        const dataView = new DataView(data.buffer);
        let dbfHeader = new DbfHeader();
        dbfHeader.lastUpdated = new Date(dataView.getInt8(1) + 1900, dataView.getInt8(2), dataView.getInt8(3));
        dbfHeader.records = dataView.getInt32(4, true);
        dbfHeader.headerLen = dataView.getInt16(8, true);
        dbfHeader.recLen = dataView.getInt16(10, true);
        return dbfHeader;
    }
    static readDbfRowHeaders(data, headerLen, decoder) {
        const dataView = new DataView(data.buffer);
        const dbfRowHeaders = [];
        let offset = 32;
        while (offset < headerLen) {
            dbfRowHeaders.push({
                name: decoder(data.slice(offset, offset + 11)),
                dataType: String.fromCharCode(dataView.getUint8(offset + 11)),
                len: dataView.getUint8(offset + 16),
                decimal: dataView.getUint8(offset + 17)
            });
            if (dataView.getUint8(offset + 32) === 13) {
                break;
            }
            else {
                offset += 32;
            }
        }
        return dbfRowHeaders;
    }
    static rowFunc(buffer, offset, len, type, decoder) {
        const data = buffer.slice(offset, offset + len);
        const textData = decoder(data);
        switch (type) {
            case 'N':
            case 'F':
            case 'O':
                return parseFloat(textData);
            case 'D':
                return new Date(parseInt(textData.slice(0, 4)), parseInt(textData.slice(4, 6), 10) - 1, parseInt(textData.slice(6, 8)));
            case 'L':
                return textData.toLowerCase() === 'y' || textData.toLowerCase() === 't';
            default:
                return textData;
        }
    }
    static parseRow(buffer, offset, rowHeaders, decoder) {
        const out = {};
        let i = 0;
        const len = rowHeaders.length;
        let field;
        let header;
        while (i < len) {
            header = rowHeaders[i];
            field = this.rowFunc(buffer, offset, header.len, header.dataType, decoder);
            offset += header.len;
            if (typeof field !== 'undefined') {
                out[header.name] = field;
            }
            i++;
        }
        return out;
    }
}
_a = ParseDbf;
ParseDbf.parseDbf = (buffer, encoding) => {
    if (buffer instanceof ArrayBuffer) {
        buffer = new Uint8Array(buffer);
    }
    const decoder = createDecoder(encoding);
    const header = _a.readDbfHeader(buffer);
    const rowHeaders = _a.readDbfRowHeaders(buffer, header.headerLen - 1, decoder);
    let offset = ((rowHeaders.length + 1) << 5) + 2;
    const recLen = header.recLen;
    let records = header.records;
    const out = [];
    while (records) {
        out.push(_a.parseRow(buffer, offset, rowHeaders, decoder));
        offset += recLen;
        records--;
    }
    return out;
};

class ShpHelper {
    constructor() {
        this.combine = (geometryArray, propertiesArray) => {
            const shpEntity = new ShpEntity();
            shpEntity.type = 'FeatureCollection';
            shpEntity.features = [];
            let i = 0;
            const len = geometryArray.length;
            if (!propertiesArray) {
                propertiesArray = [];
            }
            while (i < len) {
                shpEntity.features.push({
                    type: 'Feature',
                    geometry: geometryArray[i],
                    properties: propertiesArray[i] || {}
                });
                i++;
            }
            return shpEntity;
        };
        this.parseZip = (buffer, whiteList, encoding) => __awaiter(this, void 0, void 0, function* () {
            let key;
            const zip = yield unzip(buffer, encoding);
            const names = [];
            whiteList = whiteList || [];
            for (key in zip) {
                if (key.indexOf('__MACOSX') !== -1) {
                    continue;
                }
                if (key.slice(-4).toLowerCase() === '.shp') {
                    names.push(key.slice(0, -4));
                    zip[key.slice(0, -3) + key.slice(-3).toLowerCase()] = zip[key];
                }
                else if (key.slice(-4).toLowerCase() === '.prj') {
                    zip[key.slice(0, -3) + key.slice(-3).toLowerCase()] = proj4(zip[key]);
                }
                else if (key.slice(-5).toLowerCase() === '.json' || whiteList.indexOf(key.split('.').pop()) > -1) {
                    names.push(key.slice(0, -3) + key.slice(-3).toLowerCase());
                }
                else if (key.slice(-4).toLowerCase() === '.dbf' || key.slice(-4).toLowerCase() === '.cpg') {
                    zip[key.slice(0, -3) + key.slice(-3).toLowerCase()] = zip[key];
                }
            }
            if (!names.length) {
                throw new Error('no layers founds');
            }
            const geojson = names.map((name) => {
                let parsed, dbf;
                const lastDotIdx = name.lastIndexOf('.');
                if (lastDotIdx > -1 && name.slice(lastDotIdx).indexOf('json') > -1) {
                    parsed = JSON.parse(zip[name]);
                    parsed.fileName = name.slice(0, lastDotIdx);
                }
                else if (whiteList.indexOf(name.slice(lastDotIdx + 1)) > -1) {
                    parsed = zip[name];
                    parsed.fileName = name;
                }
                else {
                    if (zip[name + '.dbf']) {
                        dbf = ParseDbf.parseDbf(zip[name + '.dbf'], zip[name + '.cpg']);
                    }
                    parsed = this.combine(ParseShpFile(zip[name + '.shp'], zip[name + '.prj']), dbf);
                    parsed.fileName = name;
                }
                return parsed;
            });
            if (geojson.length === 1) {
                return geojson[0];
            }
            else {
                return geojson;
            }
        });
        this.getZip = (base, whiteList, encoding) => __awaiter(this, void 0, void 0, function* () {
            const a = yield binaryAjax(base);
            return this.parseZip(a, whiteList, encoding);
        });
        this.handleShp = (base) => __awaiter(this, void 0, void 0, function* () {
            const args = yield Promise.all([
                binaryAjax(base, 'shp'),
                binaryAjax(base, 'prj')
            ]);
            let prj = false;
            try {
                if (args[1]) {
                    prj = proj4(args[1]);
                }
            }
            catch (e) {
                prj = false;
            }
            return ParseShpFile(args[0], prj);
        });
        this.handleDbf = (base) => __awaiter(this, void 0, void 0, function* () {
            const [dbf, cpg] = yield Promise.all([
                binaryAjax(base, 'dbf'),
                binaryAjax(base, 'cpg')
            ]);
            if (!dbf) {
                return;
            }
            return ParseDbf.parseDbf(dbf, cpg);
        });
        this.checkSuffix = (base, suffix) => {
            const url = new URL(location.href + base);
            return url.pathname.slice(-4).toLowerCase() === suffix;
        };
        this.getShapefile = (base, whiteList, encoding) => __awaiter(this, void 0, void 0, function* () {
            if (typeof base !== 'string') {
                return this.parseZip(base, whiteList, encoding);
            }
            if (this.checkSuffix(base, '.zip')) {
                return this.getZip(base, whiteList, encoding);
            }
            console.log("handleShp");
            const results = yield Promise.all([
                this.handleShp(base),
                this.handleDbf(base)
            ]);
            return this.combine(results[0], results[1]);
        });
        this.parseShp = (shp, prj) => {
            prj = prj.toString();
            if (typeof prj === 'string') {
                try {
                    prj = proj4(prj);
                }
                catch (e) {
                    prj = false;
                }
            }
            return ParseShpFile(shp, prj);
        };
        this.parseDbf = (dbf, cpg) => {
            return ParseDbf.parseDbf(dbf, cpg);
        };
    }
}

const shp = function (base, whiteList, encoding) {
    return __awaiter(this, void 0, void 0, function* () {
        const sp = new ShpHelper();
        return yield sp.getShapefile(base, whiteList, encoding);
    });
};
shp.ShpHelper = ShpHelper;

export { ShpHelper, shp as default };
