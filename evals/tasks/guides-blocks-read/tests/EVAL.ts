import { readFileSync } from 'node:fs'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const sourceText = readFileSync('src/index.ts', 'utf8')
async function rpc(method: string, params: unknown[] = []) {
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
  await rpc('anvil_mine', ['0x64'])
}, 60_000)

test('exports a zero-input Viem example', () => {
  expect(sourceText).toMatch(/from ['"]viem/)
  expect(sourceText).toMatch(/^const \w*client\s*=\s*Client\.create\s*\(/im)
  expect(sourceText).toMatch(/\.transactions\.length/)
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('reads latest and finalized blocks and counts latest transactions', async () => {
  await rpc('anvil_setAutomine', [false])
  try {
    await rpc('eth_sendTransaction', [
      {
        from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        to: '0x4242424242424242424242424242424242424242',
        value: '0x1',
      },
    ])
    await rpc('eth_sendTransaction', [
      {
        from: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        to: '0x4242424242424242424242424242424242424242',
        value: '0x1',
      },
    ])
    await rpc('anvil_mine', ['0x1'])
  } finally {
    await rpc('anvil_setAutomine', [true])
  }

  const { finalized, latest, transactionCount } = await example()
  const latestRaw = await rpc('eth_getBlockByNumber', ['latest', false])
  const finalizedRaw = await rpc('eth_getBlockByNumber', ['finalized', false])
  expect(latest.hash).toBe(latestRaw.hash)
  expect(finalized.hash).toBe(finalizedRaw.hash)
  expect(transactionCount).toBe(2)
}, 120_000)
