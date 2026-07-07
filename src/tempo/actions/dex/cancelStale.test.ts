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
  test('default', async () => {
    const { base } = await setupTokenPair()

    // Create a blacklist policy and attach it to the quote token (pathUSD,
    // used for bid escrows).
    const { policyId } = await Actions.policy.createSync(client, {
      type: 'blacklist',
    })
    await Actions.token.changeTransferPolicySync(client, {
      policyId,
      token: tempo.pathUsd,
    })

    // Place a bid order (escrows quote token).
    const { orderId } = await Actions.dex.placeSync(client, {
      amount: Value.from('100', 6),
      tick: 100,
      token: base,
      type: 'buy',
    })

    // Blacklist the maker (ourselves), making the order stale.
    await Actions.policy.modifyBlacklistSync(client, {
      address: account.address,
      policyId,
      restricted: true,
    })

    // Pay fees in alphaUSD: the sender is now blacklisted on pathUSD, so
    // pathUSD fee transfers are forbidden by the policy.
    const { receipt, orderId: returnedOrderId } =
      await Actions.dex.cancelStaleSync(client, {
        feeToken: tempo.alphaUsd,
        orderId,
      })

    expect(receipt.status).toBe('success')
    expect(returnedOrderId).toBe(orderId)

    // Restore the maker so later tests in this file keep a clean slate (the
    // node state is shared across tests within the file).
    await Actions.policy.modifyBlacklistSync(client, {
      address: account.address,
      feeToken: tempo.alphaUsd,
      policyId,
      restricted: false,
    })
  })

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
