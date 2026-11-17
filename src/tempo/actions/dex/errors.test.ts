import { Value } from 'ox'
import * as tempo from '~test/tempo.js'
import { expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

test('behavior: below minimum order size', async () => {
  const { base } = await tempo.setupTokenPair(client)

  const error = await Actions.dex
    .placeSync(client, { amount: 1n, tick: 0, token: base, type: 'buy' })
    .catch((error) => error)

  expect(error).toBeInstanceOf(Actions.dex.DexBelowMinimumOrderSizeError)
  const { amount, errorName, minimum, name } = error
  expect({ amount, errorName, minimum, name }).toMatchInlineSnapshot(`
    {
      "amount": 1n,
      "errorName": "BelowMinimumOrderSize",
      "minimum": 100000000n,
      "name": "DexBelowMinimumOrderSizeError",
    }
  `)
})

test('behavior: withdraw more than the exchange balance', async () => {
  const { base } = await tempo.setupTokenPair(client)

  const error = await Actions.dex
    .withdrawSync(client, { amount: Value.from('1', 6), token: base })
    .catch((error) => error)

  expect(error).toBeInstanceOf(Actions.dex.DexInsufficientBalanceError)
  expect(error.token).toBe(base)
  const { amount, balance, errorName, name } = error
  expect({ amount, balance, errorName, name }).toMatchInlineSnapshot(`
    {
      "amount": 1000000n,
      "balance": 0n,
      "errorName": "InsufficientBalance",
      "name": "DexInsufficientBalanceError",
    }
  `)
})

test('behavior: pair does not exist', async () => {
  const { token: tokenIn } = await tempo.setupToken(client)
  const { token: tokenOut } = await tempo.setupToken(client)

  const error = await Actions.dex
    .sellSync(client, {
      amountIn: Value.from('1', 6),
      minAmountOut: 0n,
      tokenIn,
      tokenOut,
    })
    .catch((error) => error)

  expect(error).toBeInstanceOf(Actions.dex.DexPairNotFoundError)
  expect(error.tokens).toEqual([tokenIn, tokenOut])
  const { errorName, name } = error
  expect({ errorName, name }).toMatchInlineSnapshot(`
    {
      "errorName": "PairDoesNotExist",
      "name": "DexPairNotFoundError",
    }
  `)
})
