import {ShpZPolyline} from "./shp-z-polyline";

export class ShpZPolygon extends ShpZPolyline{


   override parse (data: Uint8Array)  {
        return this.polyFunc(super.parse(data));
    };

}