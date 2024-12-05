import {ShpFeature} from "./shp-feature";

export class ShpEntity{
    [key: string]: any;
    type:string;
    features:ShpFeature[];

}