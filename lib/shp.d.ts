declare function shp(base: any, whiteList: any): Promise<any>;
declare namespace shp {
    var combine: ([shp, dbf]: [any, any]) => {
        [key: string]: any;
    };
    var parseZip: (buffer: any, whiteList?: any) => Promise<any>;
    var getShapefile: (base: any, whiteList: any) => Promise<any>;
    var parseShp: (shp: any, prj: any) => any[];
    var parseDbf: (dbf: any, cpg: any) => any;
}
export default shp;
