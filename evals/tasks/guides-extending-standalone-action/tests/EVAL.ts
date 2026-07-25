import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const sourceText = readFileSync('src/index.ts', 'utf8')
const address = '0x1111111111111111111111111111111111111111'

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
  expect(sourceText).toMatch(/\.extend\s*\(/)
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('returns the same account summary through both client surfaces', async () => {
  await rpc('anvil_setBalance', [address, '0x1b69b4bacd05f15'])
  await rpc('anvil_setNonce', [address, '0x7'])
  const result = await example()
  expect(result.viaAction).toEqual({
    balance: 123_456_789_123_456_789n,
    nonce: 7,
  })
  expect(result.viaMethod).toEqual(result.viaAction)
  expect(result.viaAction.balance).toBe(
    BigInt(await rpc('eth_getBalance', [address, 'latest'])),
  )
}, 60_000)
