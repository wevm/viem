import { expect, test } from 'vitest'

import { parseClientDataSuffix } from './parseClientDataSuffix.js'

test('undefined input returns undefined', () => {
  expect(parseClientDataSuffix(undefined)).toBe(undefined)
})

test('hex string returns the string', () => {
  expect(parseClientDataSuffix('0x12345678')).toBe('0x12345678')
})

test('object with value returns the value', () => {
  expect(parseClientDataSuffix({ value: '0x12345678' })).toBe('0x12345678')
})

test('object with required: true returns the value', () => {
  expect(parseClientDataSuffix({ value: '0xabcdef', required: true })).toBe(
    '0xabcdef',
  )
})

test('object with required: false returns the value', () => {
  expect(parseClientDataSuffix({ value: '0xdeadbeef', required: false })).toBe(
    '0xdeadbeef',
  )
})
