
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
export default combine;