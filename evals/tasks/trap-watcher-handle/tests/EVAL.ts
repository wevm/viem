import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { collectNextBlockNumbers } from '../src/index.ts'

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const client = Client.create({
  chain: mainnet,
  pollingInterval: 100,
  transport: http('http://anvil:8545'),
})

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('collects the first 3 block numbers, then goes fully quiet', async () => {
  const baseline = BigInt(await rpc('eth_blockNumber', []))

  const seen: bigint[] = []
  let resolved = false
  const promise = collectNextBlockNumbers(client, { seen }).then((value) => {
    resolved = true
    return value
  })

  // Mine one block at a time; give slow pollers time to observe each height
  // before producing the next.
  let mined = 0
  while (!resolved && mined < 8) {
    await rpc('anvil_mine', ['0x1'])
    mined++
    const deadline = Date.now() + 10_000
    while (!resolved && seen.length < mined && Date.now() < deadline)
      await sleep(100)
    // Let a pending resolution settle before mining again.
    await sleep(300)
  }
  expect(resolved).toBe(true)

  const result = await promise
  expect(result).toHaveLength(3)
  expect(seen).toEqual(result)
  expect(result[0]!).toBeGreaterThanOrEqual(baseline)
  expect(result[2]!).toBeLessThanOrEqual(baseline + BigInt(mined))
  for (let i = 1; i < result.length; i++)
    expect(result[i]! > result[i - 1]!).toBe(true)

  // The watcher must be fully stopped: mine more blocks and confirm nothing
  // is appended after resolution (covers pollers as slow as 4s).
  for (let i = 0; i < 3; i++) {
    await rpc('anvil_mine', ['0x1'])
    await sleep(1_500)
  }
  await sleep(5_000)
  expect(seen).toHaveLength(3)
}, 120_000)
