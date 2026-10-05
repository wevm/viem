import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

async function waitForLogs(logs: readonly unknown[], count = 1) {
  for (let i = 0; logs.length < count && i < 50; i++)
    await new Promise((resolve) => setTimeout(resolve, 100))
}

describe('watchBurn', () => {
  test('default', async () => {
    const lpBalance = await Actions.amm.getLiquidityBalance(client, {
      address: account.address,
      userToken: tempo.alphaUsd,
      validatorToken: tempo.pathUsd,
    })
    const watcher = Actions.amm.watchBurn(client)
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.amm.burnSync(client, {
        liquidity: lpBalance / 2n,
        to: account.address,
        userToken: tempo.alphaUsd,
        validatorToken: tempo.pathUsd,
      })

      await waitForLogs(logs)

      expect(logs).toHaveLength(1)
      expect(logs[0]!.args.userToken.toLowerCase()).toBe(tempo.alphaUsd)
      expect(logs[0]!.args.validatorToken.toLowerCase()).toBe(tempo.pathUsd)
      expect(logs[0]!.args.liquidity).toBe(lpBalance / 2n)
    } finally {
      watcher.off()
    }
  })
})
