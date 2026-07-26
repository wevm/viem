import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { getEthBalance } from '../src/balance.ts'
import { sendPayment } from '../src/payment.ts'

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

// History-free addresses: anvil dev accounts carry EIP-7702 sweeper
// delegations on real mainnet, so forked transfers to them are swept.
const probe = '0x1111000000000000000000000000000000001111'
const recipient = '0x4242424242424242424242424242424242424242'

test('uses one account-bound viem client with public and wallet actions', () => {
  const source = readFileSync('src/client.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source.match(/\bClient\.create\s*\(/g)).toHaveLength(1)
  expect(source).toMatch(/\.extend\s*\(\s*publicActions\s*\(\s*\)\s*\)/)
  expect(source).toMatch(/\.extend\s*\(\s*walletActions\s*\(\s*\)\s*\)/)
}, 60_000)

test('balance matches raw RPC', async () => {
  await rpc('anvil_setBalance', [
    probe,
    `0x${123_456_000_000_000_000_000n.toString(16)}`,
  ])
  const raw = BigInt(await rpc('eth_getBalance', [probe, 'latest']))
  const { wei, ether } = await getEthBalance(probe)
  expect(wei).toBe(raw)
  expect(wei).toBe(123_456_000_000_000_000_000n)
  expect(ether).toBe('123.456')
}, 60_000)

test('payment moves exact ETH with a success receipt', async () => {
  const before = BigInt(await rpc('eth_getBalance', [recipient, 'latest']))
  const receipt = await sendPayment(recipient, '2.5')
  expect(receipt.status).toBe('success')
  const after = BigInt(await rpc('eth_getBalance', [recipient, 'latest']))
  expect(after - before).toBe(2_500_000_000_000_000_000n)
}, 60_000)
