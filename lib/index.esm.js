import proj4 from 'proj4';
import * as fflate from 'fflate';

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

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var unzip = function (buffer, encoding) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2, new Promise(function (resolve, reject) {
                var zipBuffer;
                if (buffer instanceof ArrayBuffer) {
                    zipBuffer = new Uint8Array(buffer);
                }
                else {
                    zipBuffer = buffer;
                }
                var out = {};
                try {
                    var decompressed = fflate.unzipSync(zipBuffer);
                    for (var key in decompressed) {
                        var fileName = key;
                        if (encoding) {
                            var decoder = new TextDecoder(encoding);
                            var u8 = stringToUint8Array(key);
                            fileName = decoder.decode(u8);
                        }
                        var result = void 0;
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
            })];
    });
}); };
function stringToUint8Array(str) {
    var arr = [];
    for (var i = 0, j = str.length; i < j; ++i) {
        arr.push(str.charCodeAt(i));
    }
    var tmpUint8Array = new Uint8Array(arr);
    return tmpUint8Array;
}

var combine = function (base, type) {
    if (!type) {
        return base;
    }
    var resUrl = base.startsWith("http") ? new URL(base) : new URL(base, location.href);
    var shpExt = ["shp", "dbf", "shx", "prj", "sbn"];
    shpExt.map(function (ext) {
        if (resUrl.pathname.endsWith("." + ext)) {
            resUrl.pathname = resUrl.pathname.substring(0, resUrl.pathname.length - (ext.length + 1));
        }
    });
    resUrl.pathname = resUrl.pathname + "." + type;
    return resUrl.href;
};

function binaryAjax(_url, type) {
    return __awaiter(this, void 0, void 0, function () {
        var url, isOptionalTxt, resp, parsed, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = combine(_url, type);
                    isOptionalTxt = type === 'prj' || type === 'cpg';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4, fetch(url, { mode: 'cors' })];
                case 2:
                    resp = _a.sent();
                    if (resp.status > 399) {
                        if (!isOptionalTxt) {
                            console.error(url + "--" + resp.statusText);
                        }
                        return [2, false];
                    }
                    if (isOptionalTxt) {
                        return [2, resp.text()];
                    }
                    return [4, resp.arrayBuffer()];
                case 3:
                    parsed = _a.sent();
                    return [2, new Uint8Array(parsed)];
                case 4:
                    e_1 = _a.sent();
                    console.log('ERROR', e_1, type);
                    if (isOptionalTxt || type === 'dbf') {
                        return [2, false];
                    }
                    throw e_1;
                case 5: return [2];
            }
        });
    });
}

