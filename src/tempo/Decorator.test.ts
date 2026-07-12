import { Client, http } from 'viem/tempo'
import { expect, test } from 'vitest'

test('binds zone actions', () => {
  const client = Client.create({
    transport: http('http://127.0.0.1:0'),
  })

  expect({
    getEncryptionKey: typeof client.zone.getEncryptionKey,
    getEncryptionKeyCalls: 'calls' in client.zone.getEncryptionKey,
    waitForDepositStatus: typeof client.zone.waitForDepositStatus,
  }).toMatchInlineSnapshot(`
    {
      "getEncryptionKey": "function",
      "getEncryptionKeyCalls": false,
      "waitForDepositStatus": "function",
    }
  `)
})
