import { describe, expect, test } from 'vitest'

import { arrayRegex, bytesRegex, integerRegex } from './regex.js'

describe('arrayRegex', () => {
  test('matches array types', () => {
    expect(arrayRegex.test('uint256[3]')).toBe(true)
    expect(arrayRegex.test('bytes32[]')).toBe(true)
    expect(arrayRegex.test('address[10]')).toBe(true)
  })

  test('does not match non-array types', () => {
    expect(arrayRegex.test('uint256')).toBe(false)
    expect(arrayRegex.test('address')).toBe(false)
  })
})

describe('bytesRegex', () => {
  test('matches valid bytes types', () => {
    expect(bytesRegex.test('bytes')).toBe(true)
    expect(bytesRegex.test('bytes1')).toBe(true)
    expect(bytesRegex.test('bytes16')).toBe(true)
    expect(bytesRegex.test('bytes32')).toBe(true)
  })

  test('does not match invalid bytes types', () => {
    expect(bytesRegex.test('bytes0')).toBe(false)
    expect(bytesRegex.test('bytes33')).toBe(false)
    expect(bytesRegex.test('bytes256')).toBe(false)
  })
})

describe('integerRegex', () => {
  test('matches valid integer types', () => {
    expect(integerRegex.test('uint8')).toBe(true)
    expect(integerRegex.test('int256')).toBe(true)
    expect(integerRegex.test('uint')).toBe(true)
    expect(integerRegex.test('int')).toBe(true)
  })

  test('does not match invalid integer types', () => {
    expect(integerRegex.test('uint7')).toBe(false)
    expect(integerRegex.test('int3')).toBe(false)
    expect(integerRegex.test('uint512')).toBe(false)
  })
})
