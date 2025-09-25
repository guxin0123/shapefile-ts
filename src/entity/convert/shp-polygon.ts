import {ShpPolyline} from "./shp-polyline";

export class ShpPolygon extends ShpPolyline{

    parse = (data: Uint8Array) => {
        const parsedData = super.parse(data);
        if (!parsedData) {
            throw new Error("Parsed data is null");
        }
        return this.polyFunc(parsedData);
    };
}