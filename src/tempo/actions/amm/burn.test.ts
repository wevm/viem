import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

describe('burn', () => {
  test('default', async () => {
    const lpBalanceBefore = await Actions.amm.getLiquidityBalance(client, {
      address: account.address,
      userToken: tempo.alphaUsd,
      validatorToken: tempo.pathUsd,
    })

    const { receipt, userToken, sender, to, ...result } =
      await Actions.amm.burnSync(client, {
        liquidity: lpBalanceBefore / 2n,
        to: account2.address,
        userToken: tempo.alphaUsd,
        validatorToken: tempo.pathUsd,
      })

    expect(receipt.status).toBe('success')
    expect(userToken.toLowerCase()).toBe(tempo.alphaUsd)
    expect(sender).toBe(account.address)
    expect(to).toBe(account2.address)
    expect(result.amountUserToken).toBeGreaterThanOrEqual(0n)
    expect(result.amountValidatorToken).toBeGreaterThan(0n)
    expect(result.liquidity).toBe(lpBalanceBefore / 2n)
    expect(result.validatorToken.toLowerCase()).toBe(tempo.pathUsd)

    const lpBalanceAfter = await Actions.amm.getLiquidityBalance(client, {
      address: account.address,
      userToken: tempo.alphaUsd,
      validatorToken: tempo.pathUsd,
    })
    expect(lpBalanceAfter).toBeLessThan(lpBalanceBefore)
    expect(lpBalanceAfter).toBe(lpBalanceBefore / 2n)

    const pool = await Actions.amm.getPool(client, {
      userToken: tempo.alphaUsd,
      validatorToken: tempo.pathUsd,
    })
    expect(pool.totalSupply).toBeGreaterThan(0n)
    expect(pool.reserveValidatorToken).toBeGreaterThan(0n)
  })
})
