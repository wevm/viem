import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { completeTransferRequest } from '../src/index.ts'

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

const from = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const to = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

const numeric = (value: unknown) =>
  typeof value === 'bigint' || typeof value === 'number'

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('node fills nonce, gas, fees, and chain id', async () => {
  const filled = await completeTransferRequest(client, {
    amountEther: '0.25',
    from,
    to,
  })

  // The supplied fields survive the round trip.
  expect(String(filled.to).toLowerCase()).toBe(to.toLowerCase())
  expect(BigInt(filled.value)).toBe(250_000_000_000_000_000n)

  // Nonce matches the sender's on-chain transaction count.
  const count = BigInt(await rpc('eth_getTransactionCount', [from, 'latest']))
  expect(numeric(filled.nonce)).toBe(true)
  expect(BigInt(filled.nonce)).toBe(count)

  // Gas covers a plain transfer.
  expect(numeric(filled.gas)).toBe(true)
  expect(BigInt(filled.gas)).toBeGreaterThanOrEqual(21_000n)
  expect(BigInt(filled.gas)).toBeLessThan(100_000n)

  // Fee fields are resolved.
  expect(numeric(filled.maxFeePerGas)).toBe(true)
  expect(BigInt(filled.maxFeePerGas)).toBeGreaterThan(0n)
  expect(numeric(filled.maxPriorityFeePerGas)).toBe(true)

  // Chain id pins to mainnet.
  expect(Number(filled.chainId)).toBe(1)
}, 60_000)
