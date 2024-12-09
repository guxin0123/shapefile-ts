import { DbfHeader } from "@/entity/dbf-header";
import { DbfRowHeader } from "@/entity/dbf-row-header";
export declare class ParseDbf {
    static readDbfHeader(data: Uint8Array): DbfHeader;
    static readDbfRowHeaders(data: Uint8Array, headerLen: number, decoder: Function): DbfRowHeader[];
    static rowFunc(buffer: Uint8Array, offset: number, len: number, type: string, decoder: Function): string | Date | boolean | number;
    static parseRow(buffer: Uint8Array, offset: number, rowHeaders: DbfRowHeader[], decoder: Function): {};
    static parseDbf: (buffer: Uint8Array | ArrayBuffer, encoding: string) => any[];
}
