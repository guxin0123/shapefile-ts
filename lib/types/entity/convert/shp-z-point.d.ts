import { ShpPoint } from "./shp-point";
export declare class ShpZPoint extends ShpPoint {
    parse: (data: Uint8Array) => {
        type: string;
        coordinates: number[];
    };
}
