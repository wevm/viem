import { fillTransaction } from 'viem/actions'
import { expect, test } from 'vitest'
import { accounts, getClient } from '~test/frames/config.js'

const client = getClient({ account: accounts[0].address })

test('default', async () => {
  const result = await fillTransaction(client, {
    frames: [{ flags: 'approveExecutionAndPayment', mode: 'verify' }],
  })

  expect(result).toMatchInlineSnapshot(`
    {
      "raw": undefined,
      "transaction": {
        "blobVersionedHashes": [],
        "blockTimestamp": null,
        "chainId": 8141,
        "data": "0x",
        "frames": [
          {
            "data": "0x",
            "flags": 3,
            "gas": 100n,
            "mode": 1,
            "stateGas": 0n,
            "value": 0n,
          },
        ],
        "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "gas": 100n,
        "gasPrice": 2100000001n,
        "hash": null,
        "input": "0x",
        "maxFeePerBlobGas": 0n,
        "maxFeePerGas": 2100000001n,
        "maxPriorityFeePerGas": 1n,
        "nonce": 0,
        "to": null,
        "type": "eip8141",
        "typeHex": "0x6",
        "value": 0n,
      },
    }
  `)
})

test.todo('fills a frame transaction for signing')

test('args: frames.gas', async () => {
  const { transaction } = await fillTransaction(client, {
    frames: [
      {
        flags: 'approveExecutionAndPayment',
        gas: 50_000n,
        mode: 'verify',
        stateGas: 0n,
      },
    ],
  })

  expect(transaction.frames).toMatchInlineSnapshot(`
    [
      {
        "data": "0x",
        "flags": 3,
        "gas": 50000n,
        "mode": 1,
        "stateGas": 0n,
        "value": 0n,
      },
    ]
  `)
})

test('fills state gas for a new recipient', async () => {
  const { transaction } = await fillTransaction(client, {
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
        "flags": 3,
        "gas": 100n,
        "mode": 1,
        "stateGas": 0n,
        "value": 0n,
      },
      {
        "data": "0x",
        "flags": 0,
        "gas": 2600n,
        "mode": 2,
        "stateGas": 183600n,
        "to": "0x000000000000000000000000000000000000dead",
        "value": 1n,
      },
    ]
  `)
})
