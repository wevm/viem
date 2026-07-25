import { readFileSync } from 'node:fs'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const dex = '0xdec0000000000000000000000000000000000000'
const maker = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const taker = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

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

async function fund(account: string) {
  if ((await balanceOf(pathUsd, account)) >= 100_000_000n) return
  await rpc('tempo_fundAddress', [account])
  for (let i = 0; i < 300; i++) {
    if ((await balanceOf(pathUsd, account)) >= 100_000_000n) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`failed to fund ${account} with pathUSD`)
}

beforeAll(async () => {
  await fund(maker)
  await fund(taker)
}, 120_000)

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 60_000)

test('lists a market and settles two exact-output buys', async () => {
  const dexPathBefore = await balanceOf(pathUsd, dex)
  const result = await example()

  expect(result.quote.toLowerCase()).toBe(pathUsd)
  expect(result.order).toMatchObject({
    amount: 500_000_000n,
    isBid: false,
    tick: 100,
  })
  expect(result.first.quote).toBe(25_025_000n)
  expect(result.second.quote).toBe(10_010_000n)
  expect(['success', '0x1']).toContain(result.first.buy.receipt.status)
  expect(['success', '0x1']).toContain(result.second.buy.receipt.status)
  expect(await balanceOf(result.base, taker)).toBe(35_000_000n)
  expect(await balanceOf(result.base, dex)).toBe(465_000_000n)
  expect(await balanceOf(result.base, maker)).toBe(999_500_000_000n)
  expect((await balanceOf(pathUsd, dex)) - dexPathBefore).toBe(
    result.first.quote + result.second.quote,
  )
}, 120_000)
