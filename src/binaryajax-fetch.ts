import combine from './combine';

async function binaryAjax(_url: string, type?: string) {
  const url = combine(_url, type);
  const isOptionalTxt = type === 'prj' || type === 'cpg';
  try {
    const resp = await fetch(url, { mode: 'cors' });
    if (resp.status > 399) {
      if(!isOptionalTxt){
        console.error(url + "--" + resp.statusText);
      }
      return false;
    }
    if (isOptionalTxt) {
      return resp.text();
    }
    const parsed = await resp.arrayBuffer();
    return new Uint8Array(parsed);
  } catch (e) {
    console.log('ERROR', e, type);
    if (isOptionalTxt || type === 'dbf') {
      return false;
    }
    throw e;
  }
};
export default binaryAjax;