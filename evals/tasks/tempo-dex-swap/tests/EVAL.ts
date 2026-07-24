import { readFileSync } from 'node:fs'
import { beforeAll, expect, test } from 'vitest'
import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'
import { buyExact, quoteBuy, setupMarket } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const dex = '0xdec0000000000000000000000000000000000000'
const maker = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const makerKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const taker = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const takerKey =
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
const makerClient = Client.create({
  account: Account.fromSecp256k1(makerKey),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http(rpcUrl),
})
const takerClient = Client.create({
  account: Account.fromSecp256k1(takerKey),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http(rpcUrl),
})
const readClient = Client.create({
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http(rpcUrl),
})

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
  // Dev accounts hold faucet-seeded pathUSD at genesis; top up if not.
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

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

let base: `0x${string}`

test('sets up a market with a resting sell order', async () => {
  const suffix = Date.now().toString(36).slice(-4).toUpperCase()
  const market = await setupMarket(makerClient, {
    name: `Eval Market ${suffix}`,
    symbol: `EV${suffix}`,
  })
  expect(market?.base).toMatch(/^0x[0-9a-fA-F]{40}$/)
  expect(market?.quote?.toLowerCase()).toBe(pathUsd)
  base = market.base

  // The resting order escrows exactly 500 tokens in the DEX.
  expect(await balanceOf(base, dex)).toBe(500_000_000n)
  // The maker keeps the rest of the 1,000,000-token mint.
  expect(await balanceOf(base, maker)).toBe(999_500_000_000n)
}, 120_000)

test('buy settles both legs at exactly the quoted price', async () => {
  expect(base).toBeTruthy()
  const amountOut = 25_000_000n
  const quoted = (await quoteBuy(readClient, {
    amountOut,
    tokenIn: pathUsd,
    tokenOut: base,
  })) as bigint
  expect(typeof quoted).toBe('bigint')
  // Single resting level at tick 100: price is exactly 1.001.
  expect(quoted).toBe((amountOut * 1001n) / 1000n)

  const takerBaseBefore = await balanceOf(base, taker)
  const takerPathBefore = await balanceOf(pathUsd, taker)
  const dexBaseBefore = await balanceOf(base, dex)
  const dexPathBefore = await balanceOf(pathUsd, dex)

  // The quote must cover the swap exactly: bound the buy with it.
  const result = await buyExact(takerClient, {
    amountOut,
    maxAmountIn: quoted,
    tokenIn: pathUsd,
    tokenOut: base,
  })
  expect(result?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.receipt.status)

  // Received leg: exactly the requested output.
  expect((await balanceOf(base, taker)) - takerBaseBefore).toBe(amountOut)
  expect(dexBaseBefore - (await balanceOf(base, dex))).toBe(amountOut)
  // Paid leg: the DEX collected exactly the quoted input.
  expect((await balanceOf(pathUsd, dex)) - dexPathBefore).toBe(quoted)
  // The taker paid at least the quote (any fees are on top).
  expect(
    takerPathBefore - (await balanceOf(pathUsd, taker)),
  ).toBeGreaterThanOrEqual(quoted)
}, 120_000)

test('a second buy re-quotes and settles exactly', async () => {
  expect(base).toBeTruthy()
  const amountOut = 10_000_000n
  const quoted = (await quoteBuy(readClient, {
    amountOut,
    tokenIn: pathUsd,
    tokenOut: base,
  })) as bigint
  expect(quoted).toBe((amountOut * 1001n) / 1000n)

  const takerBaseBefore = await balanceOf(base, taker)
  const dexPathBefore = await balanceOf(pathUsd, dex)
  await buyExact(takerClient, {
    amountOut,
    maxAmountIn: quoted,
    tokenIn: pathUsd,
    tokenOut: base,
  })
  expect((await balanceOf(base, taker)) - takerBaseBefore).toBe(amountOut)
  expect((await balanceOf(pathUsd, dex)) - dexPathBefore).toBe(quoted)
}, 120_000)
