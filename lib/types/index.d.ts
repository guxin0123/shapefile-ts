declare const shp: (base: string | Uint8Array | ArrayBuffer, whiteList?: Array<string>, encoding?: string) => Promise<{
    [key: string]: any;
} | {
    [x: string]: any;
    fileName?: any;
}[]>;
export default shp;
