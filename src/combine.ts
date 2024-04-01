
const combine=function (base: string, type: any)  {
  if (!type) {
    return base;
  }
  const url = new URL(location.href+base);
  url.pathname = `${url.pathname}.${type}`;
  return url.href;
};
export default combine;