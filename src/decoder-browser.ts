
function defaultDecoder(data: AllowSharedBufferSource) {
  var decoder = new TextDecoder();
  var out = decoder.decode(data);
  return out.replace(/\0/g, '').trim();
}

var regex = /^(?:ANSI\s)?(\d+)$/m;
function createDecoder(encoding: string, second?: boolean) {
  if (!encoding) {
    return defaultDecoder;
  }
  try {
    new TextDecoder(encoding.trim());
  } catch (e) {
    var match = regex.exec(encoding);
    if (match && !second) {
      return createDecoder('windows-' + match[1], true);
    } else {
      return defaultDecoder;
    }
  }
  return browserDecoder;
  function browserDecoder(buffer: AllowSharedBufferSource) {
    var decoder = new TextDecoder(encoding);
    var out = decoder.decode(buffer, {
      stream: true
    }) + decoder.decode();
    return out.replace(/\0/g, '').trim();
  }
}

export { createDecoder }