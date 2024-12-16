import {ShpHelper} from "@/shp-helper";
import {ParseDbf} from "./parse-dbf";
import {ParseShp} from "./parse-shp";
import {ShpReader} from "@/shp-reader";

const shp = async function (base: string | Uint8Array, encoding?: string) {
    return await ShpReader.read(base, encoding);
}
shp.ShpHelper = ShpHelper;
shp.ShpReader = ShpReader;

export default shp;
export {ShpHelper, ParseDbf, ParseShp}
