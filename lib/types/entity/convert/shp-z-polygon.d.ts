import { ShpZPolyline } from "./shp-z-polyline";
export declare class ShpZPolygon extends ShpZPolyline {
    parse(data: Uint8Array): {
        [x: string]: any;
        type?: any;
        coordinates?: any;
    };
}
