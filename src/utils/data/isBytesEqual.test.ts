import { expect, test } from 'vitest'

import { isBytesEqual } from './isBytesEqual.js'

test('is bytes', () => {
  // true
  expect(
    isBytesEqual(new Uint8Array([1, 69, 420]), new Uint8Array([1, 69, 420])),
  ).toBeTruthy()
  expect(isBytesEqual('0x1', '0x1')).toBeTruthy()
  expect(isBytesEqual('0x1', '0x01')).toBeTruthy()

  // false
  expect(
    isBytesEqual(new Uint8Array([1, 69, 420]), new Uint8Array([1, 69, 421])),
  ).toBeFalsy()
  expect(isBytesEqual('0x1', '0x2')).toBeFalsy()
  expect(isBytesEqual('0x1', '0x10')).toBeFalsy()
})
