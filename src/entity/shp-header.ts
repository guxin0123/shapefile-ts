export class ShpHeader {
    length: number;
    version: number;
    shpCode: number;
    bbox: number[];
    constructor(length: number, version: number, shpCode: number,bbox: number[]) {
        this.length = length;
        this.version = version;
        this.shpCode = shpCode;
        this.bbox = bbox;
    }
}