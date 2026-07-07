import * as Value from 'ox/Value'
import * as TokenId from 'ox/tempo/TokenId'
import * as TokenRole from 'ox/tempo/TokenRole'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const client = tempo.getClient({ feeToken: tempo.pathUsd })
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const account3 = Account.fromSecp256k1(tempo.accounts[2]!.privateKey)
const client2 = tempo.getClient({ account: account2, feeToken: tempo.pathUsd })
const client3 = tempo.getClient({ account: account3, feeToken: tempo.pathUsd })

void TokenId
void TokenRole
void client2
void client3
void fund

async function fund(address: `0x${string}`) {
  await Actions.token.transferSync(client, {
    amount: Value.from('1', 6),
    to: address,
    token: tempo.pathUsd,
  })
}

describe('renounceRoles', () => {
  test('default', async () => {
    const { token } = await Actions.token.createSync(client, {
      admin: client.account!,
      currency: 'USD',
      name: 'Test Token 3',
      symbol: 'TEST3',
    })
    await Actions.token.grantRolesSync(client, {
      roles: ['issuer'],
      to: client.account!.address,
      token,
    })
    const { receipt, value } = await Actions.token.renounceRolesSync(client, {
      roles: ['issuer'],
      token,
    })
    expect(receipt.status).toBe('success')
    expect(value).toHaveLength(1)
    const { role, ...rest } = value[0]!
    expect(rest).toMatchInlineSnapshot(`
      {
        "account": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "hasRole": false,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)
    expect(role).toBe(TokenRole.serialize('issuer'))
  })
})
