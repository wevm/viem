import { readFileSync } from 'node:fs'
import { beforeAll, expect, test } from 'vitest'
import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'
import {
  cancelOrder,
  createMarket,
  getBestTicks,
  getOrderInfo,
  placeLimitOrder,
} from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const dex = '0xdec0000000000000000000000000000000000000'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const senderKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const client = Client.create({
  account: Account.fromSecp256k1(senderKey),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http(rpcUrl),
})
const readClient = Client.create({
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http(rpcUrl),
})

// An empty book side reads int16 sentinel ticks from the node.
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
  const out: string[] = []
  for (let i = 0; i < hex.length; i += 64) out.push(hex.slice(i, i + 64))
  return out
}

function toInt16(w: string) {
  const value = Number.parseInt(w.slice(-4), 16)
  return value >= 0x8000 ? value - 0x10000 : value
}

async function tokenBalance(token: string, account: string) {
  return BigInt(await call(token, `0x70a08231${word(account)}`))
}

// DEX-held internal balance for `user` in `token` (`balanceOf(address,address)`).
async function dexBalance(user: string, token: string) {
  return BigInt(await call(dex, `0xf7888aec${word(user)}${word(token)}`))
}

// Raw `getOrder(uint128)`; `undefined` when the order no longer exists.
async function rawOrder(orderId: bigint) {
  try {
    const data = await call(dex, `0x117d4128${word(orderId)}`)
    const w = words(data)
    if (w.length < 11) return undefined
    return {
      orderId: BigInt(`0x${w[0]}`),
      maker: `0x${w[1]!.slice(24)}`,
      isBid: BigInt(`0x${w[3]}`) === 1n,
      tick: toInt16(w[4]!),
      amount: BigInt(`0x${w[5]}`),
      remaining: BigInt(`0x${w[6]}`),
    }
  } catch {
    return undefined
  }
}

// Raw `books(pairKey(base, quote))`.
async function rawBook(base: string, quote: string) {
  const key = await call(dex, `0xcd27ca82${word(base)}${word(quote)}`)
  const w = words(await call(dex, `0x0c0dee70${key.slice(2)}`))
  return {
    base: `0x${w[0]!.slice(24)}`,
    quote: `0x${w[1]!.slice(24)}`,
    bestBidTick: toInt16(w[2]!),
    bestAskTick: toInt16(w[3]!),
  }
}

beforeAll(async () => {
  // Dev account 0 holds faucet-seeded pathUSD at genesis; top up if not.
  if ((await tokenBalance(pathUsd, sender)) >= 100_000_000n) return
  await rpc('tempo_fundAddress', [sender])
  for (let i = 0; i < 300; i++) {
    if ((await tokenBalance(pathUsd, sender)) >= 100_000_000n) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error('failed to fund dev account 0 with pathUSD')
}, 120_000)

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

let market: { base: `0x${string}`; quote: `0x${string}` }
let buyOrderId: bigint

test('creates a market: minted supply and empty pair against pathUSD', async () => {
  market = await createMarket(client, {
    name: 'Desk Dollar',
    symbol: 'DESKUSD',
  })
  expect(market.base).toMatch(/^0x[0-9a-fA-F]{40}$/)
  expect(market.quote.toLowerCase()).toBe(pathUsd)
  expect(await tokenBalance(market.base, sender)).toBe(1_000_000_000_000n)
  const book = await rawBook(market.base, pathUsd)
  expect(book.base).toBe(market.base.toLowerCase())
  expect(book.bestBidTick).toBe(emptyBidTick)
  expect(book.bestAskTick).toBe(emptyAskTick)
}, 120_000)

test('places a buy limit order readable onchain with exact amounts', async () => {
  const placed = await placeLimitOrder(client, {
    token: market.base,
    amount: 250_000_000n,
    tick: 40,
    side: 'buy',
  })
  expect(['success', '0x1']).toContain(placed.receipt.status)
  expect(placed.orderId).toBeGreaterThan(0n)
  buyOrderId = placed.orderId

  const order = await rawOrder(buyOrderId)
  expect(order).toBeTruthy()
  expect(order!.orderId).toBe(buyOrderId)
  expect(order!.maker).toBe(sender.toLowerCase())
  expect(order!.isBid).toBe(true)
  expect(order!.tick).toBe(40)
  expect(order!.amount).toBe(250_000_000n)
  expect(order!.remaining).toBe(250_000_000n)
}, 120_000)

test('order and book reads report the resting order', async () => {
  const info = await getOrderInfo(readClient, { orderId: buyOrderId })
  expect(info.maker.toLowerCase()).toBe(sender.toLowerCase())
  expect(info.amount).toBe(250_000_000n)
  expect(info.remaining).toBe(250_000_000n)
  expect(info.tick).toBe(40)
  expect(info.isBid).toBe(true)

  const ticks = await getBestTicks(readClient, market)
  expect(ticks.bestBidTick).toBe(40)
  expect(ticks.bestAskTick).toBe(emptyAskTick)
}, 120_000)

test('cancel clears the order and returns the escrowed quote', async () => {
  const before = await dexBalance(sender, pathUsd)
  const result = await cancelOrder(client, { orderId: buyOrderId })
  expect(['success', '0x1']).toContain(result.receipt.status)

  const order = await rawOrder(buyOrderId)
  const cleared =
    !order || order.remaining === 0n || /^0x0{40}$/.test(order.maker)
  expect(cleared).toBe(true)

  const book = await rawBook(market.base, pathUsd)
  expect(book.bestBidTick).toBe(emptyBidTick)

  // A tick-40 buy escrows at least amount * 1.0004 in quote; cancel refunds it
  // to the maker's DEX balance.
  const refund = (await dexBalance(sender, pathUsd)) - before
  expect(refund).toBeGreaterThanOrEqual((250_000_000n * 100_040n) / 100_000n)
}, 120_000)

test('sell order lifecycle: rests on the ask side, cancel refunds base', async () => {
  const placed = await placeLimitOrder(client, {
    token: market.base,
    amount: 100_000_000n,
    tick: -60,
    side: 'sell',
  })
  const order = await rawOrder(placed.orderId)
  expect(order).toBeTruthy()
  expect(order!.maker).toBe(sender.toLowerCase())
  expect(order!.isBid).toBe(false)
  expect(order!.tick).toBe(-60)
  expect(order!.amount).toBe(100_000_000n)

  const ticks = await getBestTicks(readClient, market)
  expect(ticks.bestAskTick).toBe(-60)

  const before = await dexBalance(sender, market.base)
  await cancelOrder(client, { orderId: placed.orderId })
  expect((await dexBalance(sender, market.base)) - before).toBe(100_000_000n)
}, 120_000)
