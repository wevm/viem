import { Value } from 'ox'
import { TokenRole } from 'ox/tempo'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const client = tempo.getClient({ feeToken: tempo.pathUsd })
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const account3 = Account.fromSecp256k1(tempo.accounts[2]!.privateKey)
const client2 = tempo.getClient({ account: account2, feeToken: tempo.pathUsd })
const client3 = tempo.getClient({ account: account3, feeToken: tempo.pathUsd })

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

describe('hasRole', () => {
  test('default', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'HasRole Test Token',
      symbol: 'HRTEST',
    })
    expect(
      await Actions.token.hasRole(client, { role: 'defaultAdmin', token }),
    ).toBe(true)
    expect(await Actions.token.hasRole(client, { role: 'issuer', token })).toBe(
      false,
    )
    await Actions.token.grantRolesSync(client, {
      roles: ['issuer'],
      to: client.account!.address,
      token,
    })
    expect(await Actions.token.hasRole(client, { role: 'issuer', token })).toBe(
      true,
    )
  })
  test('behavior: check other account', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'HasRole Other Account',
      symbol: 'HROAC',
    })
    expect(
      await Actions.token.hasRole(client, {
        account: account2.address,
        role: 'issuer',
        token,
      }),
    ).toBe(false)
    await Actions.token.grantRolesSync(client, {
      roles: ['issuer'],
      to: account2.address,
      token,
    })
    expect(
      await Actions.token.hasRole(client, {
        account: account2.address,
        role: 'issuer',
        token,
      }),
    ).toBe(true)
    expect(
      await Actions.token.hasRole(client, {
        account: account3.address,
        role: 'issuer',
        token,
      }),
    ).toBe(false)
  })
  test('behavior: multiple roles', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'HasRole Multiple',
      symbol: 'HRMULTI',
    })
    await Actions.token.grantRolesSync(client, {
      roles: ['issuer', 'pause'],
      to: account2.address,
      token,
    })
    expect(
      await Actions.token.hasRole(client, {
        account: account2.address,
        role: 'issuer',
        token,
      }),
    ).toBe(true)
    expect(
      await Actions.token.hasRole(client, {
        account: account2.address,
        role: 'pause',
        token,
      }),
    ).toBe(true)
    expect(
      await Actions.token.hasRole(client, {
        account: account2.address,
        role: 'unpause',
        token,
      }),
    ).toBe(false)
  })
  test('behavior: after revoke', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'HasRole Revoke',
      symbol: 'HRREV',
    })
    await Actions.token.grantRolesSync(client, {
      roles: ['issuer'],
      to: account2.address,
      token,
    })
    await Actions.token.revokeRolesSync(client, {
      from: account2.address,
      roles: ['issuer'],
      token,
    })
    expect(
      await Actions.token.hasRole(client, {
        account: account2.address,
        role: 'issuer',
        token,
      }),
    ).toBe(false)
  })
  test('behavior: with address', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'HasRole Address',
      symbol: 'HRTID',
    })
    await Actions.token.grantRolesSync(client, {
      roles: ['issuer'],
      to: account2.address,
      token,
    })
    expect(
      await Actions.token.hasRole(client, {
        account: account2.address,
        role: 'issuer',
        token,
      }),
    ).toBe(true)
    expect(
      await Actions.token.hasRole(client, {
        account: account2.address,
        role: 'issuer',
        token,
      }),
    ).toBe(true)
  })
})
