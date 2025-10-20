import { expect, test } from 'vitest'

import { toCoinType } from './toCoinType.js'

test.each([
  {
    chainId: 0,
    expected: 2147483648n,
  },
  {
    chainId: 1,
    expected: 60n,
  },
  {
    chainId: 8453,
    expected: 2147492101n,
  },
  {
    chainId: 0x7fffffff,
    expected: 4294967295n,
  },
])('toCoinType($chainId) -> $expected', ({ chainId, expected }) => {
  expect(toCoinType(chainId)).toBe(expected)
})

test('only positive chainIds', () => {
  expect(() => toCoinType(-1)).toThrowErrorMatchingInlineSnapshot(`
    [EnsInvalidChainIdError: Invalid ENSIP-11 chainId: -1. Must be between 0 and 0x7fffffff, or 1.

    Version: viem@x.y.z]
  `)
})

test('less than 0x80000000', () => {
  expect(() => toCoinType(0x80000000)).toThrowErrorMatchingInlineSnapshot(`
    [EnsInvalidChainIdError: Invalid ENSIP-11 chainId: 2147483648. Must be between 0 and 0x7fffffff, or 1.

    Version: viem@x.y.z]
  `)
})
