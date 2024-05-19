import { describe, expect, it } from 'vitest'
import { applyL1ToL2Alias } from './applyL1ToL2Alias.js'

describe('applyL1ToL2Alias', () => {
  it('should apply L1 to L2 alias to an address v1', () => {
    const address = '0x1234567890123456789012345678901234567890'
    const expectedAlias = '0x23455678901234567890123456789012345689a1'

    const result = applyL1ToL2Alias(address)

    expect(result).toBe(expectedAlias)
  })

  it('should apply L1 to L2 alias to an address v2', () => {
    const address = '0x1111000000000000000000000000000000001111'
    const expectedAlias = '0x2222000000000000000000000000000000002222'

    const result = applyL1ToL2Alias(address)

    expect(result).toBe(expectedAlias)
  })
})
