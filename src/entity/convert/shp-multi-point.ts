import {ShpBase} from "./shp-base";

export class ShpMultiPoint extends ShpBase{

    public override parse  (data: Uint8Array) {
        //console.log("ShpMultiPoint");
        const dataView = new DataView(data.buffer);
        const out: { [key: string]: any } = {};
        let num = null;
        try {
            num = dataView.getInt32(32, true);
        } catch (RangeError) {
            return null;
        }

        const min_s = this.parseCoordinate(data, 0);
        const max_s = this.parseCoordinate(data, 16);
        out.bbox = [
            min_s[0],
            min_s[1],
            max_s[0],
            max_s[1]
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