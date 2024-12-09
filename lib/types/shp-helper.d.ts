import proj4 from "proj4";
import { ShpEntity } from "@/entity/shp-entity";
export declare class ShpHelper {
    combine: (geometryArray: any[], propertiesArray: any[]) => ShpEntity;
    parseZip: (buffer: Uint8Array, whiteList?: Array<string>, encoding?: string) => Promise<{
        [x: string]: any;
        fileName?: any;
    } | {
        [x: string]: any;
        fileName?: any;
    }[]>;
    getZip: (base: string, whiteList: Array<string>, encoding?: string) => Promise<{
        [x: string]: any;
        fileName?: any;
    } | {
        [x: string]: any;
        fileName?: any;
    }[]>;
    handleShp: (base: string) => Promise<any[]>;
    handleDbf: (base: string) => Promise<any[]>;
    checkSuffix: (base: string, suffix: string) => boolean;
    getShapefile: (base: string | Uint8Array, whiteList: Array<string>, encoding?: string) => Promise<ShpEntity | {
        [x: string]: any;
        fileName?: any;
    } | {
        [x: string]: any;
        fileName?: any;
    }[]>;
    parseShp: (shp: Uint8Array, prj: string | boolean | proj4.Converter) => any[];
    parseDbf: (dbf: Uint8Array, cpg: string) => any[];
}
