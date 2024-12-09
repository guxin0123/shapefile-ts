import { ShpHelper } from "@/shp-helper";
declare const shp: {
    (base: string | Uint8Array, whiteList?: Array<string>, encoding?: string): Promise<import("@/entity/shp-entity").ShpEntity | {
        [x: string]: any;
        fileName?: any;
    } | {
        [x: string]: any;
        fileName?: any;
    }[]>;
    ShpHelper: typeof ShpHelper;
};
export default shp;
export { ShpHelper };
