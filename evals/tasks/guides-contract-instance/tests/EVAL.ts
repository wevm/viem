import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const sourceText = readFileSync('src/index.ts', 'utf8')
const holder = '0x28C6c06298d514Db089934071355E5743bf21d60'
const recipient = '0x4242424242424242424242424242424242424242'
const token = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

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
  expect(sourceText).toMatch(/^const \w*client\s*=\s*Client\.create\s*\(/im)
  expect(sourceText).toMatch(/\bActions\.token\.getMetadata\s*\(/)
  expect(sourceText).toMatch(/\bActions\.token\.getBalance\s*\(/)
  expect(sourceText).toMatch(/\bActions\.token\.transfer\.simulate\s*\(/)
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('reads and simulates with token actions', async () => {
  const balances = [await balanceOf(holder), await balanceOf(recipient)]
  const nonce = await rpc('eth_getTransactionCount', [holder, 'latest'])
  const report = await example()

  expect(report).toEqual({
    decimals: 6,
    holderBalance: balances[0],
    symbol: 'USDC',
    transferOk: true,
  })
  expect([await balanceOf(holder), await balanceOf(recipient)]).toEqual(
    balances,
  )
  expect(await rpc('eth_getTransactionCount', [holder, 'latest'])).toBe(nonce)
}, 60_000)
