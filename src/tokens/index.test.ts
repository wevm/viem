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
      "ousd",
      "pathusd",
      "reusd",
      "rusd",
      "sbc",
      "siusd",
      "stcusd",
      "susde",
      "syrupusdc",
      "thetausd",
      "usat",
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
