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

const account = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'

test('exports a zero-input Viem example', () => {
  expect(sourceText).toMatch(/from ['"]viem/)
  expect(sourceText).toMatch(/^const \w*client\s*=\s*Client\.create\s*\(/im)
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('installs and returns an active EIP-7702 delegation', async () => {
  await rpc('anvil_setCode', [account, '0x'])
  const { delegate, delegation } = await example()

  expect(await rpc('eth_getCode', [delegate, 'latest'])).toBe(
    '0x602a60005260206000f3',
  )
  expect(delegation?.toLowerCase()).toBe(delegate.toLowerCase())
  expect(
    String(await rpc('eth_getCode', [account, 'latest'])).toLowerCase(),
  ).toBe(`0xef0100${delegate.slice(2).toLowerCase()}`)
  expect(BigInt(await rpc('eth_call', [{ to: account }, 'latest']))).toBe(42n)
}, 120_000)
