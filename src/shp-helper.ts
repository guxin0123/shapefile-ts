import {unzip} from "@/unzip";
import proj4 from "proj4";
import binaryAjax from "@/binaryajax-fetch";
import {ShpEntity} from "@/entity/shp-entity";
import {ParseDbf} from "@/parse-dbf";
import {ParseShp} from "@/parse-shp";

export class ShpHelper {

    /**
     * 合并shp dbf
     * @param geometryArray
     * @param propertiesArray
     */
    combine = (geometryArray:any[], propertiesArray:any[]) => {
        const shpEntity: ShpEntity = new ShpEntity();
        shpEntity.type = 'FeatureCollection';
        shpEntity.features = [];
        let i = 0;
        const len = geometryArray.length;
        if (!propertiesArray) {
            propertiesArray = [];
        }
        while (i < len) {
            shpEntity.features.push({
                type: 'Feature',
                geometry: geometryArray[i],
                properties: propertiesArray[i] || {}
            });
            i++;
        }
        return shpEntity;
    };

    /**
     * 读取zip流
     * @param buffer
     * @param whiteList
     * @param encoding
     */
    parseZip = async (buffer: Uint8Array , whiteList?: Array<string>, encoding?: string) => {
        let key: string;
        const zip = await unzip(buffer, encoding);
        const names: string[] = [];
        whiteList = whiteList || [];
        for (key in zip) {
            if (key.indexOf('__MACOSX') !== -1) {
                continue;
            }
            if (key.slice(-4).toLowerCase() === '.shp') {
                names.push(key.slice(0, -4));
                zip[key.slice(0, -3) + key.slice(-3).toLowerCase()] = zip[key];
            } else if (key.slice(-4).toLowerCase() === '.prj') {
                zip[key.slice(0, -3) + key.slice(-3).toLowerCase()] = proj4(zip[key]);
            } else if (key.slice(-5).toLowerCase() === '.json' || whiteList.indexOf(key.split('.').pop()) > -1) {
                names.push(key.slice(0, -3) + key.slice(-3).toLowerCase());
            } else if (key.slice(-4).toLowerCase() === '.dbf' || key.slice(-4).toLowerCase() === '.cpg') {
                zip[key.slice(0, -3) + key.slice(-3).toLowerCase()] = zip[key];
            }
        }
        if (!names.length) {
            throw new Error('no layers founds');
        }
        const geojson = names.map((name: string) => {
            let parsed: { [x: string]: any; fileName?: any; }, dbf: any[];
            const lastDotIdx = name.lastIndexOf('.');
            if (lastDotIdx > -1 && name.slice(lastDotIdx).indexOf('json') > -1) {
                parsed = JSON.parse(zip[name]);
                parsed.fileName = name.slice(0, lastDotIdx);
            } else if (whiteList.indexOf(name.slice(lastDotIdx + 1)) > -1) {
                parsed = zip[name];
                parsed.fileName = name;
            } else {
                if (zip[name + '.dbf']) {
                    dbf = ParseDbf.parseDbf(zip[name + '.dbf'], zip[name + '.cpg']);
                }
                parsed = this.combine(ParseShp.ParseShpFile(zip[name + '.shp'], zip[name + '.prj']), dbf);
                parsed.fileName = name;
            }
            return parsed;
        });
        if (geojson.length === 1) {
            return geojson[0];
        } else {
            return geojson;
        }
    };

    /**
     * 读取远程zip流
     * @param base
     * @param whiteList
     * @param encoding
     */
    getZip = async (base: string, whiteList: Array<string>, encoding?: string) => {
        const a:Uint8Array = await binaryAjax(base) as Uint8Array;
        return this.parseZip(a, whiteList, encoding);
    }
    /**
     * 读取远程shp prj文件
     * @param base
     */
    handleShp = async (base: string) => {
        const args = await Promise.all([
            binaryAjax(base, 'shp'),
            binaryAjax(base, 'prj')
        ]);
        let prj: boolean | proj4.Converter = false;
        try {
            if (args[1]) {
                prj = proj4(args[1] as string);
            }
        } catch (e) {
            prj = false;
        }
        return ParseShp.ParseShpFile(args[0] as Uint8Array, prj);
    };


    /**
     * 读取远程 dbf 文件
     * @param base
     */
    handleDbf = async (base: string) => {
        const [dbf, cpg] = await Promise.all([
            binaryAjax(base, 'dbf'),
            binaryAjax(base, 'cpg')
        ]);
        if (!dbf) {
            return;
        }
        return ParseDbf.parseDbf(dbf as Uint8Array, cpg as string);
    };

    /**
     * 校验后缀
     * @param base
     * @param suffix
     */
    checkSuffix = (base: string, suffix: string) => {
        const url = new URL(location.href + base);
        return url.pathname.slice(-4).toLowerCase() === suffix;
    };


    /**
     * 通用读取shp文件方法 自动判断
     * @param base
     * @param whiteList
     * @param encoding
     */
    getShapefile = async (base: string | Uint8Array, whiteList: Array<string>, encoding?: string) => {
        if (typeof base !== 'string') {
            return this.parseZip(base, whiteList, encoding);
        }
        if (this.checkSuffix(base, '.zip')) {
            return this.getZip(base, whiteList, encoding);
        }
        console.log("handleShp")
        const results = await Promise.all([
            this.handleShp(base),
            this.handleDbf(base)
        ]);
        return this.combine(results[0],results[1]);
    };

    /**
     * 判断prj文件 转换shp文件
     * @param shp
     * @param prj
     */
    parseShp =  (shp: Uint8Array, prj: string | boolean | proj4.Converter)=>{
        //shp = toBuffer(shp);
        //if (Buffer.isBuffer(prj)) {
        prj = prj.toString();
        // }
        if (typeof prj === 'string') {
            try {
                prj = proj4(prj);
            } catch (e) {
                prj = false;
            }
        }
        return ParseShp.ParseShpFile(shp, prj);
    };
    /**
     * 转换dbf文件
     * @param dbf
     * @param cpg
     */
    parseDbf =  (dbf: Uint8Array, cpg: string)=> {
        return ParseDbf.parseDbf(dbf, cpg);
    };

}