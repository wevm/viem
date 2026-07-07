import * as TokenId from 'ox/tempo/TokenId'
import * as Value from 'ox/Value'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const account3 = Account.fromSecp256k1(tempo.accounts[2]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

describe('transfer', () => {
  test('decimals: requires decimals for an undeclared formatted amount', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Transfer Decimals Token',
      symbol: 'TDT',
    })

    await expect(
      Actions.token.transfer(client, {
        amount: { formatted: '1' },
        to: account2.address,
        token,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Token decimals are required. Pass \`amount.decimals\` or select a declared token.]`,
    )
  })

  test('amount: uses a base-unit amount for an undeclared token', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Transfer Base Token',
      symbol: 'TBT',
    })
    await Actions.token.grantRolesSync(client, {
      roles: ['issuer'],
      to: account.address,
      token,
    })
    await Actions.token.mintSync(client, {
      amount: 1000000n,
      to: account.address,
      token,
    })

    const { receipt, ...result } = await Actions.token.transferSync(client, {
      amount: 1000000n,
      to: account2.address,
      token,
    })
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 1000000n,
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      }
    `)
  })

  test('default', async () => {
    const senderBalanceBefore = await Actions.token.getBalance(client, {
      token: tempo.alphaUsd,
    })
    const receiverBalanceBefore = await Actions.token.getBalance(client, {
      account: account2.address,
      token: tempo.alphaUsd,
    })

    const { receipt, ...result } = await Actions.token.transferSync(client, {
      amount: 10000000n,
      to: account2.address,
      token: tempo.alphaUsd,
    })
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 10000000n,
        "decimals": 6,
        "formatted": "10",
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      }
    `)

    const senderBalanceAfter = await Actions.token.getBalance(client, {
      token: tempo.alphaUsd,
    })
    const receiverBalanceAfter = await Actions.token.getBalance(client, {
      account: account2.address,
      token: tempo.alphaUsd,
    })

    expect(senderBalanceAfter.amount - senderBalanceBefore.amount).toBeLessThan(
      Value.from('10', 6),
    )
    expect(receiverBalanceAfter.amount - receiverBalanceBefore.amount).toBe(
      Value.from('10', 6),
    )
  })

  test('behavior: with custom token', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Transfer Token',
      symbol: 'XFER',
    })

    await Actions.token.grantRolesSync(client, {
      roles: ['issuer'],
      to: account.address,
      token,
    })

    await Actions.token.mintSync(client, {
      amount: Value.from('1000', 6),
      to: account.address,
      token,
    })

    await Actions.token.transferSync(client, {
      amount: { decimals: 6, formatted: '100' },
      to: account2.address,
      token,
    })

    const balance = await Actions.token.getBalance(client, {
      account: account2.address,
      token,
    })
    expect(balance.amount).toBe(Value.from('100', 6))
  })

  test.each([
    ['token id', TokenId.fromAddress(tempo.pathUsd)],
    ['address', tempo.pathUsd],
  ] as const)(
    'behavior: pathUSD with formatted amount (%s)',
    async (_, token) => {
      const amount = Value.from('1.25', 6)
      const balanceBefore = await Actions.token.getBalance(client, {
        account: account2.address,
        token,
      })

      const { receipt, ...result } = await Actions.token.transferSync(client, {
        amount: { formatted: '1.25' },
        to: account2.address,
        token,
      })

      expect(receipt.status).toBe('success')
      expect(result).toMatchObject({
        amount,
        decimals: 6,
        formatted: '1.25',
        from: account.address,
        to: account2.address,
      })

      const balanceAfter = await Actions.token.getBalance(client, {
        account: account2.address,
        token,
      })
      expect(balanceAfter.amount - balanceBefore.amount).toBe(amount)
    },
  )

  test('behavior: with memo', async () => {
    const { receipt, ...result } = await Actions.token.transferSync(client, {
      amount: { decimals: 6, formatted: '5' },
      memo: '0x5061796d656e7420666f72207365727669636573',
      to: account2.address,
      token: tempo.alphaUsd,
    })

    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 5000000n,
        "decimals": 6,
        "formatted": "5",
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      }
    `)
  })

  test('behavior: from another account (transferFrom)', async () => {
    await Actions.token.approveSync(client, {
      amount: { decimals: 6, formatted: '50' },
      spender: account2.address,
      token: tempo.alphaUsd,
    })

    await Actions.token.transferSync(client, {
      amount: Value.from('1', 6),
      to: account2.address,
      token: tempo.pathUsd,
    })

    const balanceBefore = await Actions.token.getBalance(client, {
      account: account3.address,
      token: tempo.alphaUsd,
    })

    await Actions.token.transferSync(client, {
      account: account2,
      amount: { decimals: 6, formatted: '25' },
      from: account.address,
      to: account3.address,
      token: tempo.alphaUsd,
    })

    const balanceAfter = await Actions.token.getBalance(client, {
      account: account3.address,
      token: tempo.alphaUsd,
    })
    expect(balanceAfter.amount - balanceBefore.amount).toBe(Value.from('25', 6))

    const allowance = await Actions.token.getAllowance(client, {
      account: account.address,
      spender: account2.address,
      token: tempo.alphaUsd,
    })
    expect(allowance.amount).toBe(Value.from('25', 6))
  })
})
