import {ShpMultiPoint} from "./shp-multi-point";

export class ShpZMultiPoint extends ShpMultiPoint{

   public override parse (data: Uint8Array)  {
       console.log("ShpZMultiPoint")
       const dataView = new DataView(data.buffer);
        const geoJson = super.parse(data);
        if (!geoJson) {
            return null;
        }
        let num: number;
        if (geoJson.type === 'Point') {
            geoJson.coordinates.push(dataView.getFloat64(72, true));
            return geoJson;
        } else {
            num = geoJson.coordinates.length;
        }
        const zOffset = 52 + (num << 4);
        geoJson.coordinates = this.parseZPointArray(data, zOffset, num, geoJson.coordinates);
        return geoJson;
    };

}