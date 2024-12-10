
import {DbfHeader} from "@/entity/dbf-header";
import {DbfRowHeader} from "@/entity/dbf-row-header";
import {DecoderUtils} from "@/decoder-utils";

export class ParseDbf {
    static readDbfHeader(data: Uint8Array): DbfHeader {
        const dataView = new DataView(data.buffer);
        let dbfHeader: DbfHeader = new DbfHeader();
        dbfHeader.lastUpdated = new Date(dataView.getInt8(1) + 1900, dataView.getInt8(2), dataView.getInt8(3));
        dbfHeader.records = dataView.getInt32(4, true);
        dbfHeader.headerLen = dataView.getInt16(8, true);
        dbfHeader.recLen = dataView.getInt16(10, true);
        return dbfHeader;
    }


    static readDbfRowHeaders(data: Uint8Array, headerLen: number, decoder: Function): DbfRowHeader[] {
        const dataView = new DataView(data.buffer);
        const dbfRowHeaders: DbfRowHeader[] = [];
        let offset = 32;
        while (offset < headerLen) {
            dbfRowHeaders.push({
                name: decoder(data.slice(offset, offset + 11)),
                dataType: String.fromCharCode(dataView.getUint8(offset + 11)),
                len: dataView.getUint8(offset + 16),
                decimal: dataView.getUint8(offset + 17)
            });
            if (dataView.getUint8(offset + 32) === 13) {
                break;
            } else {
                offset += 32;
            }
        }
        return dbfRowHeaders;
    }

    static rowFunc(buffer: Uint8Array, offset: number, len: number, type: string, decoder: Function): string | Date | boolean | number {
        const data = buffer.slice(offset, offset + len);
        const textData: string = decoder(data);
        switch (type) {
            case 'N':
            case 'F':
            case 'O':
                return parseFloat(textData);
            case 'D':
                return new Date(parseInt(textData.slice(0, 4)), parseInt(textData.slice(4, 6), 10) - 1, parseInt(textData.slice(6, 8)));
            case 'L':
                return textData.toLowerCase() === 'y' || textData.toLowerCase() === 't';
            default:
                return textData;
        }
    }

    static parseRow(buffer: Uint8Array, offset: number, rowHeaders: DbfRowHeader[], decoder: Function) {
        const out = {};
        let i = 0;
        const len = rowHeaders.length;
        let field: string | number | boolean | Date;
        let header: DbfRowHeader;
        while (i < len) {
            header = rowHeaders[i];
            field = this.rowFunc(buffer, offset, header.len, header.dataType, decoder);
            offset += header.len;
            if (typeof field !== 'undefined') {
                out[header.name] = field;
            }
            i++;
        }
        return out;
    }

    static parseDbf =  (buffer: Uint8Array | ArrayBuffer, encoding: string)=> {
        if (buffer instanceof ArrayBuffer) {
            buffer = new Uint8Array(buffer);
        }

        const decoder: any = DecoderUtils.createDecoder(encoding);
        const header: DbfHeader = this.readDbfHeader(<Uint8Array>buffer);
        const rowHeaders: DbfRowHeader[] = this.readDbfRowHeaders(<Uint8Array>buffer, header.headerLen - 1, decoder);

        let offset = ((rowHeaders.length + 1) << 5) + 2;
        const recLen = header.recLen;
        let records = header.records;
        const out = [];
        while (records) {
            out.push(this.parseRow(<Uint8Array>buffer, offset, rowHeaders, decoder));
            offset += recLen;
            records--;
        }
        return out;
    };

}
