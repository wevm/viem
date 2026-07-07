import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })

async function waitForLogs(logs: readonly unknown[], count = 1) {
  for (let i = 0; logs.length < count && i < 50; i++)
    await new Promise((resolve) => setTimeout(resolve, 100))
}

describe('watchCreate', () => {
  test('default', async () => {
    const watcher = Actions.policy.watchCreate(client)
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.policy.createSync(client, {
        type: 'whitelist',
      })

      await waitForLogs(logs)

      expect(logs).toHaveLength(1)
      expect(logs[0]!.args).toMatchInlineSnapshot(`
        {
          "policyId": 2n,
          "policyType": 0,
          "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        }
      `)
    } finally {
      watcher.off()
    }
  })
})
