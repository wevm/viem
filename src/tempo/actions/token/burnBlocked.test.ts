import { Value } from 'ox'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const client = tempo.getClient({ feeToken: tempo.pathUsd })
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const client2 = tempo.getClient({ account: account2, feeToken: tempo.pathUsd })

/** Creates a token, mints to `account2`, and blocks it via a blacklist policy. */
async function setupBlockedToken(name: string, symbol: string) {
  const { token } = await Actions.token.createSync(client, {
    currency: 'USD',
    name,
    symbol,
  })
  await Actions.token.grantRolesSync(client, {
    roles: ['issuer', 'burnBlocked'],
    to: client.account!.address,
    token,
  })
  await Actions.token.mintSync(client, {
    amount: Value.from('1000', 6),
    to: account2.address,
    token,
  })
  const { policyId } = await Actions.policy.createSync(client, {
    addresses: [account2.address],
    type: 'blacklist',
  })
  await Actions.token.changeTransferPolicySync(client, { policyId, token })
  return token
}

describe('burnBlocked', () => {
  test('default', async () => {
    const token = await setupBlockedToken('Burn Blocked Token', 'BBT')

    const { receipt, ...result } = await Actions.token.burnBlockedSync(client, {
      amount: Value.from('400', 6),
      from: account2.address,
      token,
    })
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 400000000n,
        "from": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      }
    `)

    const balance = await Actions.token.getBalance(client, {
      account: account2.address,
      token,
    })
    expect(balance.amount).toBe(Value.from('600', 6))

    const metadata = await Actions.token.getMetadata(client, { token })
    expect(metadata.totalSupply).toBe(Value.from('600', 6))
  })

  test('behavior: reverts for an unblocked address', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Burn Unblocked Token',
      symbol: 'BUT',
    })
    await Actions.token.grantRolesSync(client, {
      roles: ['issuer', 'burnBlocked'],
      to: client.account!.address,
      token,
    })
    await Actions.token.mintSync(client, {
      amount: Value.from('100', 6),
      to: account2.address,
      token,
    })

    await expect(
      Actions.token.burnBlockedSync(client, {
        amount: Value.from('100', 6),
        from: account2.address,
        token,
      }),
    ).rejects.toThrow('The contract function "burnBlocked" reverted')
  })

  test('behavior: requires `burnBlocked` role', async () => {
    const token = await setupBlockedToken('Burn Blocked Role Token', 'BBRT')

    await expect(
      Actions.token.burnBlockedSync(client2, {
        amount: Value.from('100', 6),
        from: account2.address,
        token,
      }),
    ).rejects.toThrow('The contract function "burnBlocked" reverted')
  })
})
