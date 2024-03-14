import JSZip from 'jszip';
import { Buffer } from 'buffer';
import iconv from 'iconv-lite';



const unzip = async (buffer: string | number[] | ArrayBuffer | Uint8Array | Blob | NodeJS.ReadableStream | Promise<string | number[] | ArrayBuffer | Uint8Array | Blob | NodeJS.ReadableStream>,encoding?:string) => {
  const zip = new JSZip();
  if(encoding!=null){
    await zip.loadAsync(buffer,{
      decodeFileName: function (bytes) {
        if(bytes instanceof Uint8Array){
          return iconv.decode(bytes as globalThis.Buffer, encoding);
        }
        return "";
      }
    });
  }else{
    await zip.loadAsync(buffer);
  }
  
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