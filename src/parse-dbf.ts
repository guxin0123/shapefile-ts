import { createDecoder } from "./decoder-browser"



function dbfHeader(data: Uint8Array) {
  var dataView = new DataView(data.buffer);
  var out: { [key: string]: any } = {};
  out.lastUpdated = new Date(dataView.getInt8(1) + 1900, dataView.getInt8(2), dataView.getInt8(3));
  out.records = dataView.getInt32(4, true)//data.readUInt32LE(4);
  out.headerLen = dataView.getInt16(8, true);
  out.recLen = dataView.getInt16(10, true);
  return out;
}

function dbfRowHeader(data: Uint8Array, headerLen: number, decoder: Function) {
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
    } else {
      offset += 32;
    }
  }
  return out;
}

function rowFuncs(buffer: Uint8Array, offset: number, len: number, type: string, decoder: Function) {
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

function parseRow(buffer: Uint8Array, offset: number, rowHeaders: Array<any>, decoder: Function) {
  var out = {};
  var i = 0;
  var len = rowHeaders.length;
  var field: any;
  var header: { len: number; dataType: string; name: string | number; };
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

const parseDbf = function (buffer: Uint8Array, encoding: string) {
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
export { parseDbf, dbfHeader }