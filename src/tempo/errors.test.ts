import { expect, test } from 'vitest'

import * as errors from './errors.js'

test('InvalidFeeTokenError', () => {
  const error = new errors.InvalidFeeTokenError({ token: '0x20c0…0001' })
  expect(error.name).toBe('InvalidFeeTokenError')
  expect(error.message).toMatchInlineSnapshot(`
    "Fee token "0x20c0…0001" is invalid.

    Fee tokens must be unpaused USD-denominated TIP-20 tokens.
    Use \`client.fee.validateToken({ token })\` before sending transactions or setting fee preferences.

    See: https://viem.sh/tempo/transactions#pay-fees-with-stablecoins
    Version: viem@2.52.1"
  `)
})

test('InvalidFeeTokenError: with cause', () => {
  const cause = new Error('underlying')
  const error = new errors.InvalidFeeTokenError({ cause, token: '0x20c0…0001' })
  expect(error.cause).toBe(cause)
})

test('FeeTokenNotTip20Error', () => {
  const error = new errors.FeeTokenNotTip20Error({ token: '0x0000…0001' })
  expect(error.name).toBe('FeeTokenNotTip20Error')
  expect(error.message).toMatchInlineSnapshot(`
    "Fee token "0x0000…0001" is not a TIP-20 token.

    Fee tokens must be TIP-20 token addresses or token IDs.
    TIP-20 token addresses use the \`0x20c0...\` address prefix.

    See: https://viem.sh/tempo/transactions#pay-fees-with-stablecoins
    Version: viem@2.52.1"
  `)
})

test('FeeTokenNotUsdError', () => {
  const error = new errors.FeeTokenNotUsdError({
    currency: 'EUR',
    token: '0x20c0…0001',
  })
  expect(error.name).toBe('FeeTokenNotUsdError')
  expect(error.message).toMatchInlineSnapshot(`
    "Fee token "0x20c0…0001" is denominated in "EUR", not "USD".

    Only USD-denominated TIP-20 tokens can be used as fee tokens.

    See: https://viem.sh/tempo/transactions#pay-fees-with-stablecoins
    Version: viem@2.52.1"
  `)
})

test('FeeTokenPausedError', () => {
  const error = new errors.FeeTokenPausedError({ token: '0x20c0…0001' })
  expect(error.name).toBe('FeeTokenPausedError')
  expect(error.message).toMatchInlineSnapshot(`
    "Fee token "0x20c0…0001" is paused.

    Paused TIP-20 tokens cannot be used as fee tokens.

    See: https://viem.sh/tempo/transactions#pay-fees-with-stablecoins
    Version: viem@2.52.1"
  `)
})
