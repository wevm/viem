import { Value } from 'ox'
import * as tempo from '~test/tempo.js'
import { Actions as CoreActions } from 'viem'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

/** Seeds the alphaUSD/pathUSD fee pool with user-token reserves by paying fees in alphaUSD. */
async function seedPool() {
  await CoreActions.transaction.sendSync(client, {
    calls: [{ to: '0x00000000000000000000000000000000000000ff' }],
    feeToken: tempo.alphaUsd,
  })
  return await Actions.amm.getPool(client, {
    userToken: tempo.alphaUsd,
    validatorToken: tempo.pathUsd,
  })
}

describe('rebalanceSwap', () => {
  test('default', async () => {
    const pool = await seedPool()
    expect(pool.reserveUserToken).toBeGreaterThan(0n)

    const balanceBefore = await Actions.token.getBalance(client, {
      token: tempo.alphaUsd,
    })

    const { receipt, ...result } = await Actions.amm.rebalanceSwapSync(client, {
      amountOut: pool.reserveUserToken,
      to: account.address,
      userToken: tempo.alphaUsd,
      validatorToken: tempo.pathUsd,
    })
    expect(receipt.status).toBe('success')
    expect(result.userToken.toLowerCase()).toBe(tempo.alphaUsd)
    expect(result.validatorToken.toLowerCase()).toBe(tempo.pathUsd)
    expect(result.swapper.toLowerCase()).toBe(account.address.toLowerCase())
    expect(result.amountOut).toBe(pool.reserveUserToken)
    expect(result.amountIn).toBeGreaterThan(0n)

    const balanceAfter = await Actions.token.getBalance(client, {
      token: tempo.alphaUsd,
    })
    expect(balanceAfter.amount - balanceBefore.amount).toBe(
      pool.reserveUserToken,
    )
  })

  test('behavior: reverts when amountOut exceeds reserves', async () => {
    const pool = await Actions.amm.getPool(client, {
      userToken: tempo.alphaUsd,
      validatorToken: tempo.pathUsd,
    })

    await expect(
      Actions.amm.rebalanceSwapSync(client, {
        amountOut: pool.reserveUserToken + Value.from('1000000', 6),
        to: account.address,
        userToken: tempo.alphaUsd,
        validatorToken: tempo.pathUsd,
      }),
    ).rejects.toThrow('The contract function "rebalanceSwap" reverted')
  })
})
