import { parseTransaction, type TransactionSerializableEIP8141 } from 'viem'
import { call, getBalance, getTransactionCount } from 'viem/actions'
import { expect, test } from 'vitest'
import { accounts, chain, getClient } from '~test/frames/config.js'

const client = getClient({ account: accounts[0].address })

test('default', async () => {
  const result = await call(client, {
    signatures: [{ scheme: 'secp256k1' }],
    frames: [
      {
        flags: 'approveExecutionAndPayment',
        executionGas: 50_000n,
        stateGas: 0n,
        mode: 'verify',
      },
    ],
  })

  expect(result).toMatchInlineSnapshot(`
    {
      "data": undefined,
    }
  `)
})

test('args: signatures', async () => {
  const balance = await getBalance(client, { address: accounts[1].address })

  const nonce = await getTransactionCount(client, {
    address: accounts[0].address,
  })

  const transaction = {
    blobVersionedHashes: [],
    maxFeePerBlobGas: 0n,
    chainId: chain.id,
    frames: [
      {
        flags: 'approveExecutionAndPayment',
        executionGas: 50_000n,
        stateGas: 0n,
        mode: 'verify',
      },
      {
        executionGas: 50_000n,
        stateGas: 0n,
        mode: 'sender',
        to: accounts[1].address,
        value: 1n,
      },
      {
        data: '0xdeadbeef',
        executionGas: 50_000n,
        stateGas: 0n,
        mode: 'sender',
        to: '0x0000000000000000000000000000000000000004',
      },
    ],
    maxFeePerGas: 10_000_000_000n,
    maxPriorityFeePerGas: 1_000_000_000n,
    nonce,
    sender: accounts[0].address,
    signatures: [{ scheme: 'secp256k1' }],
  } satisfies TransactionSerializableEIP8141

  const serialized = await accounts[0].signTransaction(transaction)
  const parsed = parseTransaction(serialized)
  if (parsed.type !== 'eip8141')
    throw new Error('Expected a frame transaction.')
  const { sender, ...request } = transaction
  const parameters = {
    ...request,
    account: sender,
    signatures: parsed.signatures,
  } as const

  expect(await call(client, parameters)).toMatchInlineSnapshot(`
    {
      "data": undefined,
    }
  `)

  await expect(
    call(client, {
      ...parameters,
      frames: [{ executionGas: 50_000n, stateGas: 0n, mode: 255 }],
    }),
  ).rejects.toMatchObject({ cause: { code: -32602 } })

  expect(await getBalance(client, { address: accounts[1].address })).toBe(
    balance,
  )
  expect(
    await getTransactionCount(client, { address: accounts[0].address }),
  ).toBe(nonce)
})

test('rejects EOA verification without a signature placeholder', async () => {
  await expect(
    call(client, {
      frames: [
        {
          flags: 'approveExecutionAndPayment',
          executionGas: 50_000n,
          stateGas: 0n,
          mode: 'verify',
        },
      ],
    }),
  ).rejects.toThrow('EIP-8141 VERIFY frame failed')
})
