import { expect, test } from 'vitest'
import {
  getEthBalance,
  getLatestBlockNumber,
  sendPayment,
} from '../src/legacy.ts'

const key0 =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
// History-free address: anvil dev accounts carry EIP-7702 sweeper delegations
// on real mainnet, so forked transfers to them are swept in the same tx.
const recipient = '0x4242424242424242424242424242424242424242'

// Read-only calls retry transient network failures under full-suite load.
async function retry<t>(fn: () => Promise<t>): Promise<t> {
  let error: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fn()
    } catch (err) {
      error = err
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
    }
  }
  throw error
}

test('reads the block number', async () => {
  expect(await retry(getLatestBlockNumber)).toBeGreaterThanOrEqual(24_000_000n)
}, 60_000)

test('sends a payment and preserves behavior', async () => {
  const before = Number(await retry(() => getEthBalance(recipient)))
  const receipt = await sendPayment(key0, recipient, '1')
  expect(receipt.status).toBe('success')
  const after = Number(await retry(() => getEthBalance(recipient)))
  expect(after - before).toBeCloseTo(1, 3)
}, 120_000)
