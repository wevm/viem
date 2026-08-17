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

describe('getBuyQuote', () => {
  test('default', async () => {
    const { base, quote } = await setupTokenPair('Buy Quote')
    await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('500', 6),
      type: 'sell',
      tick: 100,
    })
    const amountIn = await Actions.dex.getBuyQuote(client, {
      tokenIn: quote,
      tokenOut: base,
      amountOut: Value.from('100', 6),
    })
    expect(amountIn).toBeGreaterThan(Value.from('100', 6))
  })

  test('behavior: fails with no liquidity', async () => {
    const { base, quote } = await setupTokenPair('Buy Quote Empty')
    await expect(
      Actions.dex.getBuyQuote(client, {
        tokenIn: quote,
        tokenOut: base,
        amountOut: Value.from('100', 6),
      }),
    ).rejects.toThrow(
      'The contract function "quoteSwapExactAmountOut" reverted',
    )
  })
})
