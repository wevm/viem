import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const sourceText = readFileSync('src/index.ts', 'utf8')
const from = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const to = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

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
  expect(sourceText).toMatch(/\bActions\.transaction\.fill\s*\(/)
  expect(sourceText).toMatch(/^const \w*client\s*=\s*Client\.create\s*\(/im)
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('fills every required transfer field', async () => {
  const transaction = await example()
  expect(String(transaction.from).toLowerCase()).toBe(from.toLowerCase())
  expect(String(transaction.to).toLowerCase()).toBe(to.toLowerCase())
  expect(transaction.value).toBe(250_000_000_000_000_000n)
  expect(BigInt(transaction.nonce!)).toBe(
    BigInt(await rpc('eth_getTransactionCount', [from, 'latest'])),
  )
  expect(BigInt(transaction.gas!)).toBeGreaterThanOrEqual(21_000n)
  expect(BigInt(transaction.maxFeePerGas!)).toBeGreaterThan(0n)
  expect(transaction.maxPriorityFeePerGas).toBeDefined()
  expect(transaction.chainId).toBe(1)
}, 60_000)
