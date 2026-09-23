import {
  fillTransaction,
  getBalance,
  sendRawTransaction,
  waitForTransactionReceipt,
} from 'viem/actions'
import { expect, test } from 'vitest'
import { accounts, getClient } from '~test/frames/config.js'

const client = getClient({ account: accounts[0].address })

test('default', async () => {
  const result = await fillTransaction(client, {
    signatures: [{ scheme: 'secp256k1' }],
    frames: [{ flags: 'approveExecutionAndPayment', mode: 'verify' }],
  })

  expect(result).toMatchInlineSnapshot(`
    {
      "raw": "0x06f6821fcd8094f39fd6e51aad88f6f4ce6ab8827279cfffb92266c9c8010380c264808080c5c401808080cb843b9aca0084b2d05e0080c0",
      "transaction": {
        "blobVersionedHashes": [],
        "chainId": 8141,
        "data": undefined,
        "frames": [
          {
            "data": "0x",
            "executionGas": 100n,
            "flags": 3,
            "mode": 1,
            "stateGas": 0n,
            "value": 0n,
          },
        ],
        "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "gas": undefined,
        "gasPrice": undefined,
        "hash": "0xf1d8ee86866e8b51157bd085bac887c4d5fc6660ea12210f88b2839d7765cfaa",
        "maxFeePerBlobGas": 0n,
        "maxFeePerGas": 3600000000n,
        "maxPriorityFeePerGas": 1000000000n,
        "nonce": 0,
        "signatures": [
          {
            "payload": "0x",
            "scheme": "secp256k1",
          },
        ],
        "to": null,
        "type": "eip8141",
        "typeHex": "0x6",
        "value": undefined,
      },
    }
  `)
})

test('fills a frame transaction for signing', async () => {
  const balance = await getBalance(client, { address: accounts[1].address })

  const { transaction } = await fillTransaction(client, {
    frames: [
      { flags: 'approveExecutionAndPayment', mode: 'verify' },
      { mode: 'sender', to: accounts[1].address, value: 1n },
    ],
    signatures: [{ scheme: 'secp256k1' }],
  })
  if (transaction.type !== 'eip8141')
    throw new Error('Expected a frame transaction.')

  expect(await getBalance(client, { address: accounts[1].address })).toBe(
    balance,
  )

  const serializedTransaction = await accounts[0].signTransaction({
    chainId: transaction.chainId,
    frames: transaction.frames,
    maxFeePerGas: transaction.maxFeePerGas,
    maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
    nonce: transaction.nonce,
    sender: transaction.from,
    signatures: transaction.signatures,
  })
  const hash = await sendRawTransaction(client, { serializedTransaction })

  expect((await waitForTransactionReceipt(client, { hash })).status).toBe(
    'success',
  )
  expect(await getBalance(client, { address: accounts[1].address })).toBe(
    balance + 1n,
  )
})

test('args: frames.executionGas', async () => {
  const { transaction } = await fillTransaction(client, {
    signatures: [{ scheme: 'secp256k1' }],
    frames: [
      {
        flags: 'approveExecutionAndPayment',
        executionGas: 50_000n,
        mode: 'verify',
        stateGas: 0n,
      },
    ],
  })

  expect(transaction.frames).toMatchInlineSnapshot(`
    [
      {
        "data": "0x",
        "executionGas": 50000n,
        "flags": 3,
        "mode": 1,
        "stateGas": 0n,
        "value": 0n,
      },
    ]
  `)
})

test('fills state gas for a new recipient', async () => {
  const { transaction } = await fillTransaction(client, {
    signatures: [{ scheme: 'secp256k1' }],
    frames: [
      { flags: 'approveExecutionAndPayment', mode: 'verify' },
      {
        mode: 'sender',
        to: '0x000000000000000000000000000000000000dead',
        value: 1n,
      },
    ],
  })

  expect(transaction.frames).toMatchInlineSnapshot(`
    [
      {
        "data": "0x",
        "executionGas": 100n,
        "flags": 3,
        "mode": 1,
        "stateGas": 0n,
        "value": 0n,
      },
      {
        "data": "0x",
        "executionGas": 3000n,
        "flags": 0,
        "mode": 2,
        "stateGas": 183600n,
        "to": "0x000000000000000000000000000000000000dead",
        "value": 1n,
      },
    ]
  `)
})
