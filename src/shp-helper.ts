import {ParseShp} from "@/parse-shp";
import {ParseDbf} from "@/parse-dbf";
import { Converter } from "proj4";

export class ShpHelper {

    /**
     * 合并shp dbf
     * @param geometryArray
     * @param propertiesArray
     */
    static combine = (geometryArray: any[], propertiesArray: any[]) => {
        return ParseShp.combine(geometryArray, propertiesArray);
    };

    static parseShp(shpBuffer: Uint8Array, prj: string | boolean | Converter) {
      return   ParseShp.parse(shpBuffer, prj);
    }

    static parseDbf(dbfBuffer: Uint8Array, cpg: string) {
      return   ParseDbf.parse(dbfBuffer, cpg);
    }
}