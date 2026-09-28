import { Transaction as ox_Transaction } from 'ox'
import { expect, test } from 'vitest'

import { Transaction } from 'viem/op-stack'

const deposit = {
  blockHash:
    '0xd981071322be9757dc3b5479a84d61b4f1f5dd2d44ecb66463be6cfc8246f574',
  blockNumber: '0x1',
  from: '0xacd03d601e5bb1b275bb94076ff46ed9d753435a',
  gas: '0x69',
  gasPrice: '0x0',
  hash: '0x64241d12d64bb6106a9e818d83d4c9f5d49ebef3c6180e58979bf5894461f822',
  input: '0x',
  isSystemTx: false,
  maxFeePerGas: '0x1',
  maxPriorityFeePerGas: '0x2',
  mint: '0x2a',
  nonce: '0x3',
  r: '0x0',
  s: '0x0',
  sourceHash:
    '0x18040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d7104319',
  to: '0xeb610a69341aace81ed810ed42428249512378cd',
  transactionIndex: '0x4',
  type: '0x7e',
  value: '0x69',
  yParity: '0x0',
} as const satisfies Transaction.DepositRpc

test('fromRpc: deposit transaction', () => {
  expect(Transaction.fromRpc(deposit)).toMatchInlineSnapshot(`
    {
      "blockHash": "0xd981071322be9757dc3b5479a84d61b4f1f5dd2d44ecb66463be6cfc8246f574",
      "blockNumber": 1n,
      "data": "0x",
      "from": "0xacd03d601e5bb1b275bb94076ff46ed9d753435a",
      "gas": 105n,
      "gasPrice": 0n,
      "hash": "0x64241d12d64bb6106a9e818d83d4c9f5d49ebef3c6180e58979bf5894461f822",
      "input": "0x",
      "isSystemTx": false,
      "maxFeePerGas": 1n,
      "maxPriorityFeePerGas": 2n,
      "mint": 42n,
      "nonce": 3n,
      "r": "0x0000000000000000000000000000000000000000000000000000000000000000",
      "s": "0x0000000000000000000000000000000000000000000000000000000000000000",
      "sourceHash": "0x18040f35752170c3339ddcd850f185c9cc46bdef4d6e1f2ab323f4d3d7104319",
      "to": "0xeb610a69341aace81ed810ed42428249512378cd",
      "transactionIndex": 4,
      "type": "deposit",
      "v": 27,
      "value": 105n,
      "yParity": 0,
    }
  `)
})

test('fromRpc: standard transaction', () => {
  const transaction = {
    accessList: [],
    blockHash: deposit.blockHash,
    blockNumber: deposit.blockNumber,
    chainId: '0x1',
    from: deposit.from,
    gas: deposit.gas,
    hash: deposit.hash,
    input: deposit.input,
    maxFeePerGas: deposit.maxFeePerGas,
    maxPriorityFeePerGas: deposit.maxPriorityFeePerGas,
    nonce: deposit.nonce,
    r: deposit.r,
    s: deposit.s,
    to: deposit.to,
    transactionIndex: deposit.transactionIndex,
    type: '0x2',
    value: deposit.value,
    yParity: deposit.yParity,
  } as const satisfies ox_Transaction.Eip1559Rpc

  expect(Transaction.fromRpc(transaction)).toMatchInlineSnapshot(`
    {
      "accessList": [],
      "blockHash": "0xd981071322be9757dc3b5479a84d61b4f1f5dd2d44ecb66463be6cfc8246f574",
      "blockNumber": 1n,
      "chainId": 1,
      "data": "0x",
      "from": "0xacd03d601e5bb1b275bb94076ff46ed9d753435a",
      "gas": 105n,
      "hash": "0x64241d12d64bb6106a9e818d83d4c9f5d49ebef3c6180e58979bf5894461f822",
      "input": "0x",
      "maxFeePerGas": 1n,
      "maxPriorityFeePerGas": 2n,
      "nonce": 3n,
      "r": "0x0000000000000000000000000000000000000000000000000000000000000000",
      "s": "0x0000000000000000000000000000000000000000000000000000000000000000",
      "to": "0xeb610a69341aace81ed810ed42428249512378cd",
      "transactionIndex": 4,
      "type": "eip1559",
      "v": 27,
      "value": 105n,
      "yParity": 0,
    }
  `)
})

test('fromRpc: null', () => {
  expect(Transaction.fromRpc(null)).toBeNull()
})
