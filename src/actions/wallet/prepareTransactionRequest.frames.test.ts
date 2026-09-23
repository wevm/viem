import { parseTransaction } from 'viem'
import { prepareTransactionRequest } from 'viem/actions'
import { expect, test } from 'vitest'
import { accounts, chain, getClient } from '~test/frames/config.js'

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
})
