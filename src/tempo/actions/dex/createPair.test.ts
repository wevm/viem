import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

describe('createPair', () => {
  test('default', async () => {
    const { token: baseToken } = await Actions.token.createSync(client, {
      name: 'Test Base Token',
      symbol: 'BASE',
      currency: 'USD',
    })
    const { receipt, key, base, quote } = await Actions.dex.createPairSync(
      client,
      { base: baseToken },
    )
    expect(receipt.status).toBe('success')
    expect(key).toBeDefined()
    expect(base).toBe(baseToken)
    // Event args are checksummed.
    expect(quote.toLowerCase()).toBe(tempo.pathUsd)
  })
})
