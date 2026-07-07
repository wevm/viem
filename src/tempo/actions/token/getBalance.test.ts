import * as Hex from 'ox/Hex'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Actions } from 'viem/tempo'

const account = tempo.accounts[0]!
const client = tempo.getClient({ feeToken: tempo.pathUsd })

describe('getBalance', () => {
  test('default', async () => {
    const balance = await Actions.token.getBalance(client, {
      account: account.address,
      token: tempo.alphaUsd,
    })
    const defaultedBalance = await Actions.token.getBalance(client, {
      token: tempo.alphaUsd,
    })

    expect(balance.amount).toBeGreaterThan(0n)
    expect(defaultedBalance).toEqual(balance)

    const emptyBalance = await Actions.token.getBalance(client, {
      account: Hex.random(20),
      token: tempo.alphaUsd,
    })
    expect(emptyBalance.amount).toBe(0n)
  })
})
