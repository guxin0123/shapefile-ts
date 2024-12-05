async function binaryAjax(_url: string, type?: string) {
    const url = combine(_url, type);
    const isOptionalTxt = type === 'prj' || type === 'cpg';
    try {
        const resp = await fetch(url, {mode: 'cors'});
        if (resp.status > 399) {
            if (!isOptionalTxt) {
                console.error(url + "--" + resp.statusText);
            }
            return false;
        }
        if (isOptionalTxt) {
            return resp.text();
        }
        return new Uint8Array(await resp.arrayBuffer());
    } catch (e) {
        console.log('ERROR', e, type);
        if (isOptionalTxt || type === 'dbf') {
            return false;
        }
        throw e;
    }
}
const combine = function (base: string, type: any) {
    if (!type) {
        return base;
    }
    let resUrl = base.startsWith("http") ? new URL(base) : new URL(base, location.href);
    const shpExt = ["shp", "dbf", "shx", "prj", "sbn"];
    shpExt.map((ext) => {
        if (resUrl.pathname.endsWith("." + ext)) {
            resUrl.pathname = resUrl.pathname.substring(0, resUrl.pathname.length - (ext.length + 1));
        }
    })

    resUrl.pathname = resUrl.pathname + "." + type;
    return resUrl.href;
};
export default binaryAjax;