
function defaultDecoder(data: AllowSharedBufferSource) {
  const decoder = new TextDecoder();
  const out = decoder.decode(data);
  return out.replace(/\0/g, '').trim();
}

const regex = /^(?:ANSI\s)?(\d+)$/m;

function createDecoder(encoding: string, second?: boolean) {
  if (!encoding) {
    return defaultDecoder;
  }
  try {
    new TextDecoder(encoding.trim());
  } catch (e) {
    const match = regex.exec(encoding);
    if (match && !second) {
      return createDecoder('windows-' + match[1], true);
    } else {
      return defaultDecoder;
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

export { createDecoder }