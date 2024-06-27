import { describe, expect, it } from 'vitest'
import { undoL1ToL2Alias } from './undoL1ToL2Alias.js'

describe('undoL1ToL2Alias', () => {
  it('should undo L1 to L2 alias to an address v1', () => {
    const address = '0x23455678901234567890123456789012345689a1'
    const expectedOriginal = '0x1234567890123456789012345678901234567890'

    const result = undoL1ToL2Alias({ address })

    expect(result).toBe(expectedOriginal)
  })

  it('should undo L1 to L2 alias to an address v2', () => {
    const address = '0x2222000000000000000000000000000000002222'
    const expectedOriginal = '0x1111000000000000000000000000000000001111'

    const result = undoL1ToL2Alias({ address })

    expect(result).toBe(expectedOriginal)
  })

  it('should handle alias offset resulting in negative bigint', () => {
    const address = '0x1234567890123456789012345678901234567000'
    const expectedOriginal = '0x123567890123456789012345678901234565eef'

    const result = undoL1ToL2Alias({ address })

    expect(result).toBe(expectedOriginal)
  })

  it('should handle address equal to alias offset', () => {
    const address = '0x0000000000000000000000000000000000000001'
    const expectedOriginal = '0xeeeeffffffffffffffffffffffffffffffffeef0'

    const result = undoL1ToL2Alias({ address })

    expect(result).toBe(expectedOriginal)
  })
})
