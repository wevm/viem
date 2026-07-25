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

test('returns coherent transfer gas and EIP-1559 fees', async () => {
  const { fees, gas } = await example()
  expect(gas).toBe(21_000n)
  expect(fees.maxPriorityFeePerGas).toBeGreaterThanOrEqual(0n)
  expect(fees.maxFeePerGas).toBeGreaterThanOrEqual(fees.maxPriorityFeePerGas)
  const block = await rpc('eth_getBlockByNumber', ['latest', false])
  expect(fees.maxFeePerGas).toBeGreaterThanOrEqual(BigInt(block.baseFeePerGas))
}, 60_000)
