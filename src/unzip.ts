import * as fflate from 'fflate';

export const unzip = async (buffer: Uint8Array | ArrayBuffer, encoding?: string): Promise<any> => {
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
                    const decoder = new TextDecoder(encoding);
                    const u8 = stringToUint8Array(key);
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
    const arr = [];
    for (let i = 0, j = str.length; i < j; ++i) {
        arr.push(str.charCodeAt(i));
    }
    return new Uint8Array(arr)
}

