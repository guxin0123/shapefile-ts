import proj4 from 'proj4';
import * as fflate from 'fflate';

const unzip = (buffer, encoding) => {
    let zipBuffer;
    if (buffer instanceof ArrayBuffer) {
        zipBuffer = new Uint8Array(buffer);
    }
    else {
        zipBuffer = buffer;
    }
    const out = {};
    const decompressed = fflate.unzipSync(zipBuffer);
    for (const key in decompressed) {
        let fileName = key;
        if (encoding) {
            var decoder = new TextDecoder(encoding);
            var u8 = stringToUint8Array(key);
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
    return out;
};
function stringToUint8Array(str) {
    var arr = [];
    for (var i = 0, j = str.length; i < j; ++i) {
        arr.push(str.charCodeAt(i));
    }
    var tmpUint8Array = new Uint8Array(arr);
    return tmpUint8Array;
}

const combine = function (base, type) {
    if (!type) {
        return base;
    }
    const url = new URL(location.href + base);
    url.pathname = `${url.pathname}.${type}`;
    return url.href;
};

async function binaryAjax(_url, type) {
    const url = combine(_url, type);
    const isOptionalTxt = type === 'prj' || type === 'cpg';
    try {
        const resp = await fetch(url);
        if (resp.status > 399) {
            throw new Error(resp.statusText);
        }
        if (isOptionalTxt) {
            return resp.text();
        }
        const parsed = await resp.arrayBuffer();
        return new Uint8Array(parsed);
    }
    catch (e) {
        console.log('ERROR', e, type);
        if (isOptionalTxt || type === 'dbf') {
            return false;
        }
        throw e;
    }
}

class ParseShp {
    parseFunc;
    buffer;
    rows = [];
    constructor(buffer, trans) {
        this.buffer = buffer;
        this.headers = this.parseHeader();
        if (this.headers.length < this.buffer.byteLength) {
            this.buffer = this.buffer.slice(0, this.headers.length);
        }
        this.shpFuncs(trans);
        this.rows = this.getRows();
    }
    headers;
    parseCoord;
    shpFuncObj = {
        1: 'parsePoint',
        3: 'parsePolyline',
        5: 'parsePolygon',
        8: 'parseMultiPoint',
        11: 'parseZPoint',
        13: 'parseZPolyline',
        15: 'parseZPolygon',
        18: 'parseZMultiPoint'
    };
    isClockWise = (array) => {
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
    polyReduce = (a, b) => {
        if (this.isClockWise(b) || !a.length) {
            a.push([b]);
        }
        else {
            a[a.length - 1].push(b);
        }
        return a;
    };
    makeParseCoord = (trans) => {
        if (trans) {
            return function (data, offset) {
                var dataView = new DataView(data.buffer);
                const args = [dataView.getFloat64(offset, true), dataView.getFloat64(offset + 8, true)];
                return trans.inverse(args);
            };
        }
        else {
            return function (data, offset) {
                var dataView = new DataView(data.buffer);
                return [dataView.getFloat64(offset, true), dataView.getFloat64(offset + 8, true)];
            };
        }
    };
    parsePoint = (data) => {
        return {
            type: 'Point',
            coordinates: this.parseCoord(data, 0)
        };
    };
    shpFuncs(tran) {
        let num = this.headers.shpCode;
        if (num > 20) {
            num -= 20;
        }
        if (!(num in this.shpFuncObj)) {
            throw new Error('I don\'t know that shp type');
        }
        this.parseFunc = this[this.shpFuncObj[num]];
        this.parseCoord = this.makeParseCoord(tran);
    }
    ;
    parseZPoint = (data) => {
        var dataView = new DataView(data.buffer);
        const pointXY = this.parsePoint(data);
        pointXY.coordinates.push(dataView.getFloat64(16, true));
        return pointXY;
    };
    parsePointArray = (data, offset, num) => {
        const out = [];
        let done = 0;
        while (done < num) {
            out.push(this.parseCoord(data, offset));
            offset += 16;
            done++;
        }
        return out;
    };
    parseZPointArray = (data, zOffset, num, coordinates) => {
        var dataView = new DataView(data.buffer);
        let i = 0;
        while (i < num) {
            coordinates[i].push(dataView.getFloat64(zOffset, true));
            i++;
            zOffset += 8;
        }
        return coordinates;
    };
    parseArrayGroup = (data, offset, partOffset, num, tot) => {
        var dataView = new DataView(data.buffer);
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
            out.push(this.parsePointArray(data, offset, pointNumber));
            offset += (pointNumber << 4);
        }
        return out;
    };
    parseZArrayGroup = (data, zOffset, num, coordinates) => {
        let i = 0;
        while (i < num) {
            coordinates[i] = this.parseZPointArray(data, zOffset, coordinates[i].length, coordinates[i]);
            zOffset += (coordinates[i].length << 3);
            i++;
        }
        return coordinates;
    };
    parseMultiPoint = (data) => {
        var dataView = new DataView(data.buffer);
        const out = {};
        let num = null;
        try {
            num = dataView.getInt32(32, true);
        }
        catch (RangeError) {
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
        }
        else {
            out.type = 'MultiPoint';
            out.coordinates = this.parsePointArray(data, offset, num);
        }
        return out;
    };
    parseZMultiPoint = (data) => {
        var dataView = new DataView(data.buffer);
        const geoJson = this.parseMultiPoint(data);
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
    };
    parsePolyline = (data) => {
        var dataView = new DataView(data.buffer);
        const out = {};
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
        let offset, partOffset;
        if (numParts === 1) {
            out.type = 'LineString';
            offset = 44;
            out.coordinates = this.parsePointArray(data, offset, num);
        }
        else {
            out.type = 'MultiLineString';
            offset = 40 + (numParts << 2);
            partOffset = 40;
            out.coordinates = this.parseArrayGroup(data, offset, partOffset, numParts, num);
        }
        return out;
    };
    parseZPolyline = (data) => {
        const geoJson = this.parsePolyline(data);
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
    };
    polyFuncs = (out) => {
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
    parsePolygon = (data) => {
        return this.polyFuncs(this.parsePolyline(data));
    };
    parseZPolygon = (data) => {
        return this.polyFuncs(this.parseZPolyline(data));
    };
    getShpCode = () => {
        return this.parseHeader().shpCode;
    };
    parseHeader = () => {
        const view = this.buffer.slice(0, 100);
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
        const out = [];
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
            }
            else {
                out.push(null);
            }
        }
        return out;
    };
    getRow = (offset) => {
        const view = this.buffer.slice(offset, offset + 12);
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
function ParseShpFile(buffer, trans) {
    return new ParseShp(buffer, trans).rows;
}

function defaultDecoder(data) {
    var decoder = new TextDecoder();
    var out = decoder.decode(data);
    return out.replace(/\0/g, '').trim();
}
var regex = /^(?:ANSI\s)?(\d+)$/m;
function createDecoder(encoding, second) {
    if (!encoding) {
        return defaultDecoder;
    }
    try {
        new TextDecoder(encoding.trim());
    }
    catch (e) {
        var match = regex.exec(encoding);
        if (match && !second) {
            return createDecoder('windows-' + match[1], true);
        }
        else {
            return defaultDecoder;
        }
    }
    return browserDecoder;
    function browserDecoder(buffer) {
        var decoder = new TextDecoder(encoding);
        var out = decoder.decode(buffer, {
            stream: true
        }) + decoder.decode();
        return out.replace(/\0/g, '').trim();
    }
}

function dbfHeader(data) {
    var dataView = new DataView(data.buffer);
    var out = {};
    out.lastUpdated = new Date(dataView.getInt8(1) + 1900, dataView.getInt8(2), dataView.getInt8(3));
    out.records = dataView.getInt32(4, true);
    out.headerLen = dataView.getInt16(8, true);
    out.recLen = dataView.getInt16(10, true);
    return out;
}
function dbfRowHeader(data, headerLen, decoder) {
    var dataView = new DataView(data.buffer);
    var out = [];
    var offset = 32;
    while (offset < headerLen) {
        out.push({
            name: decoder(data.slice(offset, offset + 11)),
            dataType: String.fromCharCode(dataView.getInt8(offset + 11)),
            len: dataView.getInt8(offset + 16),
            decimal: dataView.getInt8(offset + 17)
        });
        if (dataView.getInt8(offset + 32) === 13) {
            break;
        }
        else {
            offset += 32;
        }
    }
    return out;
}
function rowFuncs(buffer, offset, len, type, decoder) {
    var data = buffer.slice(offset, offset + len);
    var textData = decoder(data);
    switch (type) {
        case 'N':
        case 'F':
        case 'O':
            return parseFloat(textData);
        case 'D':
            return new Date(textData.slice(0, 4), parseInt(textData.slice(4, 6), 10) - 1, textData.slice(6, 8));
        case 'L':
            return textData.toLowerCase() === 'y' || textData.toLowerCase() === 't';
        default:
            return textData;
    }
}
function parseRow(buffer, offset, rowHeaders, decoder) {
    var out = {};
    var i = 0;
    var len = rowHeaders.length;
    var field;
    var header;
    while (i < len) {
        header = rowHeaders[i];
        field = rowFuncs(buffer, offset, header.len, header.dataType, decoder);
        offset += header.len;
        if (typeof field !== 'undefined') {
            out[header.name] = field;
        }
        i++;
    }
    return out;
}
const parseDbf = function (buffer, encoding) {
    var decoder = createDecoder(encoding);
    var header = dbfHeader(buffer);
    var rowHeaders = dbfRowHeader(buffer, header.headerLen - 1, decoder);
    var offset = ((rowHeaders.length + 1) << 5) + 2;
    var recLen = header.recLen;
    var records = header.records;
    var out = [];
    while (records) {
        out.push(parseRow(buffer, offset, rowHeaders, decoder));
        offset += recLen;
        records--;
    }
    return out;
};

class ShpObject {
    combine = ([shp, dbf]) => {
        const out = {};
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
    parseZip = async (buffer, whiteList, encoding) => {
        let key;
        const zip = unzip(buffer, encoding);
        const names = [];
        whiteList = whiteList || [];
        for (key in zip) {
            if (key.indexOf('__MACOSX') !== -1) {
                continue;
            }
            if (key.slice(-3).toLowerCase() === 'shp') {
                names.push(key.slice(0, -4));
                zip[key.slice(0, -3) + key.slice(-3).toLowerCase()] = zip[key];
            }
            else if (key.slice(-3).toLowerCase() === 'prj') {
                zip[key.slice(0, -3) + key.slice(-3).toLowerCase()] = proj4(zip[key]);
            }
            else if (key.slice(-4).toLowerCase() === 'json' || whiteList.indexOf(key.split('.').pop()) > -1) {
                names.push(key.slice(0, -3) + key.slice(-3).toLowerCase());
            }
            else if (key.slice(-3).toLowerCase() === 'dbf' || key.slice(-3).toLowerCase() === 'cpg') {
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
                    dbf = parseDbf(zip[name + '.dbf'], zip[name + '.cpg']);
                }
                parsed = this.combine([ParseShpFile(zip[name + '.shp'], zip[name + '.prj']), dbf]);
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
    };
    getZip = async (base, whiteList, encoding) => {
        const a = await binaryAjax(base);
        return this.parseZip(a, whiteList, encoding);
    };
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
        }
        catch (e) {
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
    getShapefile = async (base, whiteList, encoding) => {
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
    parseDbf = function (dbf, cpg) {
        return parseDbf(dbf, cpg);
    };
}
const shp = async function (base, whiteList, encoding) {
    const sp = new ShpObject();
    const resp = await sp.getShapefile(base, whiteList, encoding);
    return resp;
};

export { shp as default };
