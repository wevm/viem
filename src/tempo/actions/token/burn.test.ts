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

describe('burn', () => {
  test('default', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Burn Token',
      symbol: 'BURN',
    })
    await Actions.token.grantRolesSync(client, {
      roles: ['issuer'],
      to: client.account!.address,
      token,
    })
    await Actions.token.mintSync(client, {
      amount: Value.from('100', 6),
      to: client.account!.address,
      token,
    })
    const { receipt, ...result } = await Actions.token.burnSync(client, {
      amount: Value.from('25', 6),
      token,
    })
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 25000000n,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)
    const balance = await Actions.token.getBalance(client, {
      account: client.account!.address,
      token,
    })
    expect(balance.amount).toBe(Value.from('75', 6))
  })

  test('behavior: with token ID and formatted amount', async () => {
    const { token, tokenId } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Burn Token ID',
      symbol: 'BTID',
    })
    await Actions.token.grantRolesSync(client, {
      roles: ['issuer'],
      to: client.account!.address,
      token,
    })
    await Actions.token.mintSync(client, {
      amount: Value.from('10', 6),
      to: client.account!.address,
      token,
    })
    const { receipt, ...result } = await Actions.token.burnSync(client, {
      amount: { formatted: '1.5', decimals: 6 },
      token: tokenId,
    })
    expect(receipt.status).toBe('success')
    expect(result.formatted).toBe('1.5')
    expect(result.amount).toBe(Value.from('1.5', 6))
  })

  test('behavior: requires balance', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Burn No Balance',
      symbol: 'BNB',
    })
    await expect(
      Actions.token.burnSync(client, { amount: 1n, token }),
    ).rejects.toThrow()
  })
})
