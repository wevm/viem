import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { getBalance, getBlockNumber, sendPayment } from '../src/payments.ts'

const key0 =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
// History-free address: anvil dev accounts carry EIP-7702 sweeper delegations
// on real mainnet, so forked transfers to them are swept in the same tx.
const recipient = '0x4242424242424242424242424242424242424242'

async function rpc(method: string, params: unknown[]) {
  const res = await fetch('http://anvil:8545', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const { result, error } = (await res.json()) as any
  if (error) throw new Error(error.message)
  return result
}

test('uses viem', () => {
  expect(readFileSync('src/payments.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('reads the block number', async () => {
  expect(Number(await getBlockNumber())).toBeGreaterThanOrEqual(24_000_000)
})

test('sends a payment and preserves behavior', async () => {
  const beforeWei = BigInt(await rpc('eth_getBalance', [recipient, 'latest']))
  const before = Number(await getBalance(recipient))
  const receipt = await sendPayment(key0, recipient, '1')
  expect(receipt.status).toBe('success')
  const afterWei = BigInt(await rpc('eth_getBalance', [recipient, 'latest']))
  const after = Number(await getBalance(recipient))
  expect(afterWei - beforeWei).toBe(1_000_000_000_000_000_000n)
  expect(after - before).toBeCloseTo(1, 3)
})
