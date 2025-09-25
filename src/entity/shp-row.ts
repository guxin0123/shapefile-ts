export class ShpRow {
    id: number;
    len: number;
    data: Uint8Array;
    type: number;

    constructor(id: number, len: number, type?: number, data?: Uint8Array) {
        this.id = id;
        this.len = len;
        this.type = type || 0;
        this.data = data || new Uint8Array();
    }
}