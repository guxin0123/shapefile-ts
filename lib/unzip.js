var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import JSZip from 'jszip';
import { Buffer } from 'buffer';
import iconv from 'iconv-lite';
const unzip = (buffer, encoding) => __awaiter(void 0, void 0, void 0, function* () {
    const zip = new JSZip();
    if (encoding != null) {
        yield zip.loadAsync(buffer, {
            decodeFileName: function (bytes) {
                if (bytes instanceof Buffer) {
                    return iconv.decode(bytes, encoding);
                }
                return "";
            }
        });
    }
    else {
        yield zip.loadAsync(buffer);
    }
    const files = zip.file(/.+/);
    const out = {};
    yield Promise.all(files.map((a) => __awaiter(void 0, void 0, void 0, function* () {
        let result;
        if (a.name.slice(-3).toLowerCase() === 'shp' || a.name.slice(-3).toLowerCase() === 'dbf') {
            result = yield a.async('array');
            result = Buffer.from(result);
        }
        else {
            result = yield a.async('text');
        }
        out[a.name] = result;
    })));
    return out;
});
export default unzip;
//# sourceMappingURL=unzip.js.map