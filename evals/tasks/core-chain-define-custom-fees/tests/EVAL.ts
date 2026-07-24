import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { expect, test } from 'vitest'
import { chain, estimateFees } from '../src/index.ts'

const client = Client.create({
  chain,
  transport: http(),
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
  expect(chain.id).toBe(1)
}, 60_000)

test('pins the priority fee to exactly 3 gwei', async () => {
  const fees = await estimateFees(client)
  expect(typeof fees.maxPriorityFeePerGas).toBe('bigint')
  expect(fees.maxPriorityFeePerGas).toBe(3_000_000_000n)
}, 60_000)

test('maxFeePerGas covers the base fee on top of the pinned tip', async () => {
  const fees = await estimateFees(client)
  expect(typeof fees.maxFeePerGas).toBe('bigint')
  expect(fees.maxFeePerGas).toBeGreaterThanOrEqual(fees.maxPriorityFeePerGas)

  const block = (await rpc('eth_getBlockByNumber', ['latest', false])) as {
    baseFeePerGas: string
  }
  expect(fees.maxFeePerGas).toBeGreaterThanOrEqual(
    BigInt(block.baseFeePerGas) + 3_000_000_000n,
  )
}, 60_000)
