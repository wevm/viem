import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const sourceText = readFileSync('src/index.ts', 'utf8')
const recipient = '0x4242424242424242424242424242424242424242'

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

test('exports a zero-input Viem example', () => {
  expect(sourceText).toMatch(/from ['"]viem/)
  expect(sourceText).toMatch(/^const \w*client\s*=\s*Client\.create\s*\(/im)
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('tracks mined and pending confirmation counts', async () => {
  const balance = BigInt(await rpc('eth_getBalance', [recipient, 'latest']))
  const result = await example()
  expect(result.receipt.status).toBe('success')
  expect(result.before).toBe(1n)
  expect(result.after).toBe(4n)
  expect(result.pending).toBe(0n)
  expect(BigInt(await rpc('eth_getBalance', [recipient, 'latest']))).toBe(
    balance + 10n ** 18n + 1n,
  )
  const receipt = await rpc('eth_getTransactionReceipt', [
    result.receipt.transactionHash,
  ])
  expect(receipt.status).toBe('0x1')
  expect(await rpc('anvil_getAutomine')).toBe(true)
}, 120_000)
