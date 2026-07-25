import { readFileSync } from 'node:fs'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const sourceText = readFileSync('src/index.ts', 'utf8')
const address = '0x53e205a3d2286c93630f4e1de81b95dbbf2ec241'
const balance = 1_234_567_890_123_456_789n
const code =
  '0x363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3'
const slot0 =
  '0x000000000000000000000000000000000000000000000000000000000000002a'

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

beforeAll(async () => {
  await rpc('anvil_setBalance', [address, `0x${balance.toString(16)}`])
  await rpc('anvil_setNonce', [address, '0x7'])
  await rpc('anvil_setCode', [address, code])
  await rpc('anvil_setStorageAt', [address, '0x0', slot0])
}, 60_000)

test('exports a zero-input Viem example', () => {
  expect(sourceText).toMatch(/from ['"]viem/)
  expect(sourceText).toMatch(/^const \w*client\s*=\s*Client\.create\s*\(/im)
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('reads balance, nonce, code, and storage', async () => {
  expect(await example()).toEqual({
    balance,
    code,
    nonce: 7,
    storageSlot0: slot0,
  })
}, 60_000)
