import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

describe('setUserToken', () => {
  test('default', async () => {
    expect(await Actions.fee.getUserToken(client)).toMatchInlineSnapshot(`
      {
        "address": "0x20C0000000000000000000000000000000000001",
        "id": 1n,
      }
    `)

    const { receipt: setReceipt, ...setResult } =
      await Actions.fee.setUserTokenSync(client, {
        token: 2n,
      })
    expect(setReceipt.status).toBe('success')
    expect(setResult).toMatchInlineSnapshot(`
      {
        "token": "0x20C0000000000000000000000000000000000002",
        "user": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    expect(await Actions.fee.getUserToken(client)).toMatchInlineSnapshot(`
      {
        "address": "0x20C0000000000000000000000000000000000002",
        "id": 2n,
      }
    `)

    const { receipt: resetReceipt, ...resetResult } =
      await Actions.fee.setUserTokenSync(client, {
        token: 1n,
      })
    expect(resetReceipt.status).toBe('success')
    expect(resetResult).toMatchInlineSnapshot(`
      {
        "token": "0x20C0000000000000000000000000000000000001",
        "user": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    expect(await Actions.fee.getUserToken(client)).toMatchInlineSnapshot(`
      {
        "address": "0x20C0000000000000000000000000000000000001",
        "id": 1n,
      }
    `)
  })
})
