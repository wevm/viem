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

test('options: even', () => {
  expect(isHex('0x', { even: true })).toMatchInlineSnapshot('true')
  expect(isHex('0x00', { even: true })).toMatchInlineSnapshot('true')
  expect(isHex('0x0400', { even: true })).toMatchInlineSnapshot('true')
  expect(isHex('0x0', { even: true })).toMatchInlineSnapshot('false')
  expect(isHex('0x400', { even: true })).toMatchInlineSnapshot('false')
  expect(isHex('0x0g', { even: true })).toMatchInlineSnapshot('false')
  expect(isHex('0x0g', { even: true, strict: false })).toMatchInlineSnapshot(
    'true',
  )
  expect(isHex('0xg', { even: true, strict: false })).toMatchInlineSnapshot(
    'false',
  )
  expect(isHex('0x0', { even: false })).toMatchInlineSnapshot('true')
})
