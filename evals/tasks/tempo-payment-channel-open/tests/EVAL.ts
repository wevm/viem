import { readFileSync } from 'node:fs'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const channelReserve = '0x4d50500000000000000000000000000000000000'
const payer = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

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

async function balanceOf(account: string) {
  const data = `0x70a08231${account.slice(2).toLowerCase().padStart(64, '0')}`
  return BigInt(await rpc('eth_call', [{ to: pathUsd, data }, 'latest']))
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
  return {
    closeRequestedAt: word(2),
    deposit: word(1),
    settled: word(0),
  }
}

beforeAll(async () => {
  if ((await balanceOf(payer)) >= 200_000_000n) return
  await rpc('tempo_fundAddress', [payer])
  for (let i = 0; i < 300; i++) {
    if ((await balanceOf(payer)) >= 200_000_000n) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error('failed to fund dev account 0 with pathUSD')
}, 120_000)

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 60_000)

test('opens distinct channels, tops them up, and reads their state', async () => {
  const reserveBefore = await balanceOf(channelReserve)
  const result = await example()

  expect(result.first.opened.channelId).not.toBe(result.second.opened.channelId)
  expect(result.second.opened.channelId).not.toBe(result.third.opened.channelId)
  expect(['success', '0x1']).toContain(result.first.opened.receipt.status)
  expect(['success', '0x1']).toContain(result.first.topUp.receipt.status)
  expect(['success', '0x1']).toContain(result.second.opened.receipt.status)
  expect(['success', '0x1']).toContain(result.second.topUp.receipt.status)
  expect(['success', '0x1']).toContain(result.third.opened.receipt.status)

  const first = await channelState(result.first.opened.channelId)
  const second = await channelState(result.second.opened.channelId)
  const third = await channelState(result.third.opened.channelId)
  expect(first).toEqual({
    closeRequestedAt: 0n,
    deposit: 125_500_000n,
    settled: 0n,
  })
  expect(second).toEqual({
    closeRequestedAt: 0n,
    deposit: 4_000_000n,
    settled: 0n,
  })
  expect(third).toEqual({
    closeRequestedAt: 0n,
    deposit: 1_000_000n,
    settled: 0n,
  })
  expect(result.first.state.deposit).toBe(first.deposit)
  expect(result.second.state.deposit).toBe(second.deposit)
  expect(result.third.state.deposit).toBe(third.deposit)
  expect((await balanceOf(channelReserve)) - reserveBefore).toBe(130_500_000n)
}, 120_000)
