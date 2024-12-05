export class ShpRow {
    id: number;
    len: number;
    data: Uint8Array;
    type: number;

    constructor(id: number, len: number, type?: number, data?: Uint8Array) {
        this.id = id;
        this.len = len;
        this.type = type;
        this.data = data;
    }
}