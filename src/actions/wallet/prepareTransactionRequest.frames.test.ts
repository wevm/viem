import {
  defineChain,
  http,
  parseTransaction,
  serializeTransaction,
  type TransactionSerializableEIP8141,
  toBlobs,
} from 'viem'
import { prepareTransactionRequest } from 'viem/actions'
import { Frame } from 'viem/frames'
import { describe, expect, test } from 'vitest'
import { accounts, chain, getClient } from '~test/frames/config.js'
import { kzg } from '~test/kzg.js'

const client = getClient({ account: accounts[0] })

const request = {
  frames: [
    { flags: 'approveExecutionAndPayment', mode: 'verify' },
    { mode: 'sender', to: accounts[1].address, value: 1n },
  ],
  signatures: [{ scheme: 'secp256k1' }],
} as const

describe('frames: Frame', () => {
  test('resolves signing frames without signing', async () => {
    const owner = {
      ...accounts[0],
      async sign(): Promise<`0x${string}`> {
        throw new Error('Must not sign during preparation.')
      },
    }
    const frames = [
      Frame.verify({ account: owner }),
      Frame.from(() => ({
        frame: {
          flags: 'approvePayment',
          mode: 'verify',
          to: accounts[1].address,
        },
        signatures: [
          {
            scheme: 'secp256k1',
            signer: accounts[1].address,
            async sign({ hash }) {
              return accounts[1].sign({ hash })
            },
          },
        ],
      })),
      Frame.calls([{ to: accounts[1].address, value: 1n }]),
    ]

    const prepared = await prepareTransactionRequest(client, { frames })

    expect(prepared.signatures).toMatchInlineSnapshot(`
      [
        {
          "scheme": "secp256k1",
          "signer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        },
        {
          "scheme": "secp256k1",
          "signer": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        },
      ]
    `)
    expect(
      prepared.frames.map(
        ({ flags, executionGas, mode, stateGas, to, value }) => ({
          flags,
          executionGas,
          mode,
          stateGas,
          to,
          value,
        }),
      ),
    ).toMatchInlineSnapshot(`
      [
        {
          "executionGas": 100n,
          "flags": "approveExecution",
          "mode": "verify",
          "stateGas": 0n,
          "to": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "value": undefined,
        },
        {
          "executionGas": 3000n,
          "flags": "approvePayment",
          "mode": "verify",
          "stateGas": 0n,
          "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "value": undefined,
        },
        {
          "executionGas": 100n,
          "flags": undefined,
          "mode": "sender",
          "stateGas": 0n,
          "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "value": 1n,
        },
      ]
    `)
    expect(frames[0]).not.toHaveProperty('executionGas')
    expect(frames[0]).not.toHaveProperty('flags')
  })

  test('resolves custom signature indices before filling', async () => {
    const frame = Frame.from(({ signatureIndex }) => {
      return {
        frame: {
          mode: 'default',
          to: accounts[1].address,
          data: signatureIndex === 1 ? '0x01' : '0x00',
        },
        signatures: [
          {
            scheme: 'secp256k1',
            signer: accounts[1].address,
            async sign() {
              throw new Error('Must not sign during preparation.')
            },
          },
        ],
      }
    })

    const prepared = await prepareTransactionRequest(client, {
      frames: [Frame.verify({ account: accounts[0] }), frame],
    })

    expect(prepared.frames[1]?.data).toMatchInlineSnapshot(`"0x01"`)
    expect(prepared.signatures).toMatchInlineSnapshot(`
      [
        {
          "scheme": "secp256k1",
          "signer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        },
        {
          "scheme": "secp256k1",
          "signer": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        },
      ]
    `)
  })

  test('adds verification from the client account', async () => {
    const prepared = await prepareTransactionRequest(client, {
      frames: [Frame.calls([{ to: accounts[1].address, value: 1n }])],
    })

    expect(prepared.frames[0]).toMatchObject({
      flags: 'approveExecutionAndPayment',
      executionGas: 100n,
      mode: 'verify',
      stateGas: 0n,
      to: accounts[0].address,
    })
    expect(prepared.signatures).toEqual([
      { scheme: 'secp256k1', signer: accounts[0].address },
    ])
  })

  test('uses the account override for automatic verification', async () => {
    const prepared = await prepareTransactionRequest(client, {
      account: accounts[1],
      frames: [Frame.calls([{ to: accounts[0].address, value: 1n }])],
    })

    expect(prepared.frames[0]?.to).toBe(accounts[1].address)
    expect(prepared.signatures).toEqual([
      { scheme: 'secp256k1', signer: accounts[1].address },
    ])
  })
})

