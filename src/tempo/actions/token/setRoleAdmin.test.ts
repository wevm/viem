import { TokenRole } from 'ox/tempo'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const client = tempo.getClient({ feeToken: tempo.pathUsd })
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const account3 = Account.fromSecp256k1(tempo.accounts[2]!.privateKey)
const client2 = tempo.getClient({ account: account2, feeToken: tempo.pathUsd })

describe('setRoleAdmin', () => {
  test('default', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Role Admin Token',
      symbol: 'RADM',
    })

    const { receipt, ...result } = await Actions.token.setRoleAdminSync(
      client,
      { adminRole: 'pause', role: 'issuer', token },
    )
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "newAdminRole": "0x139c2898040ef16910dc9f44dc697df79363da767d8bc92f2e310312b816e46d",
        "role": "0x114e74f6ea3bd819998f78687bfcb11b140da08e9b7d222fa9c1f1ba1f2aa122",
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    expect(
      await Actions.token.getRoleAdmin(client, { role: 'issuer', token }),
    ).toBe(TokenRole.serialize('pause'))
  })

  test('behavior: new admin can grant the role', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Role Admin Grant Token',
      symbol: 'RAGRANT',
    })
    await Actions.token.setRoleAdminSync(client, {
      adminRole: 'pause',
      role: 'issuer',
      token,
    })
    await Actions.token.grantRolesSync(client, {
      roles: ['pause'],
      to: account2.address,
      token,
    })

    await Actions.token.grantRolesSync(client2, {
      roles: ['issuer'],
      to: account3.address,
      token,
    })
    expect(
      await Actions.token.hasRole(client, {
        account: account3.address,
        role: 'issuer',
        token,
      }),
    ).toBe(true)
  })

  test('behavior: requires admin of the role', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Role Admin Auth Token',
      symbol: 'RAAUTH',
    })

    await expect(
      Actions.token.setRoleAdminSync(client2, {
        adminRole: 'pause',
        role: 'issuer',
        token,
      }),
    ).rejects.toThrow('The contract function "setRoleAdmin" reverted')
  })
})
