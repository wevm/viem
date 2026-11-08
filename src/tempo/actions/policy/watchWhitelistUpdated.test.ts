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

describe('watchWhitelistUpdated', () => {
  test('default', async () => {
    const { policyId } = await Actions.policy.createSync(client, {
      type: 'whitelist',
    })

    const watcher = Actions.policy.watchWhitelistUpdated(client)
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.policy.modifyWhitelistSync(client, {
        address: account2.address,
        allowed: true,
        policyId,
      })
      await Actions.policy.modifyWhitelistSync(client, {
        address: account2.address,
        allowed: false,
        policyId,
      })

      await waitForLogs(logs, 2)

      expect(logs).toHaveLength(2)
      expect(logs[0]!.args).toMatchInlineSnapshot(`
        {
          "account": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "allowed": true,
          "policyId": 2n,
          "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        }
      `)
      expect(logs[1]!.args).toMatchInlineSnapshot(`
        {
          "account": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "allowed": false,
          "policyId": 2n,
          "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        }
      `)
    } finally {
      watcher.off()
    }
  })
})
