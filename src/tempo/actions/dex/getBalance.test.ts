import { Value } from 'ox'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
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

describe('getBalance', () => {
  test('default', async () => {
    const { base, quote } = await setupTokenPair('Balance Default')
    expect(
      await Actions.dex.getBalance(client, {
        account: account.address,
        token: quote,
      }),
    ).toBe(0n)
    const { orderId } = await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('100', 6),
      type: 'buy',
      tick: 50,
    })
    await Actions.dex.cancelSync(client, { orderId })
    expect(
      await Actions.dex.getBalance(client, {
        account: account.address,
        token: quote,
      }),
    ).toBeGreaterThan(0n)
  })

  test('behavior: check different account', async () => {
    const { quote } = await setupTokenPair('Balance Account')
    expect(
      await Actions.dex.getBalance(client, {
        account: account2.address,
        token: quote,
      }),
    ).toBe(0n)
  })

  test('behavior: balances are per-token', async () => {
    const { base, quote } = await setupTokenPair('Balance Token')
    const { orderId } = await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('100', 6),
      type: 'buy',
      tick: 100,
    })
    await Actions.dex.cancelSync(client, { orderId })
    expect(
      await Actions.dex.getBalance(client, {
        account: account.address,
        token: quote,
      }),
    ).toBeGreaterThan(0n)
    expect(
      await Actions.dex.getBalance(client, {
        account: account.address,
        token: base,
      }),
    ).toBe(0n)
  })
})
