import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const account3 = Account.fromSecp256k1(tempo.accounts[2]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

describe('create', () => {
  test('default', async () => {
    const { receipt, ...result } = await Actions.policy.createSync(client, {
      type: 'whitelist',
    })
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "policyId": 2n,
        "type": "whitelist",
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    const data = await Actions.policy.getData(client, {
      policyId: result.policyId,
    })
    expect(data).toMatchInlineSnapshot(`
      {
        "admin": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "type": "whitelist",
      }
    `)
  })

  test('behavior: blacklist', async () => {
    const { receipt, ...result } = await Actions.policy.createSync(client, {
      type: 'blacklist',
    })
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "policyId": 3n,
        "type": "blacklist",
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    const data = await Actions.policy.getData(client, {
      policyId: result.policyId,
    })
    expect(data).toMatchInlineSnapshot(`
      {
        "admin": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "type": "blacklist",
      }
    `)
  })

  test('behavior: with initial addresses', async () => {
    const { policyId } = await Actions.policy.createSync(client, {
      addresses: [account2.address, account3.address],
      type: 'whitelist',
    })

    expect(
      await Actions.policy.isAuthorized(client, {
        policyId,
        user: account2.address,
      }),
    ).toBe(true)
    expect(
      await Actions.policy.isAuthorized(client, {
        policyId,
        user: account3.address,
      }),
    ).toBe(true)
    expect(
      await Actions.policy.isAuthorized(client, {
        policyId,
        user: account.address,
      }),
    ).toBe(false)
  })

  test('behavior: explicit admin', async () => {
    const { policyId } = await Actions.policy.createSync(client, {
      admin: account2.address,
      type: 'whitelist',
    })

    expect(await Actions.policy.getData(client, { policyId }))
      .toMatchInlineSnapshot(`
      {
        "admin": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "type": "whitelist",
      }
    `)
  })
})
