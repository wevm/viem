import type { TransactionSerializableEIP8141 } from 'viem'
import {
  getBalance,
  getBlock,
  getTransaction,
  getTransactionCount,
  getTransactionReceipt,
  sendRawTransaction,
  waitForTransactionReceipt,
} from 'viem/actions'
import { expect, test } from 'vitest'
import { accounts, chain, getClient } from '~test/frames/config.js'

const client = getClient()

test('sends and reads a frame transaction', async () => {
  const balance = await getBalance(client, { address: accounts[1].address })

  const transaction = {
    chainId: chain.id,
    frames: [
      {
        flags: 'approveExecutionAndPayment',
        executionGas: 50_000n,
        mode: 'verify',
      },
      {
        executionGas: 50_000n,
        mode: 'sender',
        to: accounts[1].address,
        value: 1n,
      },
    ],
    maxFeePerGas: 10_000_000_000n,
    maxPriorityFeePerGas: 1_000_000_000n,
    nonce: await getTransactionCount(client, { address: accounts[0].address }),
    sender: accounts[0].address,
    signatures: [{ scheme: 'secp256k1' }],
  } satisfies TransactionSerializableEIP8141

  const serializedTransaction = await accounts[0].signTransaction(transaction)
  const hash = await sendRawTransaction(client, { serializedTransaction })

  const receipt = await waitForTransactionReceipt(client, { hash })
  expect(await getTransactionReceipt(client, { hash })).toEqual(receipt)

  expect(await getBalance(client, { address: accounts[1].address })).toBe(
    balance + 1n,
  )

  const result = await getTransaction(client, { hash })
  const block = await getBlock(client, {
    blockNumber: receipt.blockNumber,
    includeTransactions: true,
  })
  expect(
    block.transactions.find((transaction) => transaction.hash === hash),
  ).toEqual(result)
  const {
    blockHash: _blockHash,
    blockNumber: _blockNumber,
    blockTimestamp: _blockTimestamp,
    gasPrice: _gasPrice,
    ...rest
  } = result
  expect(rest).toMatchInlineSnapshot(`
    {
      "blobVersionedHashes": [],
      "chainId": 8141,
      "frames": [
        {
          "data": "0x",
          "executionGas": 50000n,
          "flags": 3,
          "mode": 1,
          "stateGas": 0n,
          "value": 0n,
        },
        {
          "data": "0x",
          "executionGas": 50000n,
          "flags": 0,
          "mode": 2,
          "stateGas": 0n,
          "to": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
          "value": 1n,
        },
      ],
      "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      "gas": undefined,
      "hash": "0xe70f44501a0e0f01b8ae1b1481dd5a3b0607e704d304a737474ca8dd254a7513",
      "maxFeePerBlobGas": 0n,
      "maxFeePerGas": 10000000000n,
      "maxPriorityFeePerGas": 1000000000n,
      "nonce": 0,
      "signatures": [
        {
          "payload": "0x",
          "scheme": "secp256k1",
          "signature": {
            "r": 7254845690343915716480686244332180995932457107647172481084334145393611542947n,
            "s": 52537098450574467549177330597654798682922701812395653262853474263587830361037n,
            "yParity": 1,
          },
        },
      ],
      "to": null,
      "transactionIndex": 0,
      "type": "eip8141",
      "typeHex": "0x6",
      "value": undefined,
    }
  `)
  const {
    blockHash: _receiptBlockHash,
    blockNumber: _receiptBlockNumber,
    effectiveGasPrice: _effectiveGasPrice,
    logs,
    ...receipt_
  } = receipt
  expect({
    ...receipt_,
    frameReceipts: receipt_.frameReceipts?.map(({ logs, ...frame }) => ({
      ...frame,
      logs: logs.map(({ address, data, topics }) => ({
        address,
        data,
        topics,
      })),
    })),
    logs: logs.map(
      ({
        blockHash: _blockHash,
        blockNumber: _blockNumber,
        blockTimestamp: _blockTimestamp,
        ...log
      }) => log,
    ),
  }).toMatchInlineSnapshot(`
    {
      "blobGasPrice": 1n,
      "blobGasUsed": 0n,
      "contractAddress": null,
      "cumulativeGasUsed": 25910n,
      "frameReceipts": [
        {
          "executionGasUsed": 100n,
          "gasUsed": 100n,
          "logs": [],
          "stateGasUsed": 0n,
          "status": "success",
        },
        {
          "executionGasUsed": 3000n,
          "gasUsed": 3000n,
          "logs": [
            {
              "address": "0xfffffffffffffffffffffffffffffffffffffffe",
              "data": "0x0000000000000000000000000000000000000000000000000000000000000001",
              "topics": [
                "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
                "0x00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8",
              ],
            },
          ],
          "stateGasUsed": 0n,
          "status": "success",
        },
      ],
      "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      "gasUsed": 25910n,
      "logs": [
        {
          "address": "0xfffffffffffffffffffffffffffffffffffffffe",
          "data": "0x0000000000000000000000000000000000000000000000000000000000000001",
          "logIndex": 0,
          "removed": false,
          "topics": [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            "0x00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8",
          ],
          "transactionHash": "0xe70f44501a0e0f01b8ae1b1481dd5a3b0607e704d304a737474ca8dd254a7513",
          "transactionIndex": 0,
        },
      ],
      "logsBloom": "0x00000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000800000000002000000100000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000200008000000000000000000002000000000000000000000400000000000000000000000000000000001000000000000000000000000000000",
      "payer": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      "status": "success",
      "to": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      "transactionHash": "0xe70f44501a0e0f01b8ae1b1481dd5a3b0607e704d304a737474ca8dd254a7513",
      "transactionIndex": 0,
      "type": "eip8141",
    }
  `)
})

