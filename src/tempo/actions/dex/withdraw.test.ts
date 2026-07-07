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

describe('withdraw', () => {
  test('default', async () => {
    const { base, quote } = await setupTokenPair('Withdraw Default')
    const { orderId } = await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('100', 6),
      type: 'buy',
      tick: 100,
    })
    await Actions.dex.cancelSync(client, { orderId })
    const dexBalance = await Actions.dex.getBalance(client, {
      account: account.address,
      token: quote,
    })
    expect(dexBalance).toBeGreaterThan(0n)
    const walletBefore = await Actions.token.getBalance(client, {
      token: quote,
    })
    expect(
      (
        await Actions.dex.withdrawSync(client, {
          token: quote,
          amount: dexBalance,
        })
      ).receipt.status,
    ).toBe('success')
    expect(
      await Actions.dex.getBalance(client, {
        account: account.address,
        token: quote,
      }),
    ).toBe(0n)
    const walletAfter = await Actions.token.getBalance(client, { token: quote })
    expect(walletAfter.amount).toBeGreaterThan(walletBefore.amount)
  })
})
