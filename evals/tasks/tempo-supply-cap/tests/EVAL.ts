import { readFileSync } from 'node:fs'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const recipient = '0x4242424242424242424242424242424242424242'
const recipient2 = '0x4343434343434343434343434343434343434343'

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

async function call(to: string, data: string) {
  return BigInt(await rpc('eth_call', [{ to, data }, 'latest']))
}

async function balanceOf(token: string, account: string) {
  const data = `0x70a08231${account.slice(2).toLowerCase().padStart(64, '0')}`
  return call(token, data)
}

async function totalSupply(token: string) {
  return call(token, '0x18160ddd')
}

async function supplyCap(token: string) {
  return call(token, '0x8f770ad0')
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
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/\bContractFunctionRevertedError\b/)
}, 60_000)

test('enforces both supply caps', async () => {
  const { first, second } = await example()
  expect(first.rejected).toBe(true)
  expect(second.rejected).toBe(true)
  expect(['success', '0x1']).toContain(first.receipt.status)
  expect(['success', '0x1']).toContain(second.receipt.status)
  expect(await supplyCap(first.token)).toBe(1_000_000_000n)
  expect(await balanceOf(first.token, recipient)).toBe(1_000_000_000n)
  expect(await totalSupply(first.token)).toBe(1_000_000_000n)
  expect(await supplyCap(second.token)).toBe(250_000n)
  expect(await balanceOf(second.token, recipient2)).toBe(250_000n)
  expect(await totalSupply(second.token)).toBe(250_000n)
}, 120_000)
