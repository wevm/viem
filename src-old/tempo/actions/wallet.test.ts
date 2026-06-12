import { expect, test } from 'vitest'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import type { TransactionReceipt } from '../Transaction.js'
import * as wallet from './wallet.js'

const receipt = {
  blockHash:
    '0x0000000000000000000000000000000000000000000000000000000000000001',
  blockNumber: 1n,
  contractAddress: null,
  cumulativeGasUsed: 1n,
  effectiveGasPrice: 1n,
  from: '0x0000000000000000000000000000000000000001',
  gasUsed: 1n,
  logs: [],
  logsBloom: '0x0',
  status: 'success',
  to: null,
  transactionHash:
    '0x0000000000000000000000000000000000000000000000000000000000000002',
  transactionIndex: 0,
  type: 'tempo',
} satisfies TransactionReceipt

const client = (requests: unknown[]) =>
  createClient({
    transport: custom({
      async request(request) {
        requests.push(request)

        if (request.method === 'wallet_transfer')
          return { chainId: 4321, receipt }
        if (request.method === 'wallet_swap') return { receipt }
        if (request.method === 'wallet_deposit')
          return { receipts: [receipt] } as never

        return null
      },
    }),
  })

test('transfer', async () => {
  const requests: unknown[] = []
  const result = await wallet.transfer(client(requests), {
    amount: '1.5',
    feePayer: false,
    memo: 'thanks',
    to: '0x0000000000000000000000000000000000000003',
    token: '0x0000000000000000000000000000000000000004',
  })

  expect({ requests, result }).toMatchInlineSnapshot(`
    {
      "requests": [
        {
          "method": "wallet_transfer",
          "params": [
            {
              "amount": "1.5",
              "feePayer": false,
              "memo": "thanks",
              "to": "0x0000000000000000000000000000000000000003",
              "token": "0x0000000000000000000000000000000000000004",
            },
          ],
        },
      ],
      "result": {
        "chainId": 4321,
        "receipt": {
          "blockHash": "0x0000000000000000000000000000000000000000000000000000000000000001",
          "blockNumber": 1n,
          "contractAddress": null,
          "cumulativeGasUsed": 1n,
          "effectiveGasPrice": 1n,
          "from": "0x0000000000000000000000000000000000000001",
          "gasUsed": 1n,
          "logs": [],
          "logsBloom": "0x0",
          "status": "success",
          "to": null,
          "transactionHash": "0x0000000000000000000000000000000000000000000000000000000000000002",
          "transactionIndex": 0,
          "type": "tempo",
        },
      },
    }
  `)
})

test('swap', async () => {
  const requests: unknown[] = []
  const result = await wallet.swap(client(requests), {
    amount: '2.5',
    pairToken: '0x0000000000000000000000000000000000000003',
    slippage: 0.05,
    token: '0x0000000000000000000000000000000000000004',
    type: 'sell',
  })

  expect({ requests, result }).toMatchInlineSnapshot(`
    {
      "requests": [
        {
          "method": "wallet_swap",
          "params": [
            {
              "amount": "2.5",
              "pairToken": "0x0000000000000000000000000000000000000003",
              "slippage": 0.05,
              "token": "0x0000000000000000000000000000000000000004",
              "type": "sell",
            },
          ],
        },
      ],
      "result": {
        "receipt": {
          "blockHash": "0x0000000000000000000000000000000000000000000000000000000000000001",
          "blockNumber": 1n,
          "contractAddress": null,
          "cumulativeGasUsed": 1n,
          "effectiveGasPrice": 1n,
          "from": "0x0000000000000000000000000000000000000001",
          "gasUsed": 1n,
          "logs": [],
          "logsBloom": "0x0",
          "status": "success",
          "to": null,
          "transactionHash": "0x0000000000000000000000000000000000000000000000000000000000000002",
          "transactionIndex": 0,
          "type": "tempo",
        },
      },
    }
  `)
})

test('deposit', async () => {
  const requests: unknown[] = []
  const result = await wallet.deposit(client(requests), {
    address: '0x0000000000000000000000000000000000000003',
    amount: '3.5',
    chainId: 1,
    displayName: 'Account',
    token: 'pathUsd',
  })

  expect({ requests, result }).toMatchInlineSnapshot(`
    {
      "requests": [
        {
          "method": "wallet_deposit",
          "params": [
            {
              "address": "0x0000000000000000000000000000000000000003",
              "amount": "3.5",
              "chainId": 1,
              "displayName": "Account",
              "token": "pathUsd",
            },
          ],
        },
      ],
      "result": {
        "receipts": [
          {
            "blockHash": "0x0000000000000000000000000000000000000000000000000000000000000001",
            "blockNumber": 1n,
            "contractAddress": null,
            "cumulativeGasUsed": 1n,
            "effectiveGasPrice": 1n,
            "from": "0x0000000000000000000000000000000000000001",
            "gasUsed": 1n,
            "logs": [],
            "logsBloom": "0x0",
            "status": "success",
            "to": null,
            "transactionHash": "0x0000000000000000000000000000000000000000000000000000000000000002",
            "transactionIndex": 0,
            "type": "tempo",
          },
        ],
      },
    }
  `)
})
