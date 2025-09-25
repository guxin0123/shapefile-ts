import {ShpZip} from "./shp-zip";
import binaryAjax from "./binaryajax-fetch";
import {ParseShp} from "./parse-shp";
import {ParseDbf} from "./parse-dbf";
import {ShpReaderObj} from "./entity/shp-reader-obj";


// noinspection JSUnusedGlobalSymbols
export class ShpReader {

    static async read(base: string | ArrayBuffer | Uint8Array | ShpReaderObj, encoding: string) {
        //console.log("read")

        if (typeof base == 'string') {
            if (this.checkSuffix(base, '.zip')) {
                return this.readZipUrl(base, encoding);
            } else {
                return this.readShpUrl(base, encoding);
            }
        }
        if (base instanceof ArrayBuffer) {
            return this.readZipArrayBuffer(base, encoding);
        }
        if (base instanceof Uint8Array) {
            //console.log("Uint8Array");
            return this.readZipUint8Array(base, encoding);
        }
        if (base instanceof Object) {
            return this.readObjArrayBuffer(base, encoding);
        }
    }

    static async readShpUrl(base: string, encoding?: string) {
        const [shpArrayBuffer, dbfArrayBuffer, prj, cpg]: any[] = await Promise.all([
            binaryAjax(base, 'shp'),
            binaryAjax(base, 'dbf'),
            binaryAjax(base, 'prj'),
            binaryAjax(base, 'cpg')
        ]);
        return this.readShpArrayBuffer(shpArrayBuffer, dbfArrayBuffer, prj, cpg, encoding);
    }

    static async readShpBlob(shpBlob: Blob, dbfBlob?: Blob, prj?: Blob, cpg?: Blob, encoding?: string) {
        const fileReaderShpBuffer: ArrayBuffer = await this.blobToArrayBuffer(shpBlob);
        let fileReaderDbfBuffer = undefined;
        if (dbfBlob) {
            fileReaderDbfBuffer = await this.blobToArrayBuffer(dbfBlob);
        }
        return this.readShpArrayBuffer(fileReaderShpBuffer, fileReaderDbfBuffer, await this.blobToString(prj), await this.blobToString(cpg), encoding);
    }

    static readShpArrayBuffer(shpArrayBuffer: ArrayBuffer, dbfArrayBuffer?: ArrayBuffer, prj?: string, cpg?: string, encoding?: string) {
        return this.readShpUint8Array(
            new Uint8Array(shpArrayBuffer),
            dbfArrayBuffer ? new Uint8Array(dbfArrayBuffer) : undefined,
            prj,
            cpg,
            encoding
        )
    }

    static readShpUint8Array(shpUint8Array: Uint8Array, dbfUint8Array?: Uint8Array, prj?: string, cpg?: string, encoding?: string) {
        const shp = ParseShp.parse(shpUint8Array, prj);
        const dbf = dbfUint8Array ? ParseDbf.parse(dbfUint8Array, cpg ? cpg : encoding) : undefined;
        return ParseShp.combine(shp, dbf);
    }

    static async readZipUrl(url: string, encoding?: string) {
        return fetch(url, {mode: 'cors'}).then((res) => {
            return res.arrayBuffer();
        }).then((data) => {
            return this.readZipArrayBuffer(data, encoding);
        }).catch((err) => {
            console.error(url + "--" + err.statusText);
            return Promise.reject(err);
        });
    }

    static async readZipBlob(blob: Blob, encoding?: string) {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(blob);
        await new Promise((resolve, reject) => {
            fileReader.onload = resolve;
            fileReader.onerror = reject;
        });
        const fileReaderBuffer: ArrayBuffer = fileReader.result as ArrayBuffer;
        return this.readZipArrayBuffer(fileReaderBuffer, encoding);
    }

    static readZipArrayBuffer(arrayBuffer: ArrayBuffer, encoding?: string) {
        return this.readZipUint8Array(new Uint8Array(arrayBuffer), encoding);
    }

    static readZipUint8Array(uint8Array: Uint8Array, encoding?: string) {
        const shpZip = new ShpZip(uint8Array, encoding);
        return shpZip.getGeoJson();
    }

    static readObjArrayBuffer(shpObj: ShpReaderObj, encoding?: string) {
        if (shpObj.prj && (shpObj.prj instanceof ArrayBuffer)) {
            shpObj.prj = this.arrayBufferToString(shpObj.prj);
        }
        if (shpObj.cpg && (shpObj.cpg instanceof ArrayBuffer)) {
            shpObj.cpg = this.arrayBufferToString(shpObj.cpg);
        }

        return this.readShpUint8Array(
            new Uint8Array(shpObj.shp),
            shpObj.dbf ? new Uint8Array(shpObj.dbf) : undefined,
            shpObj.prj ? shpObj.prj as string : undefined,
            shpObj.cpg ? shpObj.cpg as string : undefined,
            encoding
        )
    }

    // noinspection JSUnusedLocalSymbols
    private static async blobToArrayBuffer(blob: Blob) {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(blob);
        await new Promise((resolve, reject) => {
            fileReader.onload = resolve;
            fileReader.onerror = reject;
        });
        return fileReader.result as ArrayBuffer;
    }

    private static async blobToString(blob: Blob) {
        const fileReader = new FileReader();
        fileReader.readAsText(blob);
        await new Promise((resolve, reject) => {
            fileReader.onload = resolve;
            fileReader.onerror = reject;
        });
        return fileReader.result as string;
    }

    // noinspection JSUnusedLocalSymbols
    private static arrayBufferToString(arrayBuffer: ArrayBuffer) {
        const textDecoder = new TextDecoder();
        return textDecoder.decode(arrayBuffer);
    }

    /**
     * 校验后缀
     * @param base
     * @param suffix
     */
    static checkSuffix = (base: string, suffix: string) => {
        const url = new URL(location.href + base);
        return url.pathname.slice(-4).toLowerCase() === suffix;
    };
}

