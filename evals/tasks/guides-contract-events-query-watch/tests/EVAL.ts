import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const sourceText = readFileSync('src/index.ts', 'utf8')
const alice = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const bob = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
const token = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const whale = '0x28C6c06298d514Db089934071355E5743bf21d60'

async function rpc(method: string, params: unknown[]) {
  // Retry transient DNS/socket failures seen under parallel suite load.
  const payload = await (async () => {
    for (let attempt = 0; ; attempt++) {
      try {
        const response = await fetch('http://anvil:8545', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
        })
        return (await response.json()) as any
      } catch (error) {
        if (attempt === 2) throw error
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }
  })()
  const { result, error } = payload
  if (error) throw new Error(error.message)
  return result
}

async function balanceOf(address: string) {
  const data = `0x70a08231${address.slice(2).toLowerCase().padStart(64, '0')}`
  return BigInt(await rpc('eth_call', [{ data, to: token }, 'latest']))
}

test('exports a zero-input Viem example', () => {
  expect(sourceText).toMatch(/from ['"]viem/)
  expect(sourceText).toMatch(/^const \w*client\s*=\s*Client\.create\s*\(/im)
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('queries transfer history and resolves the next watched transfer', async () => {
  const before = {
    alice: await balanceOf(alice),
    bob: await balanceOf(bob),
    whale: await balanceOf(whale),
  }
  const result = await example()
  expect(result.token.toLowerCase()).toBe(token.toLowerCase())
  expect(result.history).toHaveLength(2)
  expect(result.history.map(({ to, value }) => ({ to, value }))).toEqual([
    { to: alice, value: 1_500_000n },
    { to: bob, value: 77_000n },
  ])
  expect(result.watched).toEqual({
    from: whale,
    to: alice,
    value: 424_242n,
  })
  expect(await balanceOf(alice)).toBe(before.alice + 1_924_242n)
  expect(await balanceOf(bob)).toBe(before.bob + 77_000n)
  expect(await balanceOf(whale)).toBe(before.whale - 2_001_242n)
  await expect(
    rpc('eth_sendTransaction', [{ from: whale, to: alice, value: '0x1' }]),
  ).rejects.toThrow()
}, 120_000)
