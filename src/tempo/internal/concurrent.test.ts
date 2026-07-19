import * as tempo from '~test/tempo.js'
import { afterAll, expect, test } from 'vitest'

import { Actions } from 'viem'

import * as Concurrent from './concurrent.js'

test('single request returns false', async () => {
  const result = await Concurrent.detect('0xsingle')
  expect(result).toBe(false)
})

test('concurrent requests return true', async () => {
  const results = await Promise.all([
    Concurrent.detect('0xconcurrent'),
    Concurrent.detect('0xconcurrent'),
  ])
  expect(results[0]).toBe(true)
  expect(results[1]).toBe(true)
})

test('3+ concurrent requests all return true', async () => {
  const results = await Promise.all([
    Concurrent.detect('0xtriple'),
    Concurrent.detect('0xtriple'),
    Concurrent.detect('0xtriple'),
  ])
  expect(results[0]).toBe(true)
  expect(results[1]).toBe(true)
  expect(results[2]).toBe(true)
})

test('sequential requests return false', async () => {
  expect(await Concurrent.detect('0xsequential')).toBe(false)
  expect(await Concurrent.detect('0xsequential')).toBe(false)
})

test('different keys do not interfere', async () => {
  const results = await Promise.all([
    Concurrent.detect('0xkey-a'),
    Concurrent.detect('0xkey-b'),
  ])
  expect(results[0]).toBe(false)
  expect(results[1]).toBe(false)
})

// Expiring-nonce integration (TIP-1009): `detect` drives nonceKey selection
// in the transaction prepare hook.
const liveTest = process.env.SKIP_GLOBAL_SETUP ? test.skip : test
const node = tempo.defineNode()
afterAll(() => node.stop())

const to = '0x00000000000000000000000000000000000000ff'
const maxUint256 = 2n ** 256n - 1n

/** Expiring-nonce window from node time (host clocks may skew). */
async function validBefore(client: ReturnType<typeof tempo.getClient>) {
  const block = await Actions.block.get(client)
  return Number(block.timestamp) + 25
}

liveTest(
  'sendTransaction with expiring nonce',
  { timeout: 120_000 },
  async () => {
    const client = tempo.getClient({ rpcUrl: await node.start() })
    const receipt = await Actions.transaction.sendSync(client, {
      calls: [{ to }],
      feeToken: tempo.pathUsd,
      nonceKey: 'expiring',
      validBefore: await validBefore(client),
    })
    expect(receipt.status).toBe('success')

    const transaction = await Actions.transaction.get(client, {
      hash: receipt.transactionHash,
    })
    expect(transaction.nonceKey).toBe(maxUint256)
  },
)

liveTest(
  'concurrent transactions use expiring nonces',
  { timeout: 120_000 },
  async () => {
    const client = tempo.getClient({ rpcUrl: await node.start() })
    const window = await validBefore(client)
    // Distinct recipients: identical expiring-nonce transactions share a hash.
    const receipts = await Promise.all(
      [1, 2, 3].map((i) =>
        Actions.transaction.sendSync(client, {
          calls: [{ to: `0x00000000000000000000000000000000000000f${i}` }],
          feeToken: tempo.pathUsd,
          validBefore: window,
        }),
      ),
    )
    for (const receipt of receipts) expect(receipt.status).toBe('success')

    const transactions = await Promise.all(
      receipts.map((receipt) =>
        Actions.transaction.get(client, { hash: receipt.transactionHash }),
      ),
    )
    for (const transaction of transactions)
      expect(transaction.nonceKey).toBe(maxUint256)
  },
)
