import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

describe('getPool', () => {
  test('default', async () => {
    const pool = await Actions.amm.getPool(client, {
      userToken: 1n,
      validatorToken: tempo.alphaUsd,
    })
    expect(pool).toMatchInlineSnapshot(`
      {
        "reserveUserToken": 0n,
        "reserveValidatorToken": 0n,
        "totalSupply": 0n,
      }
    `)
  })
})
