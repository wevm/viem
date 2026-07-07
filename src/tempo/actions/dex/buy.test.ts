import * as Value from 'ox/Value'
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

describe('buy', () => {
  test('default', async () => {
    const { base, quote } = await setupTokenPair('Buy Default')
    await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('500', 6),
      type: 'sell',
      tick: 100,
    })
    const before = await Actions.token.getBalance(client, { token: base })
    const { receipt } = await Actions.dex.buySync(client, {
      tokenIn: quote,
      tokenOut: base,
      amountOut: Value.from('100', 6),
      maxAmountIn: Value.from('150', 6),
    })
    expect(receipt.status).toBe('success')
    const after = await Actions.token.getBalance(client, { token: base })
    expect(after.amount).toBeGreaterThan(before.amount)
  })

  test('behavior: respects maxAmountIn', async () => {
    const { base, quote } = await setupTokenPair('Buy Max')
    await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('500', 6),
      type: 'sell',
      tick: 1000,
    })
    await expect(
      Actions.dex.buySync(client, {
        tokenIn: quote,
        tokenOut: base,
        amountOut: Value.from('100', 6),
        maxAmountIn: Value.from('100', 6),
      }),
    ).rejects.toThrow('The contract function "swapExactAmountOut" reverted')
  })

  test('behavior: fails with insufficient liquidity', async () => {
    const { base, quote } = await setupTokenPair('Buy Empty')
    await expect(
      Actions.dex.buySync(client, {
        tokenIn: quote,
        tokenOut: base,
        amountOut: Value.from('100', 6),
        maxAmountIn: Value.from('150', 6),
      }),
    ).rejects.toThrow('The contract function "swapExactAmountOut" reverted')
  })
})
