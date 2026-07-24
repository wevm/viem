import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { estimateFees, estimateTransferGas } from '../src/index.ts'

const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const recipient = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

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
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('plain transfer costs exactly 21000 gas', async () => {
  const gas = await estimateTransferGas(client, {
    from: sender,
    to: recipient,
    value: 1_000_000_000_000_000_000n,
  })
  expect(gas).toBe(21_000n)
})

test('eip-1559 fee estimate is coherent', async () => {
  const fees = await estimateFees(client)
  expect(typeof fees.maxFeePerGas).toBe('bigint')
  expect(typeof fees.maxPriorityFeePerGas).toBe('bigint')
  expect(fees.maxPriorityFeePerGas).toBeGreaterThanOrEqual(0n)
  expect(fees.maxFeePerGas).toBeGreaterThanOrEqual(fees.maxPriorityFeePerGas)

  // The total fee must at least cover the current base fee.
  const block = (await rpc('eth_getBlockByNumber', ['latest', false])) as {
    baseFeePerGas: `0x${string}`
  }
  expect(fees.maxFeePerGas).toBeGreaterThanOrEqual(BigInt(block.baseFeePerGas))
})
