import { parseTransaction, type TransactionSerializableEIP8141 } from 'viem'
import { estimateGas, getBalance, getTransactionCount } from 'viem/actions'
import { expect, test } from 'vitest'
import { accounts, chain, getClient } from '~test/frames/config.js'

const client = getClient({ account: accounts[0].address })

test('default', async () => {
  const result = await estimateGas(client, {
    frames: [{ flags: 'approveExecutionAndPayment', mode: 'verify' }],
  })

  expect(result).toMatchInlineSnapshot(`12575n`)
})

test('args: signatures', async () => {
  const balance = await getBalance(client, { address: accounts[1].address })

  const nonce = await getTransactionCount(client, {
    address: accounts[0].address,
  })

  const transaction = {
    chainId: chain.id,
    frames: [
      { flags: 'approveExecutionAndPayment', gas: 50_000n, mode: 'verify' },
      { gas: 50_000n, mode: 'sender', to: accounts[1].address, value: 1n },
      {
        data: '0xdeadbeef',
        gas: 50_000n,
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

  expect(await estimateGas(client, parameters)).toMatchInlineSnapshot(`173329n`)

  await expect(
    estimateGas(client, {
      ...parameters,
      frames: [{ gas: 50_000n, mode: 255 }],
    }),
  ).rejects.toThrow('frame mode must be DEFAULT, VERIFY, SENDER, or POST_TX')

  expect(await getBalance(client, { address: accounts[1].address })).toBe(
    balance,
  )
  expect(
    await getTransactionCount(client, { address: accounts[0].address }),
  ).toBe(nonce)
})
