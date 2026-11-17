import { Value } from 'ox'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })
const to = '0x0000000000000000000000000000000000000001'

describe('approve', () => {
  test('decimals: requires decimals for an undeclared formatted amount', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Approve Decimals Token',
      symbol: 'ADT',
    })

    await expect(
      Actions.token.approve(client, {
        amount: { formatted: '1' },
        spender: account2.address,
        token,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Token decimals are required. Pass \`amount.decimals\` or select a declared token.]`,
    )
  })

  test('decimals: omits formatting for an undeclared base-unit amount', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Approve Base Token',
      symbol: 'ABT',
    })
    const { receipt, ...result } = await Actions.token.approveSync(client, {
      amount: 1n,
      spender: account2.address,
      token,
    })
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 1n,
        "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "spender": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      }
    `)
  })

  test('default', async () => {
    const { receipt, ...result } = await Actions.token.approveSync(client, {
      amount: 100000000n,
      spender: account2.address,
      token: tempo.alphaUsd,
    })
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 100000000n,
        "decimals": 6,
        "formatted": "100",
        "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "spender": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      }
    `)

    const allowance = await Actions.token.getAllowance(client, {
      account: account.address,
      spender: account2.address,
      token: tempo.alphaUsd,
    })
    expect(allowance.amount).toBe(Value.from('100', 6))

    await Actions.token.transferSync(client, {
      amount: Value.from('1', 6),
      to: account2.address,
      token: tempo.pathUsd,
    })

    await Actions.token.transferSync(client, {
      account: account2,
      amount: { decimals: 6, formatted: '50' },
      from: account.address,
      to,
      token: tempo.alphaUsd,
    })

    const updated = await Actions.token.getAllowance(client, {
      account: account.address,
      spender: account2.address,
      token: tempo.alphaUsd,
    })
    expect(updated.amount).toBe(Value.from('50', 6))

    const balance = await Actions.token.getBalance(client, {
      account: to,
      token: tempo.alphaUsd,
    })
    expect(balance.amount).toBeGreaterThanOrEqual(Value.from('50', 6))
  })

  test('behavior: token address', async () => {
    const balanceBefore = await Actions.token.getBalance(client, {
      account: to,
      token: tempo.alphaUsd,
    })

    await Actions.token.approveSync(client, {
      amount: { decimals: 6, formatted: '100' },
      spender: account2.address,
      token: tempo.alphaUsd,
    })

    await Actions.token.transferSync(client, {
      amount: Value.from('1', 6),
      to: account2.address,
      token: tempo.pathUsd,
    })

    await Actions.token.transferSync(client, {
      account: account2,
      amount: { decimals: 6, formatted: '50' },
      from: account.address,
      to,
      token: tempo.alphaUsd,
    })

    const balance = await Actions.token.getBalance(client, {
      account: to,
      token: tempo.alphaUsd,
    })
    expect(balance.amount).toBe(balanceBefore.amount + Value.from('50', 6))
  })
})
