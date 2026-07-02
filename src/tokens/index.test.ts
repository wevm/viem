import { expect, test } from 'vitest'

import * as tokens from './index.js'

test('exports', () => {
  expect(Object.keys(tokens)).toMatchInlineSnapshot(`
    [
      "defineToken",
      "alphausd",
      "betausd",
      "brla",
      "cbbtc",
      "chfau",
      "cirbtc",
      "cusd",
      "dlusd",
      "eurau",
      "eurc",
      "eurce",
      "frxusd",
      "gbpa",
      "gusd",
      "iusd",
      "pathusd",
      "reusd",
      "rusd",
      "sbc",
      "siusd",
      "stcusd",
      "susde",
      "syrupusdc",
      "thetausd",
      "usd1",
      "usdb",
      "usdc",
      "usdce",
      "usde",
      "usdt0",
      "usyc",
      "wsrusd",
      "tokens",
    ]
  `)
})
