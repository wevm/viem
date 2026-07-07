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

describe('pause', () => {
  test('default', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Pause Token',
      symbol: 'PAUSE',
    })
    await Actions.token.grantRolesSync(client, {
      roles: ['pause'],
      to: client.account!.address,
      token,
    })
    const { receipt, ...result } = await Actions.token.pauseSync(client, {
      token,
    })
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "isPaused": true,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)
    expect((await Actions.token.getMetadata(client, { token })).paused).toBe(
      true,
    )
  })

  test('behavior: paused token rejects transfers', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Pause Transfer',
      symbol: 'PTRANS',
    })
    await Actions.token.grantRolesSync(client, {
      roles: ['issuer', 'pause'],
      to: client.account!.address,
      token,
    })
    await Actions.token.mintSync(client, {
      amount: Value.from('100', 6),
      to: client.account!.address,
      token,
    })
    await Actions.token.pauseSync(client, { token })
    await expect(
      Actions.token.transferSync(client, {
        amount: Value.from('1', 6),
        to: account2.address,
        token,
      }),
    ).rejects.toThrow()
  })

  test('behavior: requires pause role', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Pause Role',
      symbol: 'PROLE',
    })
    await fund(account2.address)
    await expect(Actions.token.pauseSync(client2, { token })).rejects.toThrow()
  })
})
