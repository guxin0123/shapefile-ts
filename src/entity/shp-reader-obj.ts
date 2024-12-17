export interface ShpReaderObj {
    shp: ArrayBuffer;
    dbf: ArrayBuffer;
    prj: ArrayBuffer | string | undefined;
    cpg: ArrayBuffer | string | undefined;
}