export interface ShpReaderObj {
    shp: ArrayBuffer;
    dbf: ArrayBuffer;
    prj: ArrayBuffer | string;
    cpg: ArrayBuffer | string;
}