import {ShpBase} from "./shp-base";

export class ShpMultiPoint extends ShpBase{

    public override parse  (data: Uint8Array) {
        console.log("ShpMultiPoint");
        const dataView = new DataView(data.buffer);
        const out: { [key: string]: any } = {};
        let num = null;
        try {
            num = dataView.getInt32(32, true);
        } catch (RangeError) {
            return null;
        }

        const mins = this.parseCoordinate(data, 0);
        const maxs = this.parseCoordinate(data, 16);
        out.bbox = [
            mins[0],
            mins[1],
            maxs[0],
            maxs[1]
        ];
        const offset = 36;
        if (num === 1) {
            out.type = 'Point';
            out.coordinates = this.parseCoordinate(data, offset);
        } else {
            out.type = 'MultiPoint';
            out.coordinates = this.parseCoordinateArray(data, offset, num);
        }
        return out;
    };

}