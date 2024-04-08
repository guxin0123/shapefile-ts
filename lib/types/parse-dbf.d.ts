declare function dbfHeader(data: Uint8Array): {
    [key: string]: any;
};
declare const parseDbf: (buffer: Uint8Array, encoding: string) => any[];
export { parseDbf, dbfHeader };
