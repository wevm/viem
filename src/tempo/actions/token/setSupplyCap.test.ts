import { Value } from 'ox'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const client = tempo.getClient({ feeToken: tempo.pathUsd })
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const client2 = tempo.getClient({ account: account2, feeToken: tempo.pathUsd })

describe('setSupplyCap', () => {
  test('default', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Supply Cap Token',
      symbol: 'CAP',
    })

    const { receipt, ...result } = await Actions.token.setSupplyCapSync(
      client,
      { supplyCap: Value.from('1000', 6), token },
    )
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "newSupplyCap": 1000000000n,
        "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)

    const metadata = await Actions.token.getMetadata(client, { token })
    expect(metadata.supplyCap).toBe(Value.from('1000', 6))
  })

  test('behavior: minting above the cap reverts', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Capped Mint Token',
      symbol: 'CAPMINT',
    })
    await Actions.token.grantRolesSync(client, {
      roles: ['issuer'],
      to: client.account!.address,
      token,
    })
    await Actions.token.setSupplyCapSync(client, {
      supplyCap: Value.from('1000', 6),
      token,
    })

    await Actions.token.mintSync(client, {
      amount: Value.from('1000', 6),
      to: account2.address,
      token,
    })
    await expect(
      Actions.token.mintSync(client, {
        amount: 1n,
        to: account2.address,
        token,
      }),
    ).rejects.toThrow('The contract function "mint" reverted')
  })

  test('behavior: requires admin', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Supply Cap Admin Token',
      symbol: 'CAPADM',
    })

    await expect(
      Actions.token.setSupplyCapSync(client2, {
        supplyCap: Value.from('1000', 6),
        token,
      }),
    ).rejects.toThrow('The contract function "setSupplyCap" reverted')
  })
})
