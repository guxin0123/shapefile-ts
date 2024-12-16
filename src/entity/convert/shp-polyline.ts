import {ShpBase} from "./shp-base";

export class ShpPolyline extends ShpBase{

   public  override parse(data: Uint8Array){
        const dataView = new DataView(data.buffer);
        const out: { [key: string]: any } = {};
        const numParts = dataView.getInt32(32, true);
        if (!numParts) {
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
        const num = dataView.getInt32(36, true);
        let offset: number, partOffset: number;
        if (numParts === 1) {
            out.type = 'LineString';
            offset = 44;
            out.coordinates = this.parseCoordinateArray(data, offset, num);
        } else {
            out.type = 'MultiLineString';
            offset = 40 + (numParts << 2);
            partOffset = 40;
            out.coordinates = this.parseArrayGroup(data, offset, partOffset, numParts, num);
        }
        return out;
    }
}