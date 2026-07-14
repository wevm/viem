import { expect, test } from 'vitest'

import { Block } from 'viem/op-stack'

const transaction = {
  blockHash:
    '0xd981071322be9757dc3b5479a84d61b4f1f5dd2d44ecb66463be6cfc8246f574',
  blockNumber: '0x1',
  from: '0xacd03d601e5bb1b275bb94076ff46ed9d753435a',
  gas: '0x69',
  hash: '0x64241d12d64bb6106a9e818d83d4c9f5d49ebef3c6180e58979bf5894461f822',
  input: '0x',
  mint: '0x2a',
  nonce: '0x3',
  r: '0x0',
  s: '0x0',
  sourceHash:
    '0x18040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d7104319',
  to: '0xeb610a69341aace81ed810ed42428249512378cd',
  transactionIndex: '0x0',
  type: '0x7e',
  value: '0x0',
  yParity: '0x0',
} as const

const block = {
  baseFeePerGas: '0x1',
  difficulty: '0x0',
  extraData: '0x',
  gasLimit: '0x1c9c380',
  gasUsed: '0x69',
  hash: transaction.blockHash,
  logsBloom: '0x',
  miner: '0x4200000000000000000000000000000000000011',
  mixHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  nonce: '0x0000000000000000',
  number: '0x1',
  parentHash:
    '0x1111111111111111111111111111111111111111111111111111111111111111',
  receiptsRoot:
    '0x2222222222222222222222222222222222222222222222222222222222222222',
  sha3Uncles:
    '0x3333333333333333333333333333333333333333333333333333333333333333',
  size: '0x200',
  stateRoot:
    '0x4444444444444444444444444444444444444444444444444444444444444444',
  timestamp: '0x64',
  totalDifficulty: '0x0',
  transactions: [transaction],
  transactionsRoot:
    '0x5555555555555555555555555555555555555555555555555555555555555555',
  uncles: [],
} as const satisfies Block.Rpc<true>

test('fromRpc: converts deposit transactions', () => {
  expect(Block.fromRpc(block, { includeTransactions: true }))
    .toMatchInlineSnapshot(`
    {
      "baseFeePerGas": 1n,
      "blobGasUsed": undefined,
      "difficulty": 0n,
      "excessBlobGas": undefined,
      "extraData": "0x",
      "gasLimit": 30000000n,
      "gasUsed": 105n,
      "hash": "0xd981071322be9757dc3b5479a84d61b4f1f5dd2d44ecb66463be6cfc8246f574",
      "logsBloom": "0x",
      "miner": "0x4200000000000000000000000000000000000011",
      "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
      "nonce": "0x0000000000000000",
      "number": 1n,
      "parentHash": "0x1111111111111111111111111111111111111111111111111111111111111111",
      "receiptsRoot": "0x2222222222222222222222222222222222222222222222222222222222222222",
      "sha3Uncles": "0x3333333333333333333333333333333333333333333333333333333333333333",
      "size": 512n,
      "stateRoot": "0x4444444444444444444444444444444444444444444444444444444444444444",
      "timestamp": 100n,
      "totalDifficulty": 0n,
      "transactions": [
        {
          "blockHash": "0xd981071322be9757dc3b5479a84d61b4f1f5dd2d44ecb66463be6cfc8246f574",
          "blockNumber": 1n,
          "data": "0x",
          "from": "0xacd03d601e5bb1b275bb94076ff46ed9d753435a",
          "gas": 105n,
          "hash": "0x64241d12d64bb6106a9e818d83d4c9f5d49ebef3c6180e58979bf5894461f822",
          "input": "0x",
          "mint": 42n,
          "nonce": 3n,
          "r": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "s": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "sourceHash": "0x18040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d7104319",
          "to": "0xeb610a69341aace81ed810ed42428249512378cd",
          "transactionIndex": 0,
          "type": "deposit",
          "v": 27,
          "value": 0n,
          "yParity": 0,
        },
      ],
      "transactionsRoot": "0x5555555555555555555555555555555555555555555555555555555555555555",
      "uncles": [],
      "withdrawals": undefined,
    }
  `)
})

test('fromRpc: preserves transaction hashes', () => {
  const rpc = {
    ...block,
    transactions: [transaction.hash],
  } as const satisfies Block.Rpc<false>
  expect(Block.fromRpc(rpc).transactions).toMatchInlineSnapshot(`
    [
      "0x64241d12d64bb6106a9e818d83d4c9f5d49ebef3c6180e58979bf5894461f822",
    ]
  `)
})

test('fromRpc: null', () => {
  expect(Block.fromRpc(null)).toBeNull()
})
