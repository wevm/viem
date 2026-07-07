import * as AbiEvent from 'ox/AbiEvent'
import * as Value from 'ox/Value'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions, Abis } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const receiverAccount = Account.fromSecp256k1(tempo.accounts[7]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })
const receiverClient = tempo.getClient({
  account: receiverAccount,
  feeToken: tempo.pathUsd,
})

async function createBlockedTransfer(amount = Value.from('10', 6)) {
  await Actions.receivePolicy.setSync(receiverClient, {
    senderPolicyId: 'reject-all',
  })
  const { receipt } = await Actions.token.transferSync(client, {
    amount,
    to: receiverAccount.address,
    token: tempo.alphaUsd,
  })
  const [log] = AbiEvent.extractLogs(Abis.receivePolicyGuard, receipt.logs, {
    eventName: 'TransferBlocked',
    strict: true,
  })
  return { amount, claimReceipt: log!.args.receipt }
}

async function waitForLogs(logs: readonly unknown[], count = 1) {
  for (let i = 0; logs.length < count && i < 50; i++)
    await new Promise((resolve) => setTimeout(resolve, 100))
}

describe('watchClaimed', () => {
  test('default', async () => {
    const { amount, claimReceipt } = await createBlockedTransfer()

    const watcher = Actions.receivePolicy.watchClaimed(client)
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.receivePolicy.claimSync(client, {
        receipt: claimReceipt,
        to: account.address,
      })

      await waitForLogs(logs)

      expect(logs).toHaveLength(1)
      expect(logs[0]!.args.amount).toBe(amount)
      expect(logs[0]!.args.to).toBe(account.address)
    } finally {
      watcher.off()
    }
  })
})
