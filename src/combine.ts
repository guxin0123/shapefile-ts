
const combine = function (base: string, type: any) {
  if (!type) {
    return base;
  }
  let resUrl = base;
  const shpExt = ["shp", "dbf", "shx", "prj", "sbn"];
  shpExt.map((ext) => {
    if (base.endsWith("." + ext)) {
      resUrl = base.substring(0, base.length - (ext.length + 1));
    }
  })
  const url = new URL(
    (resUrl.startsWith("http") ? "" : location.href) +
    resUrl + "." + type
  )
  return url.href;
};
export default combine;