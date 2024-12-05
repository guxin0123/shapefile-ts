import {ShpPolyline} from "./shp-polyline";

export class ShpZPolyline extends ShpPolyline {


    override parse (data: Uint8Array) {
        const geoJson = super.parse(data);
        if (!geoJson) {
            return null;
        }
        const num = geoJson.coordinates.length;
        let zOffset: number;
        if (geoJson.type === 'LineString') {
            zOffset = 60 + (num << 4);
            geoJson.coordinates = this.parseZPointArray(data, zOffset, num, geoJson.coordinates);
            return geoJson;
        } else {
            const totalPoints = geoJson.coordinates.reduce(function (a: any, v: string | any[]) {
                return a + v.length;
            }, 0);
            zOffset = 56 + (totalPoints << 4) + (num << 2);
            geoJson.coordinates = this.parseZArrayGroup(data, zOffset, num, geoJson.coordinates);
            return geoJson;
        }
    };

}