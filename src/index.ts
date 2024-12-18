import {ShpReader} from "@/shp-reader";
import {ShpHelper} from "@/shp-helper";
import {ParseShp} from "./parse-shp";
import {ParseDbf} from "./parse-dbf";


const shp = async function (base: string | Uint8Array, encoding?: string) {
    return await ShpReader.read(base, encoding);
}
shp.ShpHelper = ShpHelper;
shp.ShpReader = ShpReader;

//export default shp;
export {shp, ShpReader, ShpHelper, ParseShp, ParseDbf};