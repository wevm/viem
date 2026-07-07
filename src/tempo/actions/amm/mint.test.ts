import * as Value from 'ox/Value'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

async function createToken() {
  const { token } = await Actions.token.createSync(client, {
    currency: 'USD',
    name: 'AMM Mint Token',
    symbol: 'AMM-MINT',
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
  return token
}

describe('mint', () => {
  test('default', async () => {
    const token = await createToken()

    await Actions.amm.mintSync(client, {
      to: account.address,
      userTokenAddress: token,
      validatorTokenAddress: 1n,
      validatorTokenAmount: Value.from('100', 6),
    })

    const poolBefore = await Actions.amm.getPool(client, {
      userToken: token,
      validatorToken: 1n,
    })

    const { receipt, ...result } = await Actions.amm.mintSync(client, {
      to: account.address,
      userTokenAddress: token,
      validatorTokenAddress: 1n,
      validatorTokenAmount: Value.from('50', 6),
    })

    expect(receipt.status).toBe('success')
    expect(result.amountValidatorToken).toBe(Value.from('50', 6))
    expect(result.liquidity).toBeGreaterThan(0n)

    const poolAfter = await Actions.amm.getPool(client, {
      userToken: token,
      validatorToken: 1n,
    })

    expect(poolAfter.reserveUserToken).toBe(poolBefore.reserveUserToken)
    expect(poolAfter.reserveValidatorToken).toBe(
      poolBefore.reserveValidatorToken + Value.from('50', 6),
    )
    expect(poolAfter.totalSupply).toBeGreaterThan(poolBefore.totalSupply)
  })
})
