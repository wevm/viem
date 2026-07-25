import { readFileSync } from 'node:fs'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const recipient = '0x4242424242424242424242424242424242424242'

async function rpc(method: string, params: unknown[]) {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const { result, error } = (await res.json()) as any
  if (error) throw new Error(error.message)
  return result
}

async function balanceOf(token: string, account: string) {
  const data = `0x70a08231${account.slice(2).toLowerCase().padStart(64, '0')}`
  return BigInt(await rpc('eth_call', [{ to: token, data }, 'latest']))
}

async function totalSupply(token: string) {
  return BigInt(
    await rpc('eth_call', [{ to: token, data: '0x18160ddd' }, 'latest']),
  )
}

beforeAll(async () => {
  // Dev account 0 holds faucet-seeded pathUSD at genesis; top up if not.
  if ((await balanceOf(pathUsd, sender)) >= 100_000_000n) return
  await rpc('tempo_fundAddress', [sender])
  for (let i = 0; i < 300; i++) {
    if ((await balanceOf(pathUsd, sender)) >= 100_000_000n) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error('failed to fund dev account 0 with pathUSD')
}, 120_000)

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 60_000)

test('creates, mints, and burns exact amounts', async () => {
  const result = await example()
  const { token } = result
  expect(await rpc('eth_getCode', [token, 'latest'])).not.toBe('0x')
  expect(['success', '0x1']).toContain(result.first.receipt.status)
  expect(['success', '0x1']).toContain(result.second.receipt.status)
  expect(['success', '0x1']).toContain(result.burn.receipt.status)
  expect(result.first.balance).toBe(12_500_000n)
  expect(result.first.totalSupply).toBe(12_500_000n)
  expect(result.second.balance).toBe(3_250_000n)
  expect(result.second.totalSupply).toBe(15_750_000n)
  expect(result.burn.balance).toBe(8_250_000n)
  expect(result.burn.totalSupply).toBe(11_500_000n)
  expect(await balanceOf(token, sender)).toBe(8_250_000n)
  expect(await balanceOf(token, recipient)).toBe(3_250_000n)
  expect(await totalSupply(token)).toBe(11_500_000n)
}, 120_000)
