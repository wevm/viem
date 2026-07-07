import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

describe('setAdmin', () => {
  test('default', async () => {
    const { policyId } = await Actions.policy.createSync(client, {
      type: 'whitelist',
    })

    const { receipt, ...result } = await Actions.policy.setAdminSync(client, {
      admin: account2.address,
      policyId,
    })
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "admin": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "policyId": 2n,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    expect(await Actions.policy.getData(client, { policyId }))
      .toMatchInlineSnapshot(`
      {
        "admin": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "type": "whitelist",
      }
    `)
  })
})
