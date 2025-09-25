import {ShpZPolyline} from "./shp-z-polyline";

export class ShpZPolygon extends ShpZPolyline{


   override parse (data: Uint8Array)  {
        const parsedData = super.parse(data);
        if (!parsedData) {
            return null;
        }
        return this.polyFunc(parsedData);
    };

}