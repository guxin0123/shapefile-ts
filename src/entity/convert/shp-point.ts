import {ShpBase} from "./shp-base";

export class ShpPoint extends ShpBase{
    parse(data: Uint8Array){
        return {
            type: 'Point',
            coordinates: this.parseCoordinate(data, 0)
        };
    }
}