import * as Value from 'ox/Value'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

async function setupTokenPair() {
  const { token: base } = await Actions.token.createSync(client, {
    currency: 'USD',
    name: 'Cancel Stale Token',
    symbol: 'CSTALE',
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
  await Actions.dex.createPairSync(client, { base })
  return { base }
}

describe('cancelStale', () => {
  test.todo('default (blocked: policy)')

  test('behavior: cannot cancel non-stale order', async () => {
    const { base } = await setupTokenPair()
    const { orderId } = await Actions.dex.placeSync(client, {
      token: base,
      amount: Value.from('100', 6),
      type: 'buy',
      tick: 100,
    })
    await expect(
      Actions.dex.cancelStaleSync(client, { orderId }),
    ).rejects.toThrow('The contract function "cancelStaleOrder" reverted')
  })
})
