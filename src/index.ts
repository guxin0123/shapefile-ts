import {ShpHelper} from "@/shp-helper";


const shp = async function (base: string | Uint8Array, whiteList?: Array<string>, encoding?: string) {
    const sp = new ShpHelper();
    return await sp.getShapefile(base, whiteList, encoding);
}
shp.ShpHelper=ShpHelper;

export default shp;
export {ShpHelper}
