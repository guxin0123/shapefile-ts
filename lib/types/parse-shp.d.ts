import proj4 from "proj4";
import { ShpRow } from "@/entity/shp-row";
import { ShpHeader } from "@/entity/shp-header";
import { ShpBase } from "@/entity/convert/shp-base";
import { ShpPoint } from "@/entity/convert/shp-point";
import { ShpPolyline } from "@/entity/convert/shp-polyline";
import { ShpPolygon } from "@/entity/convert/shp-polygon";
import { ShpMultiPoint } from "@/entity/convert/shp-multi-point";
import { ShpZPoint } from "@/entity/convert/shp-z-point";
import { ShpZPolyline } from "@/entity/convert/shp-z-polyline";
import { ShpZPolygon } from "@/entity/convert/shp-z-polygon";
import { ShpZMultiPoint } from "@/entity/convert/shp-z-multi_point";
export declare class ParseShp {
    shpGeoObject: ShpBase;
    buffer: Uint8Array;
    rows: any[];
    trans: string | boolean | proj4.Converter;
    constructor(buffer: Uint8Array | ArrayBuffer, trans: string | boolean | proj4.Converter);
    headers: any;
    shpObjArray: {
        1: typeof ShpPoint;
        3: typeof ShpPolyline;
        5: typeof ShpPolygon;
        8: typeof ShpMultiPoint;
        11: typeof ShpZPoint;
        13: typeof ShpZPolyline;
        15: typeof ShpZPolygon;
        18: typeof ShpZMultiPoint;
    };
    setShpObjType(): void;
    getShpCode: () => number;
    parseHeader: () => ShpHeader;
    getRows: () => any[];
    getRow: (offset: number) => ShpRow;
}
declare const ParseShpFile: (buffer: Uint8Array, trans: string | boolean | proj4.Converter) => any[];
export default ParseShpFile;
