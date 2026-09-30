import {
  fillTransaction,
  getBalance,
  sendRawTransaction,
  sendRawTransactionSync,
  signTransaction,
  waitForTransactionReceipt,
} from 'viem/actions'
import { Frame } from 'viem/frames'
import { describe, expect, test } from 'vitest'
import { accounts, getClient } from '~test/frames/config.js'
import type * as FrameTransaction from '../../frames/internal/transaction.js'

const client = getClient({ account: accounts[0].address })

describe('frames: Frame', () => {
  test('default', async () => {
    const result = await fillTransaction(client, {
      frames: [Frame.verify({ account: accounts[0] })],
    })

    const { frameContext, ...transaction } =
      result.transaction as FrameTransaction.Prepared<typeof result.transaction>
    expect(frameContext?.entries.length).toBeGreaterThan(0)
    expect(transaction).toMatchInlineSnapshot(`
      {
        "blobVersionedHashes": [],
        "chainId": 8141,
        "data": undefined,
        "frames": [
          {
            "executionGas": 100n,
            "flags": "approveExecutionAndPayment",
            "mode": "verify",
            "stateGas": 0n,
            "to": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          },
        ],
        "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "gas": undefined,
        "gasPrice": undefined,
        "hash": "0x471c3a4f0c980e9ec9d06a6450462473ead305211e3830bb8b8976315a0e5c87",
        "maxFeePerBlobGas": 0n,
        "maxFeePerGas": 3600000000n,
        "maxPriorityFeePerGas": 1000000000n,
        "nonce": 0,
        "nonceKeys": [
          0n,
        ],
        "signatures": [
          {
            "payload": "0x",
            "scheme": "secp256k1",
            "signer": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
          },
        ],
        "to": null,
        "type": "eip8141",
        "typeHex": "0x6",
        "value": undefined,
      }
    `)
  })

  test('expands atomic calls without signing or changing state', async () => {
    const balance = await getBalance(client, { address: accounts[1].address })
    const frames = [
      Frame.verify({
        account: {
          ...accounts[0],
          async sign() {
            throw new Error('Simulation must not sign.')
          },
        },
        executionGas: 50_000n,
        stateGas: 0n,
      }),
      Frame.calls([
        {
          to: accounts[1].address,
          value: 1n,
          executionGas: 50_000n,
          stateGas: 0n,
        },
        {
          to: accounts[1].address,
          value: 2n,
          executionGas: 50_000n,
          stateGas: 0n,
        },
      ]),
    ]
    const result = await fillTransaction(client, { frames })

    expect(result.transaction.frames).toMatchInlineSnapshot(`
      [
        {
          "executionGas": 50000n,
          "flags": "approveExecutionAndPayment",
          "mode": "verify",
          "stateGas": 0n,
          "to": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        },
        {
          "executionGas": 50000n,
          "flags": "atomicBatch",
          "mode": "sender",
          "stateGas": 0n,
          "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "value": 1n,
        },
        {
          "executionGas": 50000n,
          "mode": "sender",
          "stateGas": 0n,
          "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "value": 2n,
        },
      ]
    `)
    expect(frames).toHaveLength(2)
    expect(await getBalance(client, { address: accounts[1].address })).toBe(
      balance,
    )
  })
})

describe('frames: explicit', () => {
  test('default', async () => {
    const result = await fillTransaction(client, {
      signatures: [{ scheme: 'secp256k1' }],
      frames: [{ flags: 'approveExecutionAndPayment', mode: 'verify' }],
    })

    expect(result).toMatchInlineSnapshot(`
      {
        "raw": "0x06f838821fcdc1808094f39fd6e51aad88f6f4ce6ab8827279cfffb92266c9c8010380c264808080c5c401808080cb843b9aca0084b2d05e0080c0",
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
          "hash": "0xe23e06ddb70bccd295a46087afea90b6ba4e2934232a70042ba909d7472d9181",
          "maxFeePerBlobGas": 0n,
          "maxFeePerGas": 3600000000n,
          "maxPriorityFeePerGas": 1000000000n,
          "nonce": 0,
          "nonceKeys": [
            0n,
          ],
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
})

describe('filled signing helpers', () => {
  test.each(['verify', 'from'] as const)(
    'preserves %s signing callbacks',
    async (kind) => {
      const frame =
        kind === 'verify'
          ? Frame.verify({
              account: accounts[0],
              executionGas: 50_000n,
              stateGas: 50_000n,
            })
          : Frame.from(() => ({
              frame: {
                mode: 'verify',
                flags: 'approveExecutionAndPayment',
                to: accounts[0].address,
                executionGas: 50_000n,
                stateGas: 50_000n,
              },
              signatures: [
                {
                  scheme: 'secp256k1',
                  signer: accounts[0].address,
                  sign: accounts[0].sign,
                },
              ],
            }))
      const { transaction } = await fillTransaction(client, {
        frames: [frame],
      })
      const { to: _to, ...request } = transaction
      const prepared = {
        ...request,
        sender: accounts[0].address,
      } as FrameTransaction.Transaction
      const signed =
        kind === 'verify'
          ? await Frame.sign(prepared.frames[0]!, { transaction: prepared })
          : prepared.frames[0]!
      const serialized = await signTransaction(client, {
        ...prepared,
        frames: [signed],
      })
      const receipt = await sendRawTransactionSync(client, {
        serializedTransaction: serialized,
      })
      expect(receipt.status).toMatchInlineSnapshot(`"success"`)
    },
  )
})
