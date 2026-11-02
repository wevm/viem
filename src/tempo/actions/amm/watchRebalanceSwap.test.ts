import * as tempo from '~test/tempo.js'
import { Actions as CoreActions } from 'viem'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

async function waitForLogs(logs: readonly unknown[], count = 1) {
  for (let i = 0; logs.length < count && i < 50; i++)
    await new Promise((resolve) => setTimeout(resolve, 100))
}

describe('watchRebalanceSwap', () => {
  test('default', async () => {
    // Paying fees in alphaUSD seeds the alphaUSD/pathUSD fee pool.
    await CoreActions.transaction.sendSync(client, {
      calls: [{ to: '0x00000000000000000000000000000000000000ff' }],
      feeToken: tempo.alphaUsd,
    })
    const pool = await Actions.amm.getPool(client, {
      userToken: tempo.alphaUsd,
      validatorToken: tempo.pathUsd,
    })
    expect(pool.reserveUserToken).toBeGreaterThan(0n)

    const watcher = Actions.amm.watchRebalanceSwap(client)
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.amm.rebalanceSwapSync(client, {
        amountOut: pool.reserveUserToken,
        to: account.address,
        userToken: tempo.alphaUsd,
        validatorToken: tempo.pathUsd,
      })
      await waitForLogs(logs)
      expect(logs).toHaveLength(1)
      expect(logs[0]!.args.userToken.toLowerCase()).toBe(tempo.alphaUsd)
      expect(logs[0]!.args.validatorToken.toLowerCase()).toBe(tempo.pathUsd)
      expect(logs[0]!.args.swapper.toLowerCase()).toBe(
        account.address.toLowerCase(),
      )
      expect(logs[0]!.args.amountOut).toBe(pool.reserveUserToken)
    } finally {
      watcher.off()
    }
  })
})
