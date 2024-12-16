import proj4 from "proj4";

export class ShpBase {
    trans: string | boolean | proj4.Converter;

    constructor(trans: string | boolean | proj4.Converter) {
        this.trans = trans;
    }

    // noinspection JSUnusedGlobalSymbols
    public parse(_data: Uint8Array){
        console.error("no instantiation");
    }
    parseCoordinate(data: Uint8Array, offset: number) {
        const dataView = new DataView(data.buffer);
        if (this.trans) {
            const args = [dataView.getFloat64(offset, true), dataView.getFloat64(offset + 8, true)];
            return (this.trans as proj4.Converter).inverse(args);
        } else {
            return [dataView.getFloat64(offset, true), dataView.getFloat64(offset + 8, true)];
        }
    }

    parseCoordinateArray = (data: Uint8Array, offset: number, num: number) => {
        const out: any[] = [];
        let done = 0;
        while (done < num) {
            out.push(this.parseCoordinate(data, offset));
            offset += 16;
            done++;
        }
        return out;
    };


    parseArrayGroup = (data: Uint8Array, offset: number, partOffset: number, num: number, tot: number) => {
        const dataView = new DataView(data.buffer);
        const out: any[] = [];
        let done = 0;
        let curNum: number;
        let nextNum = 0;
        let pointNumber: number;
        while (done < num) {
            done++;
            partOffset += 4;
            curNum = nextNum;
            if (done === num) {
                nextNum = tot;
            } else {
                nextNum = dataView.getInt32(partOffset, true);
            }
            pointNumber = nextNum - curNum;
            if (!pointNumber) {
                continue;
            }
            out.push(this.parseCoordinateArray(data, offset, pointNumber));
            offset += (pointNumber << 4);
        }
        return out;
    };

    polyFunc = (out: { [x: string]: any; type?: any; coordinates?: any; }) => {
        if (!out) {
            return out;
        }
        if (out.type === 'LineString') {
            out.type = 'Polygon';
            out.coordinates = [out.coordinates];
            return out;
        } else {
            out.coordinates = out.coordinates.reduce(this.polyReduce, []);
            if (out.coordinates.length === 1) {
                out.type = 'Polygon';
                out.coordinates = out.coordinates[0];
                return out;
            } else {
                out.type = 'MultiPolygon';
                return out;
            }
        }
    };

    parseZPointArray = (data: Uint8Array, zOffset: number, num: number, coordinates: string | any[]) => {
        const dataView = new DataView(data.buffer);
        let i = 0;
        while (i < num) {
            coordinates[i].push(dataView.getFloat64(zOffset, true));
            i++;
            zOffset += 8;
        }
        return coordinates;
    };

    parseZArrayGroup = (data: Uint8Array, zOffset: number, num: number, coordinates: (string | any[])[]) => {
        let i = 0;
        while (i < num) {
            coordinates[i] = this.parseZPointArray(data, zOffset, coordinates[i].length, coordinates[i]);
            zOffset += (coordinates[i].length << 3);
            i++;
        }
        return coordinates;
    };

    isClockWise = (array: string | any[]) => {
        let sum = 0;
        let i = 1;
        const len = array.length;
        let prev: any[], cur: any[];
        while (i < len) {
            prev = cur || array[0];
            cur = array[i];
            sum += ((cur[0] - prev[0]) * (cur[1] + prev[1]));
            i++;
        }
        return sum > 0;
    }

    polyReduce = (a: any[][], b: any) => {
        if (this.isClockWise(b) || !a.length) {
            a.push([b]);
        } else {
            a[a.length - 1].push(b);
        }
        return a;
    }
}