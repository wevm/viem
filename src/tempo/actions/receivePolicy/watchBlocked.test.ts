import * as Value from 'ox/Value'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const receiverAccount = Account.fromSecp256k1(tempo.accounts[6]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })
const receiverClient = tempo.getClient({
  account: receiverAccount,
  feeToken: tempo.pathUsd,
})

async function waitForLogs(logs: readonly unknown[], count = 1) {
  for (let i = 0; logs.length < count && i < 50; i++)
    await new Promise((resolve) => setTimeout(resolve, 100))
}

describe('watchBlocked', () => {
  test('default', async () => {
    await Actions.receivePolicy.setSync(receiverClient, {
      senderPolicyId: 'reject-all',
    })

    const watcher = Actions.receivePolicy.watchBlocked(client)
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.token.transferSync(client, {
        amount: Value.from('1', 6),
        to: receiverAccount.address,
        token: tempo.alphaUsd,
      })

      await waitForLogs(logs)

      expect(logs).toHaveLength(1)
      expect(logs[0]!.args.amount).toBe(Value.from('1', 6))
      expect(logs[0]!.args.receiver).toBe(receiverAccount.address)
      expect(logs[0]!.args.receipt).toBeDefined()
    } finally {
      watcher.off()
    }
  })
})
