import proj4 from "proj4";
declare const ParseShpFile: (buffer: Uint8Array, trans: string | boolean | proj4.Converter) => any[];
export default ParseShpFile;
