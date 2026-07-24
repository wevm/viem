import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { getTokenBalance } from '../src/index.ts'

const usdc = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const binance14 = '0x28c6c06298d514db089934071355e5743bf21d60'
// History-free address (no code, no token balance at the pinned fork block).
const recipient = '0x4242424242424242424242424242424242424242'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

// Retries transient network failures (Docker DNS, socket resets) under parallel load.
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn()
    } catch (error) {
      const message = `${(error as Error)?.message ?? error} ${(error as Error)?.cause ?? ''}`
      const transient =
        /fetch failed|HTTP request failed|socket|ENOTFOUND|ECONNREFUSED|ECONNRESET|EAI_AGAIN|UND_ERR|other side closed|terminated|timed out|timeout/i.test(
          message,
        )
      if (!transient || attempt >= 3) throw error
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
    }
  }
}

async function rpcOnce(method: string, params: unknown[]) {
  const res = await fetch('http://anvil:8545', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const { result, error } = (await res.json()) as any
  if (error) throw new Error(error.message)
  return result
}

async function rpc(method: string, params: unknown[]) {
  return withRetry(() => rpcOnce(method, params))
}

// Raw balanceOf read, independent of the agent's implementation.
async function balanceOf(holder: string): Promise<bigint> {
  const data = `0x70a08231${holder.slice(2).padStart(64, '0')}`
  return BigInt(await rpc('eth_call', [{ to: usdc, data }, 'latest']))
}

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 60_000)

test('reads the pinned USDC balance of Binance 14', async () => {
  expect(
    await withRetry(() =>
      getTokenBalance(client, { holder: binance14, token: usdc }),
    ),
  ).toBe(31_872_448_355n)
}, 60_000)

test('observes a whale transfer through the same function', async () => {
  const before = await withRetry(() =>
    getTokenBalance(client, { holder: recipient, token: usdc }),
  )
  await rpc('anvil_setBalance', [binance14, '0xde0b6b3a7640000'])
  await rpc('anvil_impersonateAccount', [binance14])
  // transfer(address,uint256) of 12345 base units to the recipient.
  const data = `0xa9059cbb${recipient.slice(2).padStart(64, '0')}${12_345n
    .toString(16)
    .padStart(64, '0')}`
  // Skip resend when the transfer already landed (a lost response must not double-send).
  await withRetry(async () => {
    if ((await balanceOf(recipient)) - before === 12_345n) return
    await rpcOnce('eth_sendTransaction', [{ from: binance14, to: usdc, data }])
  })
  expect(
    (await withRetry(() =>
      getTokenBalance(client, { holder: recipient, token: usdc }),
    )) - before,
  ).toBe(12_345n)
}, 120_000)
