import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { getBalances } from '../src/index.ts'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const weth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
// Binance 14 hot wallet (holds USDC + WETH at the pinned fork block).
const holder = '0x28C6c06298d514Db089934071355E5743bf21d60'
// Multicall3: a contract with no `balanceOf` (unknown selector reverts).
const nonToken = '0xcA11bde05977b3631167028862bE2a173976CA11'

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

async function balanceOf(token: string, owner: string) {
  const data = await rpc('eth_call', [
    {
      to: token,
      data: `0x70a08231${owner.slice(2).toLowerCase().padStart(64, '0')}`,
    },
    'latest',
  ])
  return BigInt(data)
}

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('mixed batch: per-call statuses, correct values, order preserved', async () => {
  const [expectedUsdc, expectedWeth] = await Promise.all([
    balanceOf(usdc, holder),
    balanceOf(weth, holder),
  ])
  expect(expectedUsdc).toBeGreaterThan(0n)

  // The bad entry is a deployed contract whose balance read reverts.
  expect(await rpc('eth_getCode', [nonToken, 'latest'])).not.toBe('0x')
  await expect(balanceOf(nonToken, holder)).rejects.toThrow()

  const results = await getBalances(client, {
    holder,
    tokens: [usdc, nonToken, weth],
  })

  expect(results).toHaveLength(3)

  expect(results[0]!.status).toBe('success')
  expect((results[0] as { balance: bigint }).balance).toBe(expectedUsdc)

  expect(results[1]!.status).toBe('failure')
  expect((results[1] as { error: Error }).error).toBeInstanceOf(Error)

  expect(results[2]!.status).toBe('success')
  expect((results[2] as { balance: bigint }).balance).toBe(expectedWeth)
}, 60_000)
