import * as TokenId from 'ox/tempo/TokenId'
import * as Value from 'ox/Value'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Actions } from 'viem/tempo'

const account2 = tempo.accounts[1]!
const client = tempo.getClient({ feeToken: tempo.pathUsd })

describe('call (without client)', () => {
  test('default: builds the same call as the client form', () => {
    const args = {
      amount: Value.from('1.25', 6),
      to: account2.address,
      token: tempo.alphaUsd,
    } as const
    expect(Actions.token.transfer.call(args)).toEqual(
      Actions.token.transfer.call(client, args),
    )

    expect(
      Actions.token.approve.call({
        amount: 100n,
        spender: account2.address,
        token: TokenId.fromAddress(tempo.alphaUsd),
      }).to,
    ).toBe(tempo.alphaUsd)

    expect(
      Actions.token.getBalance.call({
        account: account2.address,
        token: tempo.alphaUsd,
      }).args,
    ).toEqual([account2.address])
  })

  test('amount: formatted amounts require explicit decimals', () => {
    expect(
      Actions.token.mint.call({
        amount: { decimals: 6, formatted: '1.25' },
        to: account2.address,
        token: tempo.alphaUsd,
      }).args,
    ).toEqual([account2.address, Value.from('1.25', 6)])

    expect(() =>
      Actions.token.mint.call({
        amount: { formatted: '1.25' },
        to: account2.address,
        token: tempo.alphaUsd,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Token decimals are required. Pass \`amount.decimals\` or select a declared token.]`,
    )
  })
})
