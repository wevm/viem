import * as tempo from '~test/tempo.js'
import { Value } from 'ox'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const account2 = Account.fromSecp256k1(tempo.accounts[1]!.privateKey)
const account3 = Account.fromSecp256k1(tempo.accounts[2]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

async function fund(address: `0x${string}`) {
  await Actions.token.transferSync(client, {
    amount: Value.from('100', 6),
    to: address,
    token: tempo.pathUsd,
  })
}

async function waitForLogs(logs: readonly unknown[], count = 1) {
  for (let i = 0; logs.length < count && i < 50; i++)
    await new Promise((resolve) => setTimeout(resolve, 100))
}

describe('watchSetUserToken', () => {
  test('default', async () => {
    const watcher = Actions.fee.watchSetUserToken(client)
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await fund(account2.address)
      await fund(account3.address)

      // Genesis presets the account token, so set different token addresses:
      // setting the current value emits no `UserTokenSet` event.
      await Actions.fee.setUserTokenSync(client, {
        account: account2,
        token: '0x20c0000000000000000000000000000000000002',
      })
      await Actions.fee.setUserTokenSync(client, {
        account: account3,
        token: '0x20c0000000000000000000000000000000000003',
      })

      await waitForLogs(logs, 2)

      expect(logs).toHaveLength(2)
      expect(logs[0]!.args).toMatchInlineSnapshot(`
        {
          "token": "0x20C0000000000000000000000000000000000002",
          "user": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        }
      `)
      expect(logs[1]!.args).toMatchInlineSnapshot(`
        {
          "token": "0x20C0000000000000000000000000000000000003",
          "user": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        }
      `)
    } finally {
      watcher.off()
    }
  })

  test('behavior: filter by user address', async () => {
    const watcher = Actions.fee.watchSetUserToken(client, {
      args: { user: account2.address },
    })
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await fund(account2.address)
      await fund(account3.address)

      // Set token for account2 (should be captured)
      await Actions.fee.setUserTokenSync(client, {
        account: account2,
        token: tempo.pathUsd,
      })

      // Set token for account3 (should NOT be captured)
      await Actions.fee.setUserTokenSync(client, {
        account: account3,
        token: '0x20c0000000000000000000000000000000000002',
      })

      // Set token for account2 again (should be captured)
      await Actions.fee.setUserTokenSync(client, {
        account: account2,
        token: '0x20c0000000000000000000000000000000000002',
      })

      await waitForLogs(logs, 2)

      // Should only receive 2 events (for account2)
      expect(logs).toHaveLength(2)
      expect(logs[0]!.args).toMatchInlineSnapshot(`
        {
          "token": "0x20C0000000000000000000000000000000000000",
          "user": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        }
      `)
      expect(logs[1]!.args).toMatchInlineSnapshot(`
        {
          "token": "0x20C0000000000000000000000000000000000002",
          "user": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        }
      `)
      for (const log of logs) expect(log.args.user).toBe(account2.address)
    } finally {
      watcher.off()
    }
  })
})
