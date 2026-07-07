import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

async function waitForLogs(logs: readonly unknown[], count = 1) {
  for (let i = 0; logs.length < count && i < 50; i++)
    await new Promise((resolve) => setTimeout(resolve, 100))
}

describe('watchIncremented', () => {
  test('default', async () => {
    const watcher = Actions.nonce.watchIncremented(client, {
      args: {
        account: account.address,
        nonceKey: 5n,
      },
    })
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      // Keyed (2D) nonces are not filled by `eth_fillTransaction`, so the
      // nonce is set explicitly.
      await Actions.token.transferSync(client, {
        amount: 1n,
        nonce: 0,
        nonceKey: 5n,
        to: account2.address,
        token: tempo.pathUsd,
      })
      await Actions.token.transferSync(client, {
        amount: 1n,
        nonce: 1,
        nonceKey: 5n,
        to: account2.address,
        token: tempo.pathUsd,
      })

      await waitForLogs(logs, 2)

      expect(logs).toHaveLength(2)
      expect(logs[0]!.args.account).toBe(account.address)
      expect(logs[0]!.args.nonceKey).toBe(5n)
      expect(logs[0]!.args.newNonce).toBe(1n)
      expect(logs[1]!.args.newNonce).toBe(2n)
    } finally {
      watcher.off()
    }
  })
})
