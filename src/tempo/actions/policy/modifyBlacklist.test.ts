import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

describe('modifyBlacklist', () => {
  test('default', async () => {
    const { policyId } = await Actions.policy.createSync(client, {
      type: 'blacklist',
    })

    expect(
      await Actions.policy.isAuthorized(client, {
        policyId,
        user: account2.address,
      }),
    ).toBe(true)

    const { receipt: addReceipt, ...addResult } =
      await Actions.policy.modifyBlacklistSync(client, {
        address: account2.address,
        policyId,
        restricted: true,
      })
    expect(addReceipt.status).toBe('success')
    expect(addResult).toMatchInlineSnapshot(`
      {
        "account": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "policyId": 2n,
        "restricted": true,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    expect(
      await Actions.policy.isAuthorized(client, {
        policyId,
        user: account2.address,
      }),
    ).toBe(false)

    const { receipt: removeReceipt, ...removeResult } =
      await Actions.policy.modifyBlacklistSync(client, {
        address: account2.address,
        policyId,
        restricted: false,
      })
    expect(removeReceipt.status).toBe('success')
    expect(removeResult).toMatchInlineSnapshot(`
      {
        "account": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "policyId": 2n,
        "restricted": false,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    expect(
      await Actions.policy.isAuthorized(client, {
        policyId,
        user: account2.address,
      }),
    ).toBe(true)
  })
})
