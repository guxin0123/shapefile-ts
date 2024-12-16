import {unzip} from 'fflate';
import {DecoderUtils} from "@/decoder-utils";
import {ParseDbf} from "@/parse-dbf";
import {ParseShp} from "@/parse-shp";
import {ShpEntity} from "@/entity/shp-entity";


export class ShpZip {
    private readonly zipBuffer: Uint8Array;
    private readonly decoder: any;

    constructor(zipFile: Uint8Array, encoding?: string) {
        this.zipBuffer = zipFile;
        this.decoder = encoding ? DecoderUtils.createDecoder(encoding) : DecoderUtils.defaultDecoder;
    }

    private async readZip(zipFile: Uint8Array) {
        return new Promise((resolve, reject) => {
            unzip(zipFile, (err, result) => err ? reject(err) : resolve(result));
        }).then((unzipped: any) => {
            //auto decode file name
            const res = {};
            for (let key in unzipped) {
                // encoding
                // DecoderUtils.createDecoder(this.encoding)
                const newKey = this.decoder(Uint8Array.from(Array.from(key).map(letter => letter.charCodeAt(0))))
                res[newKey] = unzipped[key];
            }
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
        //console.log(data)
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
        if (res.length == 0) {
            return Promise.reject("no shp file!");
        }
        return res.length == 1 ? res[0] : res;
    }
}