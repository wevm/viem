import { expect, test } from 'vitest'

import { Token } from 'viem'

const token = Token.from({
  addresses: {
    1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  },
  currency: 'USD',
  decimals: 6,
  name: 'USD Coin',
  popular: true,
  symbol: 'USDC',
})

test('resolves a token config for a chain id', () => {
  expect(token(1)).toMatchInlineSnapshot(`
    {
      "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "currency": "USD",
      "decimals": 6,
      "name": "USD Coin",
      "popular": true,
      "symbol": "USDC",
    }
  `)
})

test('exposes metadata and the addresses map', () => {
  expect(token.currency).toBe('USD')
  expect(token.decimals).toBe(6)
  expect(token.name).toBe('USD Coin')
  expect(token.popular).toBe(true)
  expect(token.symbol).toBe('USDC')
  expect(token.addresses[8453]).toBe(
    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  )
})

test('behavior: throws when no address for chain id', () => {
  expect(() =>
    // @ts-expect-error chain id not in `addresses`
    token(999),
  ).toThrowErrorMatchingInlineSnapshot(`
    [Token.AddressNotFoundError: Token has no address for chain id "999".

    Version: viem@2.52.1]
  `)
})
