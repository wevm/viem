import { describe, expect, test } from 'vitest'

import { blockParameter } from './blockParameter.js'

describe('blockParameter', () => {
  test('default: returns latest when nothing is provided', () => {
    expect(blockParameter({})).toBe('latest')
  })

  test('blockTag', () => {
    expect(blockParameter({ blockTag: 'safe' })).toBe('safe')
  })

  test('blockNumber: returns native bigint', () => {
    expect(blockParameter({ blockNumber: 69420n })).toBe(69420n)
  })

  test('blockHash (EIP-1898)', () => {
    expect(blockParameter({ blockHash: '0xabc' })).toEqual({
      blockHash: '0xabc',
    })
  })

  test('blockHash + requireCanonical (EIP-1898)', () => {
    expect(
      blockParameter({ blockHash: '0xabc', requireCanonical: true }),
    ).toEqual({ blockHash: '0xabc', requireCanonical: true })
  })

  test('error: requireCanonical without blockHash', () => {
    expect(() =>
      blockParameter({ requireCanonical: true }),
    ).toThrowErrorMatchingInlineSnapshot(
      `
      [BlockParameter.RequireCanonicalError: \`requireCanonical\` can only be provided when \`blockHash\` is set.

      Version: viem@2.52.1]
    `,
    )
  })
})
