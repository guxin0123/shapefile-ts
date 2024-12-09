export declare class ShpHeader {
    length: number;
    version: number;
    shpCode: number;
    bbox: number[];
    constructor(length: number, version: number, shpCode: number, bbox: number[]);
}
