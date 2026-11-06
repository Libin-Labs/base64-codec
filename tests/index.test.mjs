import assert from 'node:assert/strict';
import { test } from 'node:test';
import { encodeBase64, decodeBase64 } from '../dist/esm/index.js';

test('RFC vectors and oracle', () => {
  for (const s of ['', 'f', 'fo', 'foo', 'foobar']) {
    const b = new TextEncoder().encode(s);
    assert.equal(encodeBase64(b), Buffer.from(b).toString('base64'));
    assert.deepEqual(decodeBase64(encodeBase64(b)), b);
  }
});
test('url alphabet', () => {
  const b = new Uint8Array([255, 254]);
  assert.equal(encodeBase64(b, { alphabet: 'url', padding: false }), '__4');
  assert.deepEqual(decodeBase64('__4', { alphabet: 'url', padding: false }), b);
});
test('strict padding', () => {
  for (const s of ['Zg', 'Zg=', 'Zg===', 'Z=g=', 'A==='])
    assert.throws(() => decodeBase64(s), SyntaxError);
});
test('characters and trailing bits', () => {
  for (const s of ['Zh==', 'Zm9=', ' Zg==', '-w==', 'é==='])
    assert.throws(() => decodeBase64(s), SyntaxError);
});
test('exact bounds', () => {
  assert.equal(decodeBase64('Zg==', { maxBytes: 1 }).length, 1);
  assert.throws(() => decodeBase64('Zg==', { maxBytes: 0 }), RangeError);
  assert.throws(() => encodeBase64(new Uint8Array(1), { maxBytes: 0 }), RangeError);
});
test('owned output and empty', () => {
  const a = decodeBase64('AA=='),
    b = decodeBase64('AA==');
  a[0] = 4;
  assert.equal(b[0], 0);
  assert.equal(decodeBase64('').length, 0);
  assert.throws(() => decodeBase64('AA==', { padding: false }));
});
test('deterministic bytes standard and url oracle', () => {
  let state = 0x12345678;
  for (let length = 0; length < 257; length++) {
    const bytes = Uint8Array.from({ length }, () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state >>> 24;
    });
    for (const alphabet of ['standard', 'url'])
      for (const padding of [true, false]) {
        const options = { alphabet, padding };
        let expected = Buffer.from(bytes).toString(alphabet === 'url' ? 'base64url' : 'base64');
        if (padding) expected = expected.padEnd(Math.ceil(expected.length / 4) * 4, '=');
        else expected = expected.replace(/=+$/, '');
        assert.equal(encodeBase64(bytes, options), expected);
        assert.deepEqual(decodeBase64(expected, options), bytes);
      }
  }
});
test('reject final controls, mixed alphabets and noncanonical url bits', () => {
  for (const text of ['AA=\n', 'AA=\r', 'AA==\n', 'AA==\r\n', 'AA== ', 'AA==\0', 'AB==']) {
    assert.throws(() => decodeBase64(text));
  }
  assert.throws(() => decodeBase64('/w', { alphabet: 'url', padding: false }));
  assert.throws(() => decodeBase64('_x', { alphabet: 'url', padding: false }));
});
test('invalid limits and input ownership', () => {
  for (const maxBytes of [-1, 0.1, NaN, Infinity]) {
    assert.throws(() => decodeBase64('', { maxBytes }), RangeError);
  }
  const bytes = new Uint8Array([1, 2, 3]);
  encodeBase64(bytes);
  assert.deepEqual(bytes, new Uint8Array([1, 2, 3]));
});
