import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const sourceText = readFileSync('src/index.ts', 'utf8')
const recipient = '0x4242424242424242424242424242424242424242'
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
  expect(sourceText).toMatch(/\bActions\.call\s*\(/)
  expect(sourceText).toMatch(/^const \w*client\s*=\s*Client\.create\s*\(/im)
  expect(sourceText).toMatch(/\bHex\.toBigInt\s*\(/)
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('builds and decodes raw USDC balance calls', async () => {
  await rpc('anvil_setBalance', [whale, '0xde0b6b3a7640000'])
  await rpc('anvil_impersonateAccount', [whale])
  try {
    const data = `0xa9059cbb${recipient
      .slice(2)
      .padStart(64, '0')}${12_345n.toString(16).padStart(64, '0')}`
    await rpc('eth_sendTransaction', [{ data, from: whale, to: token }])
  } finally {
    await rpc('anvil_stopImpersonatingAccount', [whale])
  }

  const result = await example()
  expect(result.whaleBalance).toBe(await balanceOf(whale))
  expect(result.recipientBalance).toBe(await balanceOf(recipient))
  expect(result.whaleBalance).toBeGreaterThan(0n)
  expect(result.recipientBalance).toBeGreaterThanOrEqual(12_345n)
}, 120_000)
