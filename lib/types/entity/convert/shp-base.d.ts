import proj4 from "proj4";
export declare class ShpBase {
    trans: string | boolean | proj4.Converter;
    constructor(trans: string | boolean | proj4.Converter);
    parse(data: Uint8Array): void;
    parseCoordinate(data: Uint8Array, offset: number): number[];
    parseCoordinateArray: (data: Uint8Array, offset: number, num: number) => any[];
    parseArrayGroup: (data: Uint8Array, offset: number, partOffset: number, num: number, tot: number) => any[];
    polyFuncs: (out: {
        [x: string]: any;
        type?: any;
        coordinates?: any;
    }) => {
        [x: string]: any;
        type?: any;
        coordinates?: any;
    };
    parseZPointArray: (data: Uint8Array, zOffset: number, num: number, coordinates: string | any[]) => string | any[];
    parseZArrayGroup: (data: Uint8Array, zOffset: number, num: number, coordinates: (string | any[])[]) => (string | any[])[];
    isClockWise: (array: string | any[]) => boolean;
    polyReduce: (a: any[][], b: any) => any[][];
}
