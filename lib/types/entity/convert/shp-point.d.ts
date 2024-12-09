import { ShpBase } from "./shp-base";
export declare class ShpPoint extends ShpBase {
    parse(data: Uint8Array): {
        type: string;
        coordinates: number[];
    };
}
