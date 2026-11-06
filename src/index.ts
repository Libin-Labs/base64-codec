export interface Base64Options {
  alphabet?: 'standard' | 'url';
  padding?: boolean;
  maxBytes?: number;
}
function options(o: Base64Options): { alphabet: string; padding: boolean; max: number } {
  if (o.alphabet !== undefined && o.alphabet !== 'standard' && o.alphabet !== 'url')
    throw new TypeError('Invalid alphabet');
  const max = o.maxBytes ?? 16_777_216;
  if (!Number.isSafeInteger(max) || max < 0) throw new RangeError('Invalid maxBytes');
  return {
    alphabet:
      o.alphabet === 'url'
        ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
        : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
    padding: o.padding ?? true,
    max,
  };
}
export function encodeBase64(bytes: Uint8Array, o: Base64Options = {}): string {
  const { alphabet: a, padding, max } = options(o);
  if (bytes.length > max) throw new RangeError('Byte limit exceeded');
  const out: string[] = [];
  for (let i = 0; i < bytes.length; i += 3) {
    const x = bytes[i]!,
      y = bytes[i + 1],
      z = bytes[i + 2];
    out.push(a[x >>> 2]!, a[((x & 3) << 4) | ((y ?? 0) >>> 4)]!);
    if (y !== undefined) out.push(a[((y & 15) << 2) | ((z ?? 0) >>> 6)]!);
    else if (padding) out.push('=');
    if (z !== undefined) out.push(a[z & 63]!);
    else if (padding) out.push('=');
  }
  return out.join('');
}
export function decodeBase64(text: string, o: Base64Options = {}): Uint8Array {
  const { alphabet: a, padding, max } = options(o);
  const first = text.indexOf('='),
    length = first < 0 ? text.length : first,
    pads = text.length - length;
  if (
    length % 4 === 1 ||
    pads > 2 ||
    (first >= 0 && !/^=+(?![\s\S])/.test(text.slice(first))) ||
    (padding ? text.length % 4 !== 0 || pads !== (4 - (length % 4)) % 4 : pads !== 0)
  )
    throw new SyntaxError('Invalid padding');
  const size = Math.floor((length * 6) / 8);
  if (size > max) throw new RangeError('Byte limit exceeded');
  const out = new Uint8Array(size);
  let accumulator = 0,
    bits = 0,
    index = 0;
  for (let i = 0; i < length; i++) {
    const n = a.indexOf(text[i]!);
    if (n < 0) throw new SyntaxError('Invalid Base64 character');
    accumulator = (accumulator << 6) | n;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[index++] = (accumulator >>> bits) & 255;
    }
  }
  if (bits > 0 && (accumulator & ((1 << bits) - 1)) !== 0)
    throw new SyntaxError('Nonzero padding bits');
  return out;
}
