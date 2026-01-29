import { expect, test } from 'vitest'
import {
  mockClientPublicActionsL2,
  zksyncClientLocalNode,
} from '../../../test/src/zksync.js'
import { getRawBlockTransactions } from './getRawBlockTransactions.js'

const client = { ...zksyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const transactions = await getRawBlockTransactions(client, {
    number: 1,
  })

  expect(transactions).toMatchInlineSnapshot(`
    [
      {
        "commonData": {
          "L1": {
            "canonicalTxHash": "0x9376f805ccd40186a73672a4d0db064060956e70c4ae486ab205291986439343",
            "deadlineBlock": 0,
            "ethBlock": 125,
            "ethHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "fullFee": "0x0",
            "gasLimit": "0x44aa200",
            "gasPerPubdataLimit": "0x320",
            "layer2TipFee": "0x0",
            "maxFeePerGas": "0x1dcd6500",
            "opProcessingType": "Common",
            "priorityQueueType": "Deque",
            "refundRecipient": "0xde03a0b5963f75f1c8485b355ff6d30f3093bde7",
            "sender": "0xde03a0b5963f75f1c8485b355ff6d30f3093bde7",
            "serialId": 0,
            "toMint": "0x7fe5cf2bea0000",
          },
          "L2": {
            "fee": {
              "gasLimit": "0x2803d",
              "gasPerPubdataLimit": "0x42",
              "maxFeePerGas": "0xee6b280",
              "maxPriorityFeePerGas": "0x0",
            },
            "initiatorAddress": "0x000000000000000000000000000000000000800b",
            "input": {
              "data": {},
              "hash": "0x",
            },
            "nonce": 0,
            "paymasterParams": {
              "paymaster": "0x0a67078A35745947A37A552174aFe724D8180c25",
              "paymasterInput": {},
            },
            "signature": {},
            "transactionType": "ProtocolUpgrade",
          },
        },
        "execute": {
          "calldata": "0xef0e2ff4000000000000000000000000000000000000000000000000000000000000010e",
          "contractAddress": "0x000000000000000000000000000000000000800b",
          "factoryDeps": "0x",
          "value": 0n,
        },
        "rawBytes": "",
        "receivedTimestampMs": 1713436617435,
      },
    ]
  `)
})
