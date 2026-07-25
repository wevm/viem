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
  expect(sourceText).toMatch(/\bActions\.contract\.simulate\s*\(/)
  expect(sourceText).toMatch(/\bActions\.contract\.writeSync\s*\(/)
  expect(sourceText).toMatch(/^const \w*client\s*=\s*Client\.create\s*\(/im)
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('simulates and submits the USDC transfer', async () => {
  const before = {
    recipient: await balanceOf(recipient),
    whale: await balanceOf(whale),
  }
  const result = await example()
  expect(result.simulated).toBe(true)
  expect(result.receipt.status).toBe('success')
  expect(result.amount).toBe(12_345_678n)
  expect(result.to.toLowerCase()).toBe(recipient.toLowerCase())
  expect(result.token.toLowerCase()).toBe(token.toLowerCase())
  expect(await balanceOf(recipient)).toBe(before.recipient + result.amount)
  expect(await balanceOf(whale)).toBe(before.whale - result.amount)
  const mined = await rpc('eth_getTransactionReceipt', [
    result.receipt.transactionHash,
  ])
  expect(mined.status).toBe('0x1')
  expect(mined.from.toLowerCase()).toBe(whale.toLowerCase())
  expect(mined.to.toLowerCase()).toBe(token.toLowerCase())
  await expect(
    rpc('eth_sendTransaction', [{ from: whale, to: recipient, value: '0x1' }]),
  ).rejects.toThrow()
}, 120_000)
