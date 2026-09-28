import {
  call,
  getBalance,
  getBlock,
  getTransactionCount,
  sendTransactionSync,
} from 'viem/actions'
import { Frame } from 'viem/frames'
import { expect, test } from 'vitest'
import { accounts, getClient } from '~test/frames/config.js'
import { resolve } from './internal/transaction.js'

const client = getClient({ account: accounts[0] })

test('sends an expiring transaction with automatic verification', async () => {
  const deadline = BigInt(Math.floor(Date.now() / 1000)) + 3600n
  const balance = await getBalance(client, { address: accounts[1].address })
  const receipt = await sendTransactionSync(client, {
    frames: [
      Frame.expiry(deadline),
      Frame.calls([{ to: accounts[1].address, value: 1n }]),
    ],
  })

  expect(receipt.status).toBe('success')
  expect(receipt.frameReceipts?.map(({ status }) => status)).toEqual([
    'success',
    'success',
    'success',
  ])
  expect(await getBalance(client, { address: accounts[1].address })).toBe(
    balance + 1n,
  )
})

test('rejects expired transactions before broadcasting', async () => {
  const nonce = await getTransactionCount(client, {
    address: accounts[0].address,
  })

  await expect(
    sendTransactionSync(client, {
      frames: [
        Frame.expiry(0n),
        Frame.calls([{ to: accounts[1].address, value: 1n }]),
      ],
    }),
  ).rejects.toThrow()

  expect(
    await getTransactionCount(client, { address: accounts[0].address }),
  ).toBe(nonce)
})

test('expiry verifier includes the deadline and rejects the following second', async () => {
  const { timestamp } = await getBlock(client)
  const deadline = timestamp + 3600n
  const frame = resolve({ frames: [Frame.expiry(deadline)] }).frames[0]!

  await expect(
    call(client, {
      to: frame.to,
      data: frame.data,
      blockOverrides: { time: deadline },
    }),
  ).resolves.toEqual({ data: undefined })
  await expect(
    call(client, {
      to: frame.to,
      data: frame.data,
      blockOverrides: { time: deadline + 1n },
    }),
  ).rejects.toThrow()
})
