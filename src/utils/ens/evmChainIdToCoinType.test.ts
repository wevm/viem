import { expect, test } from 'vitest'

import { evmChainIdToCoinType } from './evmChainIdToCoinType.js'

test.each([
  {
    chainId: 0,
    expected: 2147483648n,
  },
  {
    chainId: 1,
    expected: 2147483649n,
  },
  {
    chainId: 8453,
    expected: 2147492101n,
  },
  {
    chainId: 0x7fffffff,
    expected: 4294967295n,
  },
])('evmChainIdToCoinType($chainId) -> $expected', ({ chainId, expected }) => {
  expect(evmChainIdToCoinType(chainId)).toBe(expected)
})

test('only positive chainIds', () => {
  expect(() => evmChainIdToCoinType(-1)).toThrowErrorMatchingInlineSnapshot(`
    [EnsInvalidChainIdError: Invalid ENSIP-11 chainId: -1. Must be between 0 and 0x7fffffff.

    Version: viem@x.y.z]
  `)
})

test('less than 0x80000000', () => {
  expect(() =>
    evmChainIdToCoinType(0x80000000),
  ).toThrowErrorMatchingInlineSnapshot(`
    [EnsInvalidChainIdError: Invalid ENSIP-11 chainId: 2147483648. Must be between 0 and 0x7fffffff.

    Version: viem@x.y.z]
  `)
})
