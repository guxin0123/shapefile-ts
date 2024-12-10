export class DecoderUtils {
    static defaultCodeList = {
        'zh-CN': 'GB18030',
        'zh-TW': 'big5',
        'ja-JP': 'euc-jp',
        'ko-KR': 'euc-KR',
        'ru': 'windows-1251'
    }

    static regex = /^(?:ANSI\s)?(\d+)$/m;
    static defaultDecoder = (data: ArrayBuffer) => {
        const uint8Array = new Uint8Array(data)
        let decoderLabel = this.isUTF8(uint8Array) ? 'UTF-8' : this.defaultCodeList[navigator.language];
        const decoder = new TextDecoder(decoderLabel);
        const out = decoder.decode(data);
        return out.replace(/\0/g, '').trim();
    }

    static createDecoder(encoding: string, second?: boolean) {
        if (!encoding) {
            return this.defaultDecoder;
        }
        try {
            new TextDecoder(encoding.trim());
        } catch (e) {
            const match = this.regex.exec(encoding);
            if (match && !second) {
                return this.createDecoder('windows-' + match[1], true);
            } else {
                return this.defaultDecoder;
            }
        }
        return browserDecoder;

        function browserDecoder(buffer: AllowSharedBufferSource) {
            const decoder = new TextDecoder(encoding);
            const out = decoder.decode(buffer, {
                stream: true
            }) + decoder.decode();
            return out.replace(/\0/g, '').trim();
        }
    }

    static isUTF8(uint8Array) {
        const length = uint8Array.length;
        let singleByteCount = 0;
        let multiByteCount = 0;
        let invalidCount = 0;

        for (let i = 0; i < length; i++) {
            const byte = uint8Array[i];

            // dbf 0x20 is space
            if (byte == 0x20 || byte == 0x00) {
                continue;
            }
            if (byte <= 0x7F) {
                // Single-byte character (0x00-0x7F)
                singleByteCount++;
            } else if (byte >= 0xC2 && byte <= 0xDF) {
                // Two-byte character (0xC2-0xDF followed by 0x80-0xBF)
                if (i + 1 < length && uint8Array[i + 1] >= 0x80 && uint8Array[i + 1] <= 0xBF) {
                    multiByteCount++;
                    i++;
                } else {
                    invalidCount++;
                }
            } else if (byte >= 0xE0 && byte <= 0xEF) {
                // Three-byte character (0xE0-0xEF followed by 0x80-0xBF and 0x80-0xBF)
                if (i + 2 < length && uint8Array[i + 1] >= 0x80 && uint8Array[i + 1] <= 0xBF &&
                    uint8Array[i + 2] >= 0x80 && uint8Array[i + 2] <= 0xBF) {
                    multiByteCount++;
                    i += 2;
                } else {
                    invalidCount++;
                }
            } else if (byte >= 0xF0 && byte <= 0xF4) {
                // Four-byte character (0xF0-0xF4 followed by 0x80-0xBF, 0x80-0xBF, and 0x80-0xBF)
                if (i + 3 < length && uint8Array[i + 1] >= 0x80 && uint8Array[i + 1] <= 0xBF &&
                    uint8Array[i + 2] >= 0x80 && uint8Array[i + 2] <= 0xBF &&
                    uint8Array[i + 3] >= 0x80 && uint8Array[i + 3] <= 0xBF) {
                    multiByteCount++;
                    i += 3;
                } else {
                    invalidCount++;
                }
            } else {
                // Invalid byte for UTF-8
                invalidCount++;
            }
        }

        // If the majority of the bytes are valid UTF-8 patterns, consider it UTF-8
        const totalValid = singleByteCount + multiByteCount;
        const totalInvalid = invalidCount;
        //console.log(totalValid > totalInvalid)
        return totalValid > totalInvalid;
    }


}