test('rolls back an atomic batch and skips the remaining frames', async () => {
  const balance = await getBalance(client, { address: accounts[1].address })

  const transaction = {
    chainId: chain.id,
    frames: [
      {
        flags: 'approveExecutionAndPayment',
        executionGas: 50_000n,
        mode: 'verify',
      },
      {
        flags: 'atomicBatch',
        executionGas: 50_000n,
        mode: 'sender',
        to: accounts[1].address,
        value: 1n,
      },
      // The expiry verifier reverts for a timestamp in the past.
      {
        data: '0x0000000000000000',
        flags: 'atomicBatch',
        executionGas: 50_000n,
        mode: 'sender',
        to: '0x0000000000000000000000000000000000008141',
      },
      {
        executionGas: 50_000n,
        mode: 'sender',
        to: accounts[1].address,
        value: 2n,
      },
    ],
    maxFeePerGas: 10_000_000_000n,
    maxPriorityFeePerGas: 1_000_000_000n,
    nonce: await getTransactionCount(client, { address: accounts[0].address }),
    sender: accounts[0].address,
    signatures: [{ scheme: 'secp256k1' }],
  } satisfies TransactionSerializableEIP8141

  const serializedTransaction = await accounts[0].signTransaction(transaction)
  const hash = await sendRawTransaction(client, { serializedTransaction })

  const receipt = await waitForTransactionReceipt(client, { hash })

  expect(await getBalance(client, { address: accounts[1].address })).toBe(
    balance,
  )
  const {
    blockHash: _receiptBlockHash,
    blockNumber: _receiptBlockNumber,
    effectiveGasPrice: _effectiveGasPrice,
    logs,
    ...receipt_
  } = receipt
  expect({
    ...receipt_,
    frameReceipts: receipt_.frameReceipts?.map(({ logs, ...frame }) => ({
      ...frame,
      logs: logs.map(({ address, data, topics }) => ({
        address,
        data,
        topics,
      })),
    })),
    logs: logs.map(
      ({
        blockHash: _blockHash,
        blockNumber: _blockNumber,
        blockTimestamp: _blockTimestamp,
        ...log
      }) => log,
    ),
  }).toMatchInlineSnapshot(`
    {
      "blobGasPrice": 1n,
      "blobGasUsed": 0n,
      "contractAddress": null,
      "cumulativeGasUsed": 35916n,
      "frameReceipts": [
        {
          "executionGasUsed": 100n,
          "gasUsed": 100n,
          "logs": [],
          "stateGasUsed": 0n,
          "status": "success",
        },
        {
          "executionGasUsed": 3000n,
          "gasUsed": 3000n,
          "logs": [],
          "stateGasUsed": 0n,
          "status": "success",
        },
        {
          "executionGasUsed": 3056n,
          "gasUsed": 3056n,
          "logs": [],
          "stateGasUsed": 0n,
          "status": "reverted",
        },
        {
          "executionGasUsed": 0n,
          "gasUsed": 0n,
          "logs": [],
          "stateGasUsed": 0n,
          "status": "skipped",
        },
      ],
      "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      "gasUsed": 35916n,
      "logs": [],
      "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      "payer": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      "status": "reverted",
      "to": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      "transactionHash": "0xddfcff41dbe7f79808fee93270aa99923efb8cd30de70a007efd676c0807c729",
      "transactionIndex": 0,
      "type": "eip8141",
    }
  `)
})
