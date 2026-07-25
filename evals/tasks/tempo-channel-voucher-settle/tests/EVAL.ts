import { readFileSync } from 'node:fs'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const alphaUsd = '0x20c0000000000000000000000000000000000001'
const channelReserve = '0x4d50500000000000000000000000000000000000'
const payer = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const payee = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

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

async function channelState(channelId: string) {
  const result: string = await rpc('eth_call', [
    {
      data: `0xd18da8b1${channelId.slice(2).toLowerCase()}`,
      to: channelReserve,
    },
    'latest',
  ])
  const word = (index: number) =>
    BigInt(`0x${result.slice(2 + index * 64, 66 + index * 64)}`)
  return { deposit: word(1), settled: word(0) }
}

async function fund(account: string) {
  const pathBefore = await balanceOf(pathUsd, account)
  const alphaBefore = await balanceOf(alphaUsd, account)
  await rpc('tempo_fundAddress', [account])
  for (let i = 0; i < 300; i++) {
    const [path, alpha] = await Promise.all([
      balanceOf(pathUsd, account),
      balanceOf(alphaUsd, account),
    ])
    if (path > pathBefore && alpha > alphaBefore) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`failed to fund ${account}`)
}

beforeAll(async () => {
  if (
    (await balanceOf(pathUsd, payer)) < 10_000_000_000n ||
    (await balanceOf(alphaUsd, payer)) < 500_000_000n
  )
    await fund(payer)
  if ((await balanceOf(pathUsd, payee)) < 50_000_000n) await fund(payee)
}, 240_000)

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 60_000)

test('opens and settles two signed vouchers', async () => {
  const before = await balanceOf(alphaUsd, payee)
  const result = await example()

  expect(result.first.opened.channelId).not.toBe(result.second.opened.channelId)
  expect(['success', '0x1']).toContain(result.first.opened.receipt.status)
  expect(['success', '0x1']).toContain(result.first.settlement.receipt.status)
  expect(['success', '0x1']).toContain(result.second.opened.receipt.status)
  expect(['success', '0x1']).toContain(result.second.settlement.receipt.status)
  expect(result.first.settlement.newSettled).toBe(32_500_000n)
  expect(result.second.settlement.newSettled).toBe(750_000n)
  expect((await balanceOf(alphaUsd, payee)) - before).toBe(33_250_000n)

  expect(await channelState(result.first.opened.channelId)).toEqual({
    deposit: 100_000_000n,
    settled: 32_500_000n,
  })
  expect(await channelState(result.second.opened.channelId)).toEqual({
    deposit: 10_000_000n,
    settled: 750_000n,
  })
}, 120_000)
