import { describe, expect, test } from 'vitest'
import * as BlockHashHistory from './BlockHashHistory.js'

describe('BlockHashHistory', () => {
  test('encodes and decodes selectorless input', () => {
    const input = BlockHashHistory.encodeInput(31_772_336n)
    expect(input).toHaveLength(66)
    expect(BlockHashHistory.decodeInput(input)).toBe(31_772_336n)
  })

  test('decodes a bytes32 output', () => {
    const hash = `0x${'12'.repeat(32)}` as const
    expect(BlockHashHistory.decodeOutput(hash)).toBe(hash)
  })

  test('rejects malformed raw data', () => {
    expect(() => BlockHashHistory.decodeInput('0x01')).toThrow(RangeError)
    expect(() => BlockHashHistory.decodeOutput('0x01')).toThrow(RangeError)
  })
})
