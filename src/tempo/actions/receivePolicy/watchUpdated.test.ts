import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const receiverAccount = Account.fromSecp256k1(tempo.accounts[5]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })
const receiverClient = tempo.getClient({
  account: receiverAccount,
  feeToken: tempo.pathUsd,
})

async function waitForLogs(logs: readonly unknown[], count = 1) {
  for (let i = 0; logs.length < count && i < 50; i++)
    await new Promise((resolve) => setTimeout(resolve, 100))
}

describe('watchUpdated', () => {
  test('default', async () => {
    const watcher = Actions.receivePolicy.watchUpdated(client)
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.receivePolicy.setSync(receiverClient, {
        claimer: 'self',
        senderPolicyId: 'allow-all',
        tokenPolicyId: 'allow-all',
      })

      await waitForLogs(logs)

      expect(logs).toHaveLength(1)
      expect(logs[0]!.args).toMatchInlineSnapshot(`
        {
          "account": "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
          "recoveryAuthority": "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
          "senderPolicyId": 1n,
          "tokenFilterId": 1n,
        }
      `)
    } finally {
      watcher.off()
    }
  })
})
