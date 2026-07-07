import * as Hex from 'ox/Hex'
import * as Value from 'ox/Value'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Actions } from 'viem/tempo'

const account2 = tempo.accounts[1]!
const client = tempo.getClient({ feeToken: tempo.pathUsd })

describe('mint', () => {
  test('amount: supports formatted amounts', () => {
    const amount = Value.from('1.25', 6)

    expect(
      Actions.token.mint.call(client, {
        amount: { formatted: '1.25' },
        to: account2.address,
        token: tempo.alphaUsd,
      }).args,
    ).toEqual([account2.address, amount])

    expect(
      Actions.token.burn.call(client, {
        amount: { formatted: '1.25' },
        token: tempo.alphaUsd,
      }).args,
    ).toEqual([amount])

    expect(
      Actions.token.burnBlocked.call(client, {
        amount: { formatted: '1.25' },
        from: account2.address,
        token: tempo.alphaUsd,
      }).args,
    ).toEqual([account2.address, amount])
  })

  test('decimals: requires decimals for undeclared formatted amounts', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Mint Decimals Token',
      symbol: 'MDT',
    })

    expect(() =>
      Actions.token.mint.call(client, {
        amount: { formatted: '1' },
        to: account2.address,
        token,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Token decimals are required. Pass \`amount.decimals\` or select a declared token.]`,
    )

    expect(() =>
      Actions.token.burn.call(client, {
        amount: { formatted: '1' },
        token,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Token decimals are required. Pass \`amount.decimals\` or select a declared token.]`,
    )

    expect(() =>
      Actions.token.burnBlocked.call(client, {
        amount: { formatted: '1' },
        from: account2.address,
        token,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Token decimals are required. Pass \`amount.decimals\` or select a declared token.]`,
    )
  })

  test('default', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Mintable Token',
      symbol: 'MINT',
    })

    await Actions.token.grantRolesSync(client, {
      roles: ['issuer'],
      to: client.account!.address,
      token,
    })

    const balanceBefore = await Actions.token.getBalance(client, {
      account: account2.address,
      token,
    })
    expect(balanceBefore.amount).toBe(0n)

    const { receipt, ...result } = await Actions.token.mintSync(client, {
      amount: Value.from('1000', 6),
      to: account2.address,
      token,
    })
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 1000000000n,
        "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      }
    `)

    const balanceAfter = await Actions.token.getBalance(client, {
      account: account2.address,
      token,
    })
    expect(balanceAfter.amount).toBe(Value.from('1000', 6))

    const metadata = await Actions.token.getMetadata(client, { token })
    expect(metadata.totalSupply).toBe(Value.from('1000', 6))
  })

  test.skip('with memo', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Mintable Token 2',
      symbol: 'MINT2',
    })

    await Actions.token.grantRolesSync(client, {
      roles: ['issuer'],
      to: client.account!.address,
      token,
    })

    const { receipt, ...result } = await Actions.token.mintSync(client, {
      amount: Value.from('500', 6),
      memo: Hex.fromString('test'),
      to: account2.address,
      token,
    })
    expect(receipt.status).toBe('success')
    expect(result).toMatchInlineSnapshot()
  })
})
