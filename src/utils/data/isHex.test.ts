import { expect, test } from 'vitest'

import { isHex } from './isHex.js'

test('is hex', () => {
  expect(isHex('0x')).toBeTruthy()
  expect(isHex('0x0')).toBeTruthy()
  expect(isHex('0x0123456789abcdef')).toBeTruthy()
  expect(isHex('0x0123456789abcdefABCDEF')).toBeTruthy()
  expect(isHex('0x0123456789abcdefg')).toBeFalsy()
  expect(isHex('0x0123456789abcdefg', { strict: false })).toBeTruthy()
  expect(isHex({ foo: 'bar' })).toBeFalsy()
  expect(isHex(undefined)).toBeFalsy()
})
