import {ShpZip} from "@/shp-zip";
import binaryAjax from "@/binaryajax-fetch";
import {ParseShp} from "@/parse-shp";
import {ParseDbf} from "@/parse-dbf";
import {ShpReaderObj} from "@/entity/shp-reader-obj";


// noinspection JSUnusedGlobalSymbols
export class ShpReader {

    static async read(base: string | ArrayBuffer | Uint8Array, encoding: string) {
        //console.log("read")
        if (typeof base == 'string') {
            if (this.checkSuffix(base, '.zip')) {
                return this.readZipUrl(base, encoding);
            } else {
                return this.readShpUrl(base, encoding);
            }
        }
        if (base instanceof ArrayBuffer) {
            return this.readZipArrayBuffer(base);
        }
        if (base instanceof Uint8Array) {
            //console.log("Uint8Array");
            return this.readZipUint8Array(base);
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

    static async readShpBlob(shpBlob: Blob, dbfBlob?: Blob, prj?: any, cpg?: any, encoding?: string) {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(shpBlob);
        await new Promise((resolve, reject) => {
            fileReader.onload = resolve;
            fileReader.onerror = reject;
        });
        const fileReaderShpBuffer: ArrayBuffer = fileReader.result as ArrayBuffer;
        let fileReaderDbfBuffer = undefined;
        if (dbfBlob) {
            fileReader.readAsArrayBuffer(dbfBlob);
            fileReaderDbfBuffer = fileReader.result as ArrayBuffer;
        }
        return this.readShpArrayBuffer(fileReaderShpBuffer, fileReaderDbfBuffer, prj, cpg, encoding);
    }

    static readShpArrayBuffer(shpArrayBuffer: ArrayBuffer, dbfArrayBuffer?: ArrayBuffer, prj?: any, cpg?: any, encoding?: string) {
        return this.readShpUint8Array(
            new Uint8Array(shpArrayBuffer),
            dbfArrayBuffer ? new Uint8Array(dbfArrayBuffer) : undefined,
            prj,
            cpg,
            encoding
        )
    }

    static readShpUint8Array(shpUint8Array: Uint8Array, dbfUint8Array?: Uint8Array, prj?: any, cpg?: any, encoding?: string) {
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
        return this.readShpUint8Array(
            new Uint8Array(shpObj.shp),
            shpObj.dbf ? new Uint8Array(shpObj.dbf) : undefined,
            shpObj.prj,
            shpObj.cpg,
            encoding
        )
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

