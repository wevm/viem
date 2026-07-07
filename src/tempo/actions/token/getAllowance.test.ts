import * as Value from 'ox/Value'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Actions } from 'viem/tempo'

const account = tempo.accounts[0]!
const account2 = tempo.accounts[1]!
const client = tempo.getClient({ feeToken: tempo.pathUsd })

describe('getAllowance', () => {
  test('default', async () => {
    await Actions.token.approveSync(client, {
      amount: Value.from('50', 6),
      spender: account2.address,
      token: tempo.alphaUsd,
    })

    const allowance = await Actions.token.getAllowance(client, {
      account: account.address,
      spender: account2.address,
      token: tempo.alphaUsd,
    })
    expect(allowance.amount).toBe(Value.from('50', 6))

    const addressAllowance = await Actions.token.getAllowance(client, {
      account: account.address,
      spender: account2.address,
      token: tempo.alphaUsd,
    })
    expect(addressAllowance.amount).toBe(Value.from('50', 6))

    const idAllowance = await Actions.token.getAllowance(client, {
      account: account.address,
      spender: account2.address,
      token: tempo.alphaUsd,
    })
    expect(idAllowance.amount).toBe(Value.from('50', 6))
  })
})