var ParseShp = (function () {
    function ParseShp(buffer, trans) {
        var _this = this;
        this.rows = [];
        this.isClockWise = function (array) {
            var sum = 0;
            var i = 1;
            var len = array.length;
            var prev, cur;
            while (i < len) {
                prev = cur || array[0];
                cur = array[i];
                sum += ((cur[0] - prev[0]) * (cur[1] + prev[1]));
                i++;
            }
            return sum > 0;
        };
        this.polyReduce = function (a, b) {
            if (_this.isClockWise(b) || !a.length) {
                a.push([b]);
            }
            else {
                a[a.length - 1].push(b);
            }
            return a;
        };
        this.makeParseCoord = function (trans) {
            if (trans) {
                return function (data, offset) {
                    var dataView = new DataView(data.buffer);
                    var args = [dataView.getFloat64(offset, true), dataView.getFloat64(offset + 8, true)];
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
        this.parsePoint = function (data) {
            return {
                type: 'Point',
                coordinates: _this.parseCoord(data, 0)
            };
        };
        this.parseZPoint = function (data) {
            var dataView = new DataView(data.buffer);
            var pointXY = _this.parsePoint(data);
            pointXY.coordinates.push(dataView.getFloat64(16, true));
            return pointXY;
        };
        this.parsePointArray = function (data, offset, num) {
            var out = [];
            var done = 0;
            while (done < num) {
                out.push(_this.parseCoord(data, offset));
                offset += 16;
                done++;
            }
            return out;
        };
        this.parseZPointArray = function (data, zOffset, num, coordinates) {
            var dataView = new DataView(data.buffer);
            var i = 0;
            while (i < num) {
                coordinates[i].push(dataView.getFloat64(zOffset, true));
                i++;
                zOffset += 8;
            }
            return coordinates;
        };
        this.parseArrayGroup = function (data, offset, partOffset, num, tot) {
            var dataView = new DataView(data.buffer);
            var out = [];
            var done = 0;
            var curNum;
            var nextNum = 0;
            var pointNumber;
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
                out.push(_this.parsePointArray(data, offset, pointNumber));
                offset += (pointNumber << 4);
            }
            return out;
        };
        this.parseZArrayGroup = function (data, zOffset, num, coordinates) {
            var i = 0;
            while (i < num) {
                coordinates[i] = _this.parseZPointArray(data, zOffset, coordinates[i].length, coordinates[i]);
                zOffset += (coordinates[i].length << 3);
                i++;
            }
            return coordinates;
        };
        this.parseMultiPoint = function (data) {
            var dataView = new DataView(data.buffer);
            var out = {};
            var num = null;
            try {
                num = dataView.getInt32(32, true);
            }
            catch (RangeError) {
                return null;
            }
            var mins = _this.parseCoord(data, 0);
            var maxs = _this.parseCoord(data, 16);
            out.bbox = [
                mins[0],
                mins[1],
                maxs[0],
                maxs[1]
            ];
            var offset = 36;
            if (num === 1) {
                out.type = 'Point';
                out.coordinates = _this.parseCoord(data, offset);
            }
            else {
                out.type = 'MultiPoint';
                out.coordinates = _this.parsePointArray(data, offset, num);
            }
            return out;
        };
        this.parseZMultiPoint = function (data) {
            var dataView = new DataView(data.buffer);
            var geoJson = _this.parseMultiPoint(data);
            if (!geoJson) {
                return null;
            }
            var num;
            if (geoJson.type === 'Point') {
                geoJson.coordinates.push(dataView.getFloat64(72, true));
                return geoJson;
            }
            else {
                num = geoJson.coordinates.length;
            }
            var zOffset = 52 + (num << 4);
            geoJson.coordinates = _this.parseZPointArray(data, zOffset, num, geoJson.coordinates);
            return geoJson;
        };
        this.parsePolyline = function (data) {
            var dataView = new DataView(data.buffer);
            var out = {};
            var numParts = dataView.getInt32(32, true);
            if (!numParts) {
                return null;
            }
            var mins = _this.parseCoord(data, 0);
            var maxs = _this.parseCoord(data, 16);
            out.bbox = [
                mins[0],
                mins[1],
                maxs[0],
                maxs[1]
            ];
            var num = dataView.getInt32(36, true);
            var offset, partOffset;
            if (numParts === 1) {
                out.type = 'LineString';
                offset = 44;
                out.coordinates = _this.parsePointArray(data, offset, num);
            }
            else {
                out.type = 'MultiLineString';
                offset = 40 + (numParts << 2);
                partOffset = 40;
                out.coordinates = _this.parseArrayGroup(data, offset, partOffset, numParts, num);
            }
            return out;
        };
        this.parseZPolyline = function (data) {
            var geoJson = _this.parsePolyline(data);
            if (!geoJson) {
                return null;
            }
            var num = geoJson.coordinates.length;
            var zOffset;
            if (geoJson.type === 'LineString') {
                zOffset = 60 + (num << 4);
                geoJson.coordinates = _this.parseZPointArray(data, zOffset, num, geoJson.coordinates);
                return geoJson;
            }
            else {
                var totalPoints = geoJson.coordinates.reduce(function (a, v) {
                    return a + v.length;
                }, 0);
                zOffset = 56 + (totalPoints << 4) + (num << 2);
                geoJson.coordinates = _this.parseZArrayGroup(data, zOffset, num, geoJson.coordinates);
                return geoJson;
            }
        };
        this.polyFuncs = function (out) {
            if (!out) {
                return out;
            }
            if (out.type === 'LineString') {
                out.type = 'Polygon';
                out.coordinates = [out.coordinates];
                return out;
            }
            else {
                out.coordinates = out.coordinates.reduce(_this.polyReduce, []);
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
        this.parsePolygon = function (data) {
            return _this.polyFuncs(_this.parsePolyline(data));
        };
        this.parseZPolygon = function (data) {
            return _this.polyFuncs(_this.parseZPolyline(data));
        };
        this.shpFuncObj = {
            1: this.parsePoint,
            3: this.parsePolyline,
            5: this.parsePolygon,
            8: this.parseMultiPoint,
            11: this.parseZPoint,
            13: this.parseZPolyline,
            15: this.parseZPolygon,
            18: this.parseZMultiPoint
        };
        this.getShpCode = function () {
            return _this.parseHeader().shpCode;
        };
        this.parseHeader = function () {
            var view = _this.buffer.slice(0, 100);
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
        this.getRows = function () {
            var offset = 100;
            var len = _this.buffer.byteLength;
            var out = [];
            var current;
            while (offset < len) {
                current = _this.getRow(offset);
                if (!current) {
                    break;
                }
                offset += 8;
                offset += current.len;
                if (current.type) {
                    out.push(_this.parseFunc(current.data));
                }
                else {
                    out.push(null);
                }
            }
            return out;
        };
        this.getRow = function (offset) {
            var view = _this.buffer.slice(offset, offset + 12);
            var dataView = new DataView(view.buffer);
            var len = dataView.getInt32(4) << 1;
            var id = dataView.getInt32(0);
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
                data: _this.buffer.slice(offset + 12, offset + len + 8),
                type: dataView.getInt32(8, true)
            };
        };
        this.buffer = buffer;
        this.headers = this.parseHeader();
        if (this.headers.length < this.buffer.byteLength) {
            this.buffer = this.buffer.slice(0, this.headers.length);
        }
        this.shpFuncs(trans);
        this.rows = this.getRows();
    }
    ParseShp.prototype.shpFuncs = function (tran) {
        var num = this.headers.shpCode;
        if (num > 20) {
            num -= 20;
        }
        if (!(num in this.shpFuncObj)) {
            throw new Error('I don\'t know that shp type');
        }
        this.parseFunc = this.shpFuncObj[num];
        this.parseCoord = this.makeParseCoord(tran);
    };
    return ParseShp;
}());
var ParseShpFile = function (buffer, trans) {
    return new ParseShp(buffer, trans).rows;
};

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
var parseDbf = function (buffer, encoding) {
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

var ShpObject = (function () {
    function ShpObject() {
        var _this = this;
        this.combine = function (_a) {
            var shp = _a[0], dbf = _a[1];
            var out = {};
            out.type = 'FeatureCollection';
            out.features = [];
            var i = 0;
            var len = shp.length;
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
        this.parseZip = function (buffer, whiteList, encoding) { return __awaiter(_this, void 0, void 0, function () {
            var key, zip, names, geojson;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, unzip(buffer, encoding)];
                    case 1:
                        zip = _a.sent();
                        names = [];
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
                        geojson = names.map(function (name) {
                            var parsed, dbf;
                            var lastDotIdx = name.lastIndexOf('.');
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
                                parsed = _this.combine([ParseShpFile(zip[name + '.shp'], zip[name + '.prj']), dbf]);
                                parsed.fileName = name;
                            }
                            return parsed;
                        });
                        if (geojson.length === 1) {
                            return [2, geojson[0]];
                        }
                        else {
                            return [2, geojson];
                        }
                }
            });
        }); };
        this.getZip = function (base, whiteList, encoding) { return __awaiter(_this, void 0, void 0, function () {
            var a;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, binaryAjax(base)];
                    case 1:
                        a = _a.sent();
                        return [2, this.parseZip(a, whiteList, encoding)];
                }
            });
        }); };
        this.handleShp = function (base) { return __awaiter(_this, void 0, void 0, function () {
            var args, prj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, Promise.all([
                            binaryAjax(base, 'shp'),
                            binaryAjax(base, 'prj')
                        ])];
                    case 1:
                        args = _a.sent();
                        prj = false;
                        try {
                            if (args[1]) {
                                prj = proj4(args[1]);
                            }
                        }
                        catch (e) {
                            prj = false;
                        }
                        return [2, ParseShpFile(args[0], prj)];
                }
            });
        }); };
        this.handleDbf = function (base) { return __awaiter(_this, void 0, void 0, function () {
            var _a, dbf, cpg;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4, Promise.all([
                            binaryAjax(base, 'dbf'),
                            binaryAjax(base, 'cpg')
                        ])];
                    case 1:
                        _a = _b.sent(), dbf = _a[0], cpg = _a[1];
                        if (!dbf) {
                            return [2];
                        }
                        return [2, parseDbf(dbf, cpg)];
                }
            });
        }); };
        this.checkSuffix = function (base, suffix) {
            var url = new URL(location.href + base);
            return url.pathname.slice(-4).toLowerCase() === suffix;
        };
        this.getShapefile = function (base, whiteList, encoding) { return __awaiter(_this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof base !== 'string') {
                            return [2, this.parseZip(base, whiteList, encoding)];
                        }
                        if (this.checkSuffix(base, '.zip')) {
                            return [2, this.getZip(base, whiteList, encoding)];
                        }
                        return [4, Promise.all([
                                this.handleShp(base),
                                this.handleDbf(base)
                            ])];
                    case 1:
                        results = _a.sent();
                        return [2, this.combine(results)];
                }
            });
        }); };
        this.parseShp = function (shp, prj) {
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
        this.parseDbf = function (dbf, cpg) {
            return parseDbf(dbf, cpg);
        };
    }
    return ShpObject;
}());
var shp = function (base, whiteList, encoding) {
    return __awaiter(this, void 0, void 0, function () {
        var sp, resp;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sp = new ShpObject();
                    return [4, sp.getShapefile(base, whiteList, encoding)];
                case 1:
                    resp = _a.sent();
                    return [2, resp];
            }
        });
    });
};

export { shp as default };
