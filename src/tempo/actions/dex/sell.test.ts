import { Value } from 'ox'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

async function setupTokenPair(name: string) {
  const { token: base } = await Actions.token.createSync(client, {
    currency: 'USD',
    name,
    symbol: name.slice(0, 8).toUpperCase(),
  })
  await Actions.token.grantRolesSync(client, {
    roles: ['issuer'],
    to: account.address,
    token: base,
  })
  await Actions.token.mintSync(client, {
    amount: Value.from('1000000', 6),
    to: account.address,
    token: base,
  })
  const { quote } = await Actions.dex.createPairSync(client, { base })
  return { base, quote }
}

describe('sell', () => {
  test('default', async () => {
    const { base, quote } = await setupTokenPair('Sell Default')
    await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('500', 6),
      type: 'buy',
      tick: -100,
    })
    expect(
      (
        await Actions.dex.sellSync(client, {
          tokenIn: base,
          tokenOut: quote,
          amountIn: Value.from('100', 6),
          minAmountOut: Value.from('50', 6),
        })
      ).receipt.status,
    ).toBe('success')
  })

  test('behavior: respects minAmountOut', async () => {
    const { base, quote } = await setupTokenPair('Sell Min')
    await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('500', 6),
      type: 'buy',
      tick: -1000,
    })
    await expect(
      Actions.dex.sellSync(client, {
        tokenIn: base,
        tokenOut: quote,
        amountIn: Value.from('100', 6),
        minAmountOut: Value.from('150', 6),
      }),
    ).rejects.toThrow('The contract function "swapExactAmountIn" reverted')
  })

  test('behavior: fails with insufficient liquidity', async () => {
    const { base, quote } = await setupTokenPair('Sell Empty')
    await expect(
      Actions.dex.sellSync(client, {
        tokenIn: base,
        tokenOut: quote,
        amountIn: Value.from('100', 6),
        minAmountOut: Value.from('100', 6),
      }),
    ).rejects.toThrow('The contract function "swapExactAmountIn" reverted')
  })
})
