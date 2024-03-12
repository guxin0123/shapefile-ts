var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fallback from './binaryajax-browser';
import combine from './combine';
import { Buffer } from 'buffer';
function binaryAjax(_url, type) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!global.fetch) {
            return fallback(_url, type);
        }
        const url = combine(_url, type);
        const isOptionalTxt = type === 'prj' || type === 'cpg';
        try {
            const resp = yield fetch(url);
            if (resp.status > 399) {
                throw new Error(resp.statusText);
            }
            if (isOptionalTxt) {
                return resp.text();
            }
            const parsed = yield resp.arrayBuffer();
            return Buffer.from(parsed);
        }
        catch (e) {
            console.log('ERROR', e, type);
            if (isOptionalTxt || type === 'dbf') {
                return false;
            }
            throw e;
        }
    });
}
;
export default binaryAjax;
//# sourceMappingURL=binaryajax-fetch.js.map