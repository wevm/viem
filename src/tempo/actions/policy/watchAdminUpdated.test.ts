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

describe('watchAdminUpdated', () => {
  test('default', async () => {
    const { policyId } = await Actions.policy.createSync(client, {
      type: 'whitelist',
    })

    // Scope to this policy's admin update so the creation event (admin =
    // creator) and other policies' events cannot leak into the assertion.
    const watcher = Actions.policy.watchAdminUpdated(client, {
      args: { admin: account2.address, policyId },
    })
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.policy.setAdminSync(client, {
        admin: account2.address,
        policyId,
      })

      await waitForLogs(logs)

      expect(logs).toHaveLength(1)
      const { policyId: emittedPolicyId, ...args } = logs[0]!.args
      expect(emittedPolicyId).toBe(policyId)
      expect(args).toMatchInlineSnapshot(`
        {
          "admin": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "updater": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        }
      `)
    } finally {
      watcher.off()
    }
  })
})
