import { Value } from 'ox'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Actions } from 'viem/tempo'

const client = tempo.getClient({ feeToken: tempo.pathUsd })

describe('getTotalSupply', () => {
  test('default', async () => {
    const totalSupply = await Actions.token.getTotalSupply(client, {
      token: tempo.alphaUsd,
    })

    expect(totalSupply.amount).toBeGreaterThan(0n)
    expect(totalSupply.decimals).toBe(6)
    expect(totalSupply.formatted).toBe(Value.format(totalSupply.amount, 6))
  })

  test('behavior: custom token', async () => {
    const { token } = await Actions.token.createSync(client, {
      currency: 'USD',
      name: 'Supply Token',
      symbol: 'SUPPLY',
    })

    await Actions.token.grantRolesSync(client, {
      roles: ['issuer'],
      to: client.account!.address,
      token,
    })

    await Actions.token.mintSync(client, {
      amount: Value.from('1000', 6),
      to: client.account!.address,
      token,
    })

    const totalSupply = await Actions.token.getTotalSupply(client, {
      decimals: 6,
      token,
    })

    expect(totalSupply.amount).toBe(Value.from('1000', 6))
    expect(totalSupply.formatted).toBe('1000')
  })
})
