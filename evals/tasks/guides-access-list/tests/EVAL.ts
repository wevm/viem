import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const sourceText = readFileSync('src/index.ts', 'utf8')
const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

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

test('returns the access list for the USDC name read', async () => {
  const result = await example()
  const raw = await rpc('eth_createAccessList', [
    { data: '0x06fdde03', to: usdc },
    'latest',
  ])

  expect(result.gasUsed).toBe(BigInt(raw.gasUsed))
  expect(result.accessList.length).toBeGreaterThan(0)
  const normalize = (
    accessList: readonly {
      address: string
      storageKeys: readonly string[]
    }[],
  ) =>
    accessList.map(({ address, storageKeys }) => ({
      address: address.toLowerCase(),
      storageKeys: storageKeys.map((key) => key.toLowerCase()),
    }))
  expect(normalize(result.accessList)).toEqual(normalize(raw.accessList))
}, 60_000)
