import {ShpPoint} from "./shp-point";

export class ShpZPoint extends ShpPoint {

    override parse = (data: Uint8Array) => {
        const dataView = new DataView(data.buffer);
        const pointXY = super.parse(data);
        pointXY.coordinates.push(dataView.getFloat64(16, true));
        return pointXY;
    };
}