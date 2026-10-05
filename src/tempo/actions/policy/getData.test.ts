import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

describe('getData', () => {
  test('default', async () => {
    const { policyId } = await Actions.policy.createSync(client, {
      type: 'whitelist',
    })

    expect(await Actions.policy.getData(client, { policyId }))
      .toMatchInlineSnapshot(`
      {
        "admin": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "type": "whitelist",
      }
    `)
  })

  test('behavior: blacklist', async () => {
    const { policyId } = await Actions.policy.createSync(client, {
      type: 'blacklist',
    })

    expect(await Actions.policy.getData(client, { policyId }))
      .toMatchInlineSnapshot(`
      {
        "admin": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "type": "blacklist",
      }
    `)
  })
})
