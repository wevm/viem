import { Value } from 'ox'
import * as tempo from '~test/tempo.js'
import { expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

test('behavior: insufficient liquidity', async () => {
  const error = await Actions.amm
    .burnSync(client, {
      liquidity: Value.from('1000000000', 6),
      to: account.address,
      userToken: tempo.alphaUsd,
      validatorToken: tempo.pathUsd,
    })
    .catch((error) => error)

  expect(error).toBeInstanceOf(Actions.amm.AmmInsufficientLiquidityError)
  expect(error.userToken.toLowerCase()).toBe(tempo.alphaUsd)
  expect(error.reserveValidatorToken).toBeGreaterThan(0n)
  const { amount, errorName, name } = error
  expect({ amount, errorName, name }).toMatchInlineSnapshot(`
    {
      "amount": 1000000000000000n,
      "errorName": "InsufficientLiquidity",
      "name": "AmmInsufficientLiquidityError",
    }
  `)
})
