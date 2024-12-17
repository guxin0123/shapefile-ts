import {ShpReader} from "@/shp-reader";
import {ShpHelper} from "@/shp-helper";


const shp = async function (base: string | Uint8Array, encoding?: string) {
    return await ShpReader.read(base, encoding);
}
shp.ShpHelper = ShpHelper;
shp.ShpReader = ShpReader;

export default shp;
