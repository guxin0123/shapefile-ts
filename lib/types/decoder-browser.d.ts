declare function defaultDecoder(data: AllowSharedBufferSource): string;
declare function createDecoder(encoding: string, second?: boolean): typeof defaultDecoder;
export { createDecoder };
