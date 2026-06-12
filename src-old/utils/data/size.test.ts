import { expect, test } from 'vitest'

import { size } from './size.js'

test('hex', () => {
  expect(size('0x')).toBe(0)
  expect(size('0x1')).toBe(1)
  expect(size('0x12')).toBe(1)
  expect(size('0x1234')).toBe(2)
  expect(size('0x12345678')).toBe(4)
})

test('bytes', () => {
  expect(size(new Uint8Array([]))).toBe(0)
  expect(size(new Uint8Array([1]))).toBe(1)
  expect(size(new Uint8Array([1, 2]))).toBe(2)
  expect(size(new Uint8Array([1, 2, 3, 4]))).toBe(4)
})
