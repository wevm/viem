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

const defaultAdmin =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

describe('getRoleAdmin', () => {
  test('default', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'GetRoleAdmin Test Token',
      symbol: 'GRATEST',
    })
    expect(
      await Actions.token.getRoleAdmin(client, { role: 'issuer', token }),
    ).toBe(defaultAdmin)
    expect(
      await Actions.token.getRoleAdmin(client, { role: 'pause', token }),
    ).toBe(defaultAdmin)
    expect(
      await Actions.token.getRoleAdmin(client, { role: 'unpause', token }),
    ).toBe(defaultAdmin)
  })
  test('behavior: after setting role admin', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'GetRoleAdmin After Set',
      symbol: 'GRASET',
    })
    await Actions.token.setRoleAdminSync(client, {
      adminRole: 'pause',
      role: 'issuer',
      token,
    })
    expect(
      await Actions.token.getRoleAdmin(client, { role: 'issuer', token }),
    ).toBe(TokenRole.serialize('pause'))
  })
  test('behavior: with token ID', async () => {
    const { token, tokenId } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'GetRoleAdmin Token ID',
      symbol: 'GRATID',
    })
    const admin = await Actions.token.getRoleAdmin(client, {
      role: 'issuer',
      token: tokenId,
    })
    expect(admin).toBe(defaultAdmin)
    expect(
      await Actions.token.getRoleAdmin(client, { role: 'issuer', token }),
    ).toBe(admin)
  })
  test('behavior: defaultAdmin role admin', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'GetRoleAdmin DefaultAdmin',
      symbol: 'GRADMIN',
    })
    expect(
      await Actions.token.getRoleAdmin(client, { role: 'defaultAdmin', token }),
    ).toBe(defaultAdmin)
  })
})