describe('frames: explicit', () => {
  test('default', async () => {
    const {
      account,
      chain: chain_,
      ...result
    } = await prepareTransactionRequest(client, request)

    expect(account).toBe(accounts[0])
    expect(chain_).toBeUndefined()
    expect(result).toMatchInlineSnapshot(`
      {
        "chainId": 8141,
        "frames": [
          {
            "executionGas": 100n,
            "flags": "approveExecutionAndPayment",
            "mode": "verify",
            "stateGas": 0n,
          },
          {
            "executionGas": 3000n,
            "mode": "sender",
            "stateGas": 0n,
            "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
            "value": 1n,
          },
        ],
        "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "maxFeePerBlobGas": 0n,
        "maxFeePerGas": 3600000000n,
        "maxPriorityFeePerGas": 1000000000n,
        "nonce": 0,
        "nonceKeys": [
          0n,
        ],
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "signatures": [
          {
            "scheme": "secp256k1",
          },
        ],
        "type": "eip8141",
      }
    `)
    expect(request.frames[0]).not.toHaveProperty('executionGas')
  })

  test('args: nonce and frame gas', async () => {
    const result = await prepareTransactionRequest(client, {
      ...request,
      maxFeePerGas: 10_000_000_000n,
      maxPriorityFeePerGas: 1n,
      nonce: 7,
      frames: [
        {
          flags: 'approveExecutionAndPayment',
          executionGas: 50_000n,
          mode: 'verify',
          stateGas: 0n,
        },
      ],
    })

    expect(result.nonce).toBe(7)
    expect(result.maxFeePerGas).toBe(10_000_000_000n)
    expect(result.maxPriorityFeePerGas).toBe(1n)
    expect(result.frames).toEqual([
      {
        flags: 'approveExecutionAndPayment',
        executionGas: 50_000n,
        mode: 'verify',
        stateGas: 0n,
      },
    ])
  })

  test('rejects already signed transactions', async () => {
    const serialized = await accounts[0].signTransaction({
      ...request,
      chainId: chain.id,
      sender: accounts[0].address,
    })

    const parsed = parseTransaction(serialized)
    if (parsed.type !== 'eip8141')
      throw new Error('Expected a frame transaction.')

    await expect(
      prepareTransactionRequest(client, {
        ...request,
        signatures: parsed.signatures,
      }),
    ).rejects.toThrow(
      'Signed frame transactions must be sent with sendRawTransaction.',
    )

    await expect(
      prepareTransactionRequest(client, {
        ...request,
        blobs: toBlobs({ data: '0x1234' }),
        kzg,
        parameters: ['blobVersionedHashes'],
        signatures: parsed.signatures,
      } as never),
    ).rejects.toThrow(
      'Signed frame transactions must be sent with sendRawTransaction.',
    )
  })

  test('does not fill a fully prepared frame transaction', async () => {
    const prepared = await prepareTransactionRequest(client, request)
    const offline = getClient({
      account: accounts[0],
      transport: http('http://127.0.0.1:1', { retryCount: 0 }),
    })

    const result = await prepareTransactionRequest(offline, prepared)
    expect(result).toEqual(prepared)
    expect(result.gas).toBeUndefined()
  })

  test.each([true, false])(
    'preserves pre-fill hook frames with input frames: %s',
    async (hasFrames) => {
      const frames = [
        request.frames[0],
        { ...request.frames[1], value: 42n },
      ] as const
      const result = await prepareTransactionRequest(client, {
        ...(hasFrames ? request : {}),
        chain: defineChain({
          ...chain,
          prepareTransactionRequest: async (parameters) => ({
            account: parameters.account,
            chain: parameters.chain,
            frames,
            signatures: request.signatures,
          }),
        }),
      })
      expect(result.frames).toEqual([
        { ...frames[0], executionGas: 100n, stateGas: 0n },
        { ...frames[1], executionGas: 3000n, stateGas: 0n },
      ])
      expect(result).toHaveProperty('sender', accounts[0].address)
    },
  )

  test('preserves a fully prepared signed frame transaction', async () => {
    const prepared = await prepareTransactionRequest(client, request)
    const serialized = await accounts[0].signTransaction(
      prepared as TransactionSerializableEIP8141,
    )
    const transaction = parseTransaction(serialized)
    if (transaction.type !== 'eip8141')
      throw new Error('Expected a frame transaction.')
    const { sidecars: _sidecars, ...parsed } = transaction

    const { from: _, ...result } = await prepareTransactionRequest(
      client,
      parsed,
    )
    expect(serializeTransaction(result as TransactionSerializableEIP8141)).toBe(
      serialized,
    )

    const { from: _otherFrom, ...withOtherAccount } =
      await prepareTransactionRequest(
        getClient({ account: accounts[1] }),
        parsed,
      )
    expect(
      serializeTransaction(withOtherAccount as TransactionSerializableEIP8141),
    ).toBe(serialized)

    for (const field of [
      'chainId',
      'nonce',
      'maxFeePerGas',
      'maxPriorityFeePerGas',
    ] as const)
      await expect(
        prepareTransactionRequest(client, { ...parsed, [field]: undefined }),
      ).rejects.toThrow(
        'Signed frame transactions must be sent with sendRawTransaction.',
      )

    for (const field of ['executionGas', 'stateGas'] as const)
      await expect(
        prepareTransactionRequest(client, {
          ...parsed,
          frames: parsed.frames.map((frame) => ({
            ...frame,
            [field]: undefined,
          })),
        }),
      ).rejects.toThrow(
        'Signed frame transactions must be sent with sendRawTransaction.',
      )

    const unchanged = await prepareTransactionRequest(client, {
      ...parsed,
      blobs: toBlobs({ data: '0x1234' }),
      kzg,
      parameters: ['blobVersionedHashes'],
    } as never)
    expect(unchanged.blobVersionedHashes).toEqual(parsed.blobVersionedHashes)
  })
})
