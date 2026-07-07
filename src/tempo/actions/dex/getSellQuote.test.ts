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

describe('getSellQuote', () => {
  test('default', async () => {
    const { base, quote } = await setupTokenPair('Sell Quote')
    await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('500', 6),
      type: 'buy',
      tick: -100,
    })
    const amountOut = await Actions.dex.getSellQuote(client, {
      tokenIn: base,
      tokenOut: quote,
      amountIn: Value.from('100', 6),
    })
    expect(amountOut).toBeGreaterThan(0n)
    expect(amountOut).toBeLessThan(Value.from('100', 6))
  })

  test('behavior: fails with no liquidity', async () => {
    const { base, quote } = await setupTokenPair('Sell Quote Empty')
    await expect(
      Actions.dex.getSellQuote(client, {
        tokenIn: base,
        tokenOut: quote,
        amountIn: Value.from('100', 6),
      }),
    ).rejects.toThrow('The contract function "quoteSwapExactAmountIn" reverted')
  })
})
