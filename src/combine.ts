
const combine=function (base, type)  {
  if (!type) {
    return base;
  }
  const url = new URL(location.href+base);
  url.pathname = `${url.pathname}.${type}`;
  return url.href;
};
export default combine;