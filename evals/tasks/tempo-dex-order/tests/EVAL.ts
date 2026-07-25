import { readFileSync } from 'node:fs'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const dex = '0xdec0000000000000000000000000000000000000'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const maker = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const emptyBidTick = -32768
const emptyAskTick = 32767

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
  return (await rpc('eth_call', [{ to, data }, 'latest'])) as string
}

function word(value: string | bigint) {
  if (typeof value === 'bigint') return value.toString(16).padStart(64, '0')
  return value.slice(2).toLowerCase().padStart(64, '0')
}

function words(data: string) {
  const hex = data.slice(2)
  const result: string[] = []
  for (let i = 0; i < hex.length; i += 64) result.push(hex.slice(i, i + 64))
  return result
}

function toInt16(word: string) {
  const value = Number.parseInt(word.slice(-4), 16)
  return value >= 0x8000 ? value - 0x10000 : value
}

async function tokenBalance(token: string, account: string) {
  return BigInt(await call(token, `0x70a08231${word(account)}`))
}

async function dexBalance(account: string, token: string) {
  return BigInt(await call(dex, `0xf7888aec${word(account)}${word(token)}`))
}

async function rawOrder(orderId: bigint) {
  try {
    const data = await call(dex, `0x117d4128${word(orderId)}`)
    const result = words(data)
    if (result.length < 11) return undefined
    return {
      maker: `0x${result[1]!.slice(24)}`,
      remaining: BigInt(`0x${result[6]}`),
    }
  } catch {
    return undefined
  }
}

async function rawBook(base: string, quote: string) {
  const key = await call(dex, `0xcd27ca82${word(base)}${word(quote)}`)
  const result = words(await call(dex, `0x0c0dee70${key.slice(2)}`))
  return {
    bestAskTick: toInt16(result[3]!),
    bestBidTick: toInt16(result[2]!),
  }
}

beforeAll(async () => {
  if ((await tokenBalance(pathUsd, maker)) >= 100_000_000n) return
  await rpc('tempo_fundAddress', [maker])
  for (let i = 0; i < 300; i++) {
    if ((await tokenBalance(pathUsd, maker)) >= 100_000_000n) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error('failed to fund dev account 0 with pathUSD')
}, 120_000)

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 60_000)

test('creates a market and completes buy and sell order lifecycles', async () => {
  const pathBalanceBefore = await dexBalance(maker, pathUsd)
  const result = await example()

  expect(result.quote.toLowerCase()).toBe(pathUsd)
  expect(result.buy.order).toMatchObject({
    amount: 250_000_000n,
    isBid: true,
    remaining: 250_000_000n,
    tick: 40,
  })
  expect(result.buy.order.maker.toLowerCase()).toBe(maker.toLowerCase())
  expect(result.buy.book.bestBidTick).toBe(40)
  expect(result.buy.book.bestAskTick).toBe(emptyAskTick)
  expect(result.sell.order).toMatchObject({
    amount: 100_000_000n,
    isBid: false,
    remaining: 100_000_000n,
    tick: -60,
  })
  expect(result.sell.order.maker.toLowerCase()).toBe(maker.toLowerCase())
  expect(result.sell.book.bestBidTick).toBe(emptyBidTick)
  expect(result.sell.book.bestAskTick).toBe(-60)
  expect(['success', '0x1']).toContain(result.buy.canceled.receipt.status)
  expect(['success', '0x1']).toContain(result.sell.canceled.receipt.status)

  for (const orderId of [
    result.buy.placed.orderId,
    result.sell.placed.orderId,
  ]) {
    const order = await rawOrder(orderId)
    expect(
      !order || order.remaining === 0n || /^0x0{40}$/.test(order.maker),
    ).toBe(true)
  }
  expect(await rawBook(result.base, result.quote)).toEqual({
    bestAskTick: emptyAskTick,
    bestBidTick: emptyBidTick,
  })
  expect(await tokenBalance(result.base, maker)).toBe(999_900_000_000n)
  expect(await dexBalance(maker, result.base)).toBe(100_000_000n)
  expect(
    (await dexBalance(maker, pathUsd)) - pathBalanceBefore,
  ).toBeGreaterThan(250_000_000n)
}, 120_000)
