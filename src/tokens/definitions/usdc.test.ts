import { expect, test } from 'vitest'

import { mainnet } from '../../chains/index.js'
import { usdc } from './usdc.js'

test('resolves the token config for a chain id', () => {
  expect(usdc(mainnet.id)).toMatchInlineSnapshot(`
    {
      "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "decimals": 6,
      "name": "USD Coin",
      "symbol": "USDC",
    }
  `)
})

test('is wired into the chain `tokens` config', () => {
  expect(mainnet.tokens?.usdc).toEqual(usdc(mainnet.id))
})

test('exposes metadata', () => {
  expect(usdc.decimals).toBe(6)
  expect(usdc.symbol).toBe('USDC')
})
