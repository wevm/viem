import { expect, test } from 'vitest'

import { isHex } from './isHex.js'

test('is hex', () => {
  expect(isHex('0x')).toBeTruthy()
  expect(isHex('0x00')).toBeTruthy()
  expect(isHex('0x0123456789abcdef')).toBeTruthy()
  expect(isHex('0x0123456789abcdefABCDEF')).toBeTruthy()
  expect(isHex('0x0123456789abcdefg')).toBeFalsy()
  expect(isHex('0x0123456789abcdefg', { strict: false })).toBeTruthy()
  expect(isHex({ foo: 'bar' })).toBeFalsy()
  expect(isHex(undefined)).toBeFalsy()
})

test('is hex - strict mode rejects odd nibble count', () => {
  // odd nibble count → invalid in strict mode
  expect(isHex('0x0')).toBeFalsy()
  expect(isHex('0xabc')).toBeFalsy()
  expect(isHex('0x12345')).toBeFalsy()
  // even nibble count → valid
  expect(isHex('0x0', { strict: false })).toBeTruthy()
  expect(isHex('0xabc', { strict: false })).toBeTruthy()
})
