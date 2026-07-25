import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const sourceText = readFileSync('src/index.ts', 'utf8')
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

test('exports a zero-input Viem example', () => {
  expect(sourceText).toMatch(/from ['"]viem/)
  expect(sourceText).toMatch(/^const \w*client\s*=\s*Client\.create\s*\(/im)
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('deploys the configured owner contract', async () => {
  const expectedOwner = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
  const { address, owner } = await example()
  expect(address).toMatch(/^0x[0-9a-fA-F]{40}$/)
  expect(owner.toLowerCase()).toBe(expectedOwner.toLowerCase())
  expect(await rpc('eth_getCode', [address, 'latest'])).toBe(
    '0x5f545f5260205ff3',
  )
  const stored = await rpc('eth_call', [
    { data: '0x8da5cb5b', to: address },
    'latest',
  ])
  expect(`0x${stored.slice(-40)}`.toLowerCase()).toBe(
    expectedOwner.toLowerCase(),
  )
}, 120_000)
