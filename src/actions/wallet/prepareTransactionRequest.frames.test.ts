import {
  defineChain,
  http,
  parseTransaction,
  serializeTransaction,
  type TransactionSerializableEIP8141,
  toBlobs,
} from 'viem'
import { prepareTransactionRequest } from 'viem/actions'
import { expect, test } from 'vitest'
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
          "flags": "approveExecutionAndPayment",
          "gas": 100n,
          "mode": "verify",
          "stateGas": 0n,
        },
        {
          "gas": 2600n,
          "mode": "sender",
          "stateGas": 0n,
          "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          "value": 1n,
        },
      ],
      "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "gas": 2700n,
      "maxFeePerBlobGas": 0n,
      "maxFeePerGas": 2100000001n,
      "maxPriorityFeePerGas": 1n,
      "nonce": 0,
      "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "signatures": [
        {
          "scheme": "secp256k1",
        },
      ],
      "type": "eip8141",
    }
  `)
  expect(request.frames[0]).not.toHaveProperty('gas')
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
        gas: 50_000n,
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
      gas: 50_000n,
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
  let requests = 0
  const client = getClient({
    account: accounts[0],
    transport: http(chain.rpcUrls.default.http[0], {
      onFetchRequest() {
        requests++
      },
    }),
  })

  const prepared = await prepareTransactionRequest(client, request)
  expect(requests).toBeGreaterThan(0)
  requests = 0

  const result = await prepareTransactionRequest(client, prepared)
  expect(requests).toBe(0)
  expect(result.frames).toEqual(prepared.frames)
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

  const { from: _, ...result } = await prepareTransactionRequest(client, parsed)
  expect(serializeTransaction(result as TransactionSerializableEIP8141)).toBe(
    serialized,
  )

  const { from: _otherFrom, ...withOtherAccount } =
    await prepareTransactionRequest(getClient({ account: accounts[1] }), parsed)
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
