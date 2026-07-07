import * as Value from 'ox/Value'
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

describe('cancel', () => {
  test('default', async () => {
    const { base, quote } = await setupTokenPair('Cancel Default')
    const { orderId } = await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('100', 6),
      type: 'buy',
      tick: 100,
    })
    expect(
      await Actions.dex.getBalance(client, {
        account: account.address,
        token: quote,
      }),
    ).toBe(0n)
    const { receipt, orderId: returnedOrderId } = await Actions.dex.cancelSync(
      client,
      { orderId },
    )
    expect(receipt.status).toBe('success')
    expect(returnedOrderId).toBe(orderId)
    expect(
      await Actions.dex.getBalance(client, {
        account: account.address,
        token: quote,
      }),
    ).toBeGreaterThan(0n)
  })

  test('behavior: only maker can cancel', async () => {
    const { base } = await setupTokenPair('Cancel Maker')
    const { orderId } = await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('100', 6),
      type: 'buy',
      tick: 100,
    })
    await Actions.token.transferSync(client, {
      to: account2.address,
      amount: { formatted: '1' },
      token: tempo.pathUsd,
    })
    await expect(
      Actions.dex.cancelSync(client, { account: account2, orderId }),
    ).rejects.toThrow()
  })

  test('behavior: cannot cancel non-existent order', async () => {
    await expect(
      Actions.dex.cancelSync(client, { orderId: 999999999n }),
    ).rejects.toThrow('The contract function "cancel" reverted')
  })
})
