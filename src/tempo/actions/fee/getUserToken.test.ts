import * as tempo from '~test/tempo.js'
import * as Value from 'ox/Value'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const account3 = Account.fromSecp256k1(tempo.accounts[2]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

async function fund(address: `0x${string}`) {
  await Actions.token.transferSync(client, {
    amount: Value.from('100', 6),
    to: address,
    token: tempo.pathUsd,
  })
}

describe('getUserToken', () => {
  test('default', async () => {
    // Fund accounts so they can pay for their own preference updates.
    await fund(account2.address)
    await fund(account3.address)

    // Set token (address). Genesis presets token 1, so set a different
    // token: setting the current value emits no `UserTokenSet` event.
    await Actions.fee.setUserTokenSync(client, {
      account: account2,
      token: '0x20c0000000000000000000000000000000000002',
    })

    // Set another token (id)
    await Actions.fee.setUserTokenSync(client, {
      account: account3,
      token: 3n,
    })

    expect(
      await Actions.fee.getUserToken(client, { account: account2.address }),
    ).toMatchInlineSnapshot(`
      {
        "address": "0x20C0000000000000000000000000000000000002",
        "id": 2n,
      }
    `)
    expect(
      await Actions.fee.getUserToken(client, { account: account3.address }),
    ).toMatchInlineSnapshot(`
      {
        "address": "0x20C0000000000000000000000000000000000003",
        "id": 3n,
      }
    `)
  })

  test('behavior: defaults to client account', async () => {
    expect(await Actions.fee.getUserToken(client)).toMatchInlineSnapshot(`
      {
        "address": "0x20C0000000000000000000000000000000000001",
        "id": 1n,
      }
    `)
  })
})
