import {ShpPolyline} from "./shp-polyline";

export class ShpPolygon extends ShpPolyline{

    parse = (data: Uint8Array) => {
        return this.polyFuncs(super.parse(data));
    };
}