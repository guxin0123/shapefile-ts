import { Buffer } from 'buffer';
import  combine  from './combine';



function binaryAjax (_url, type?) {
  return new Promise(function (resolve, reject) {
    const url = combine(_url, type);
    const ajax = new XMLHttpRequest();
    ajax.open('GET', url, true);
    if (type !== 'prj' && type !== 'cpg') {
      ajax.responseType = 'arraybuffer';
    }
    ajax.addEventListener('load', function () {
      if (ajax.status > 399) {
        if (type === 'prj' || type === 'cpg') {
          return resolve(false);
        } else {
          return reject(new Error(ajax.status.toString()));
        }
      }
      if (type !== 'prj' && type !== 'cpg') {
        return resolve(Buffer.from(ajax.response));
      } else {
        return resolve(ajax.response);
      }
    }, false);
    ajax.send();
  });
}
export default binaryAjax;