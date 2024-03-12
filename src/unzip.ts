import JSZip from 'jszip';
import { Buffer } from 'buffer';

const unzip = async (buffer: string | number[] | ArrayBuffer | Uint8Array | Blob | NodeJS.ReadableStream | Promise<string | number[] | ArrayBuffer | Uint8Array | Blob | NodeJS.ReadableStream>) => {
  const zip = new JSZip();
  await zip.loadAsync(buffer);
  const files = zip.file(/.+/);
  const out = {};
  await Promise.all(files.map(async (a) => {
    let result: string | number[] | ArrayBuffer | { valueOf(): ArrayBuffer | SharedArrayBuffer; };
    if (a.name.slice(-3).toLowerCase() === 'shp' || a.name.slice(-3).toLowerCase() === 'dbf') {
      result = await a.async('array');
      result = Buffer.from(result)
    } else {
      result = await a.async('text');
    }
    out[a.name] = result;
  }));
  return out;
};
export default unzip;