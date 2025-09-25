import { unzip } from 'fflate';
import { ParseDbf } from "./parse-dbf";
import { ParseShp } from "./parse-shp";
import { ShpEntity } from "./entity/shp-entity";
import jschardet from 'jschardet'
import { DecoderUtils } from './decoder-utils';



export class ShpZip {
    private readonly zipBuffer: Uint8Array;
    private readonly decoder: any;
    constructor(zipFile: Uint8Array, encoding?: string) {
        this.zipBuffer = zipFile;
        this.decoder = DecoderUtils.getDefaultDecoder(encoding);
    }
    private async readZip(zipFile: Uint8Array) {
        return new Promise((resolve, reject) => {
            unzip(zipFile, (err, result) => err ? reject(err) : resolve(result));
        }).then((unzipped: any) => {
            const res = {};
            for (let key in unzipped) {
                const u8arr = Uint8Array.from(Array.from(key).map(letter => letter.charCodeAt(0)));
                let result = jschardet.detect(key);
                const newKey = result.encoding == "ascii" ? key : this.decoder.decode(u8arr);
                res[newKey] = unzipped[key];
            }
            //console.log(res);
            return res;
        }).then((res) => {
            const resGroup = {};
            for (let key in res) {
                const fileNameNoSuffix = key.substring(0, key.lastIndexOf("."));
                const suffix = key.substring(key.lastIndexOf(".") + 1, key.length);

                if (!resGroup[fileNameNoSuffix]) {
                    resGroup[fileNameNoSuffix] = {};
                }
                resGroup[fileNameNoSuffix][suffix] = res[key];
            }
            return resGroup;
        });
    }

    async getGeoJson() {
        const res: ShpEntity[] = [];
        const data = await this.readZip(this.zipBuffer);
        //console.log(data);
        for (let key in data) {
            //const shp =
            if (data[key]["shp"]) {
                const files = data[key];
                const prj = files["prj"] ? new TextDecoder().decode(files["prj"]) : undefined;
                const cpg = files["cpg"] ? new TextDecoder().decode(files["cpg"]) : undefined;
                const shp = files["shp"] ? ParseShp.parse(files["shp"], prj) : undefined;
                const dbf = files["dbf"] ? ParseDbf.parse(files["dbf"], cpg) : [];
                const geoJson: ShpEntity = ParseShp.combine(shp, dbf);
                geoJson.fileName = key;
                res.push(geoJson);
            }
        }
        console.log(res);
        if (res.length == 0) {
            return Promise.reject("no shp file!");
        }
        return res.length == 1 ? res[0] : res;
    }
}