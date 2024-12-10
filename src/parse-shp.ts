import proj4 from "proj4";
import {ShpRow} from "@/entity/shp-row";
import {ShpHeader} from "@/entity/shp-header";
import {ShpBase} from "@/entity/convert/shp-base";
import {ShpPoint} from "@/entity/convert/shp-point";
import {ShpPolyline} from "@/entity/convert/shp-polyline";
import {ShpPolygon} from "@/entity/convert/shp-polygon";
import {ShpMultiPoint} from "@/entity/convert/shp-multi-point";
import {ShpZPoint} from "@/entity/convert/shp-z-point";
import {ShpZPolyline} from "@/entity/convert/shp-z-polyline";
import {ShpZPolygon} from "@/entity/convert/shp-z-polygon";
import {ShpZMultiPoint} from "@/entity/convert/shp-z-multi_point";

export class ParseShp {
    //parseFunc: Function;
    shpGeoObject: ShpBase;
    buffer: Uint8Array;
    rows: any[] = [];
    trans: string | boolean | proj4.Converter;

    constructor(buffer: Uint8Array|ArrayBuffer, trans: string | boolean | proj4.Converter) {
        if (buffer instanceof ArrayBuffer) {
            buffer = new Uint8Array(buffer);
        }
        this.buffer = <Uint8Array>buffer;
        this.headers = this.parseHeader();
        if (this.headers.length < this.buffer.byteLength) {
            this.buffer = this.buffer.slice(0, this.headers.length);
        }
        this.trans = trans;
        this.setShpObjType();
        this.rows = this.getRows();
    }

    headers: any;

    // shpFuncObj = {
    //     1: this.parsePoint,
    //     3: this.parsePolyline,
    //     5: this.parsePolygon,
    //     8: this.parseMultiPoint,
    //     11: this.parseZPoint,
    //     13: this.parseZPolyline,
    //     15: this.parseZPolygon,
    //     18: this.parseZMultiPoint
    // };
    shpObjArray = {
        1: ShpPoint,
        3: ShpPolyline,
        5: ShpPolygon,
        8: ShpMultiPoint,
        11: ShpZPoint,
        13: ShpZPolyline,
        15: ShpZPolygon,
        18: ShpZMultiPoint
    };


    setShpObjType() {
        let num = this.headers.shpCode;
        if (num > 20) {
            num -= 20;
        }
        if (!(num in this.shpObjArray)) {
            throw new Error('I don\'t know that shp type');
        }
        // this.parseFunc = this.shpFuncObj[num];
        this.shpGeoObject = new this.shpObjArray[num]();
    };

    // noinspection JSUnusedGlobalSymbols
    getShpCode = () => {
        return this.parseHeader().shpCode;
    };
    parseHeader = () => {
        const view: Uint8Array = this.buffer.slice(0, 100);
        const dataView = new DataView(view.buffer);
        return new ShpHeader(
            dataView.getInt32(6 << 2) << 1,
            dataView.getInt32(7 << 2, true),
            dataView.getInt32(8 << 2, true),
            [
                dataView.getFloat64(9 << 2, true),
                dataView.getFloat64(11 << 2, true),
                dataView.getFloat64(13 << 2, true),
                dataView.getFloat64(13 << 2, true)
            ]
        )
    };
    getRows = () => {
        let offset = 100;
        const len = this.buffer.byteLength;
        const rows: any[] = [];
        let current: ShpRow;
        while (offset < len) {
            current = this.getRow(offset);
            if (!current) {
                break;
            }
            offset += 8;
            offset += current.len;
            if (current.type) {
                rows.push(this.shpGeoObject.parse(current.data));
            } else {
                rows.push(null);
            }
        }
        return rows;
    };
    getRow = (offset: number): ShpRow => {
        const view: Uint8Array = this.buffer.slice(offset, offset + 12);
        const dataView = new DataView(view.buffer);
        const len = dataView.getInt32(4) << 1;
        const id = dataView.getInt32(0);
        if (len === 0) {
            return new ShpRow(id, len, 0);
        }
        return new ShpRow(id, len, dataView.getInt32(8, true), this.buffer.slice(offset + 12, offset + len + 8));
    };
    static ParseShpFile = (buffer: Uint8Array, trans: string | boolean | proj4.Converter): any[] => {
        return new ParseShp(buffer, trans).rows;
    };
}
