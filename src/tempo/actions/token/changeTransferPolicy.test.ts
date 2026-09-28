import { Value } from 'ox'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const client = tempo.getClient({ feeToken: tempo.pathUsd })
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const account3 = Account.fromSecp256k1(tempo.accounts[2]!.privateKey)
const client2 = tempo.getClient({ account: account2, feeToken: tempo.pathUsd })

describe('changeTransferPolicy', () => {
  test('default', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Transfer Policy Token',
      symbol: 'TPT',
    })
    const { policyId } = await Actions.policy.createSync(client, {
      type: 'blacklist',
    })

    const { receipt, ...result } = await Actions.token.changeTransferPolicySync(
      client,
      { policyId, token },
    )
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "newPolicyId": 2n,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    const metadata = await Actions.token.getMetadata(client, { token })
    expect(metadata.transferPolicyId).toBe(policyId)
  })

  test('behavior: policy gates transfers', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Gated Transfer Token',
      symbol: 'GATED',
    })
    await Actions.token.grantRolesSync(client, {
      roles: ['issuer'],
      to: client.account!.address,
      token,
    })
    await Actions.token.mintSync(client, {
      amount: Value.from('100', 6),
      to: client.account!.address,
      token,
    })
    const { policyId } = await Actions.policy.createSync(client, {
      addresses: [account2.address],
      type: 'blacklist',
    })
    await Actions.token.changeTransferPolicySync(client, { policyId, token })

    await expect(
      Actions.token.transferSync(client, {
        amount: Value.from('1', 6),
        to: account2.address,
        token,
      }),
    ).rejects.toThrow('The contract function "transfer" reverted')

    const { receipt } = await Actions.token.transferSync(client, {
      amount: Value.from('1', 6),
      to: account3.address,
      token,
    })
    expect(receipt.status).toBe('success')
  })

  test('behavior: requires admin', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Transfer Policy Admin Token',
      symbol: 'TPADM',
    })
    const { policyId } = await Actions.policy.createSync(client, {
      type: 'blacklist',
    })

    await expect(
      Actions.token.changeTransferPolicySync(client2, { policyId, token }),
    ).rejects.toThrow('The contract function "changeTransferPolicyId" reverted')
  })
})
