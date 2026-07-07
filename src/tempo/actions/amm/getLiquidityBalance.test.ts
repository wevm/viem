import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

describe('getLiquidityBalance', () => {
  test('default', async () => {
    const balance = await Actions.amm.getLiquidityBalance(client, {
      address: account.address,
      userToken: 1n,
      validatorToken: tempo.alphaUsd,
    })
    expect(typeof balance).toBe('bigint')
  })
})
