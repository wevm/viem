import { Client, http } from 'viem/tempo'
import { expect, test } from 'vitest'

test('binds zone actions', () => {
  const client = Client.create({
    transport: http('http://127.0.0.1:0'),
  })

  expect({
    encryptedDepositPrepareRecipient:
      'prepareRecipient' in client.zone.encryptedDeposit,
    getEncryptionKey: typeof client.zone.getEncryptionKey,
    getEncryptionKeyCalls: 'calls' in client.zone.getEncryptionKey,
    getWithdrawalFee: typeof client.zone.getWithdrawalFee,
    requestWithdrawalPrepare: 'prepare' in client.zone.requestWithdrawal,
    waitForDepositStatus: typeof client.zone.waitForDepositStatus,
  }).toMatchInlineSnapshot(`
    {
      "encryptedDepositPrepareRecipient": false,
      "getEncryptionKey": "function",
      "getEncryptionKeyCalls": false,
      "getWithdrawalFee": "function",
      "requestWithdrawalPrepare": false,
      "waitForDepositStatus": "function",
    }
  `)
})
