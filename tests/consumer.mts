import { encodeBase64, decodeBase64 } from '@lp-labs/base64-codec';
const value: Uint8Array = decodeBase64(encodeBase64(new Uint8Array([1])));
void value;
// @ts-expect-error bytes required
encodeBase64('no');
