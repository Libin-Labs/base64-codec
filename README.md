# @lp-labs/base64-codec

Strict byte-oriented standard and URL-safe Base64 without Buffer.

## Install

```sh
npm install @lp-labs/base64-codec
```

Node.js 18+; standalone browser-compatible ES2022 core with DOM codec types. Zero runtime or peer dependencies. ESM and CommonJS with separate declarations. No filesystem, network or environment side effects.

## Quickstart

```js
import { encodeBase64, decodeBase64 } from '@lp-labs/base64-codec';
console.log(encodeBase64(decodeBase64('SGVsbG8=')));
```

CommonJS consumers use `const api = require('@lp-labs/base64-codec')`. The same named API is available in both module formats. No default export.

## API, behavior, errors and limits

encodeBase64 and decodeBase64 use standard alphabet and required canonical padding by default. Set alphabet: 'url' and padding: false for unpadded Base64url; padding: false rejects '=' entirely. No whitespace, alphabet mixing, or nonzero unused bits are accepted. maxBytes defaults to 16,777,216 and limits input bytes for encoding and decoded bytes for decoding. Outputs are newly owned. SyntaxError denotes malformed text; RangeError denotes invalid/exceeded limits; TypeError denotes invalid alphabet. Linear time and output space; input text length is caller-owned.

All exports: `Base64Options`, `encodeBase64`, `decodeBase64`.

## Full TypeScript declarations

```ts
export interface Base64Options {
  alphabet?: 'standard' | 'url';
  padding?: boolean;
  maxBytes?: number;
}
export declare function encodeBase64(bytes: Uint8Array, o?: Base64Options): string;
export declare function decodeBase64(text: string, o?: Base64Options): Uint8Array;
```

## Development

```sh
npm ci --offline
npm run typecheck
npm test
npm run format:check
```

TypeScript ^5.9.3 and Prettier ^3.6.2 are development-only. Build emits dist/esm and dist/cjs. Tests use Node's test runner; consumer.mts and consumer.cts exercise bare package imports including negative type assertions.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
