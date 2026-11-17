import { AbiEvent, Value } from 'ox'
import * as tempo from '~test/tempo.js'
import { describe, expect, test } from 'vitest'

import { Account, Actions, Abis } from 'viem/tempo'

const account = Account.fromSecp256k1(tempo.accounts[0]!.privateKey)
const receiverAccount = Account.fromSecp256k1(tempo.accounts[8]!.privateKey)
const client = tempo.getClient({ account, feeToken: tempo.pathUsd })
const receiverClient = tempo.getClient({
  account: receiverAccount,
  feeToken: tempo.pathUsd,
})

async function createBlockedTransfer(amount = Value.from('10', 6)) {
  const { token } = await Actions.token.createSync(client, {
    currency: 'USD',
    name: 'Blocked Burn Token',
    symbol: 'BBURN',
  })
  await Actions.token.grantRolesSync(client, {
    roles: ['issuer'],
    to: account.address,
    token,
  })
  await Actions.token.mintSync(client, {
    amount: Value.from('100', 6),
    to: account.address,
    token,
  })
  await Actions.receivePolicy.setSync(receiverClient, {
    senderPolicyId: 'reject-all',
  })
  const { receipt } = await Actions.token.transferSync(client, {
    amount,
    to: receiverAccount.address,
    token,
  })
  const [log] = AbiEvent.extractLogs(Abis.receivePolicyGuard, receipt.logs, {
    eventName: 'TransferBlocked',
    strict: true,
  })
  return {
    amount,
    claimReceipt: log!.args.receipt,
    token,
  }
}

async function waitForLogs(logs: readonly unknown[], count = 1) {
  for (let i = 0; logs.length < count && i < 50; i++)
    await new Promise((resolve) => setTimeout(resolve, 100))
}

describe('watchBurned', () => {
  test('default', async () => {
    const { token, amount, claimReceipt } = await createBlockedTransfer()

    await Actions.token.grantRolesSync(client, {
      roles: ['burnBlocked'],
      to: account.address,
      token,
    })
    const { policyId } = await Actions.policy.createSync(client, {
      type: 'blacklist',
    })
    await Actions.policy.modifyBlacklistSync(client, {
      address: account.address,
      policyId,
      restricted: true,
    })
    await Actions.token.changeTransferPolicySync(client, {
      policyId,
      token,
    })

    const watcher = Actions.receivePolicy.watchBurned(client)
    const logs: any[] = []
    watcher.onLogs((batch) => logs.push(...batch))
    try {
      await Actions.receivePolicy.burnSync(client, {
        receipt: claimReceipt,
      })

      await waitForLogs(logs)

      expect(logs).toHaveLength(1)
      expect(logs[0]!.args.amount).toBe(amount)
      expect(logs[0]!.args.originator).toBe(account.address)
    } finally {
      watcher.off()
    }
  })
})
