import * as fflate from 'fflate';

const unzip = async (buffer: ArrayBuffer | Uint8Array, encoding?: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    let zipBuffer: Uint8Array;
    if (buffer instanceof ArrayBuffer) {
      zipBuffer = new Uint8Array(buffer);
    } else {
      zipBuffer = buffer;
    }
    const out = {};
    try {
      const decompressed: { [key: string]: any } = fflate.unzipSync(zipBuffer);
      for (const key in decompressed) {
        let fileName = key;
        if (encoding) {
          var decoder = new TextDecoder(encoding);
          var u8 = stringToUint8Array(key);
          fileName = decoder.decode(u8);
        }
        let result: string;
        if (fileName.slice(-3).toLowerCase() === 'shp' || fileName.slice(-3).toLowerCase() === 'dbf') {
          result = decompressed[key];
        } else {
          result = fflate.strFromU8(decompressed[key]);
        }
        out[fileName] = result;
      }

    } catch (ex) {
      reject('bad zip be rejected');
    }
    //return out;
    resolve(out);
  })
};

function stringToUint8Array(str: string) {
  var arr = [];
  for (var i = 0, j = str.length; i < j; ++i) {
    arr.push(str.charCodeAt(i));
  }
  var tmpUint8Array = new Uint8Array(arr);
  return tmpUint8Array
}

export { unzip };