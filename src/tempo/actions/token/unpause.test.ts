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

describe('unpause', () => {
  test('default', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Unpause Token',
      symbol: 'UNPAUSE',
    })
    await Actions.token.grantRolesSync(client, {
      roles: ['pause', 'unpause'],
      to: client.account!.address,
      token,
    })
    await Actions.token.pauseSync(client, { token })
    const { receipt, ...result } = await Actions.token.unpauseSync(client, {
      token,
    })
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "isPaused": false,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)
    expect((await Actions.token.getMetadata(client, { token })).paused).toBe(
      false,
    )
  })

  test('behavior: requires unpause role', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Unpause Role',
      symbol: 'UROLE',
    })
    await Actions.token.grantRolesSync(client, {
      roles: ['pause'],
      to: client.account!.address,
      token,
    })
    await Actions.token.pauseSync(client, { token })
    await expect(Actions.token.unpauseSync(client, { token })).rejects.toThrow()
    await fund(account2.address)
    await Actions.token.grantRolesSync(client, {
      roles: ['unpause'],
      to: account2.address,
      token,
    })
    await Actions.token.unpauseSync(client2, { token })
    expect((await Actions.token.getMetadata(client, { token })).paused).toBe(
      false,
    )
  })

  test('behavior: different roles for pause and unpause', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Split Role Token',
      symbol: 'SPLIT',
    })
    await Actions.token.grantRolesSync(client, {
      roles: ['pause'],
      to: account2.address,
      token,
    })
    await Actions.token.grantRolesSync(client, {
      roles: ['unpause'],
      to: account3.address,
      token,
    })
    await fund(account2.address)
    await fund(account3.address)
    await Actions.token.pauseSync(client2, { token })
    await expect(
      Actions.token.unpauseSync(client2, { token }),
    ).rejects.toThrow()
    await Actions.token.unpauseSync(client3, { token })
    expect((await Actions.token.getMetadata(client, { token })).paused).toBe(
      false,
    )
  })
})
