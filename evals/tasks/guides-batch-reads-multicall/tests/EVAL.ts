import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const sourceText = readFileSync('src/index.ts', 'utf8')
const owner = '0x28C6c06298d514Db089934071355E5743bf21d60'
const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

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

function decodeString(data: string) {
  const hex = data.slice(2)
  const offset = Number(BigInt(`0x${hex.slice(0, 64)}`)) * 2
  const length = Number(BigInt(`0x${hex.slice(offset, offset + 64)}`)) * 2
  return Buffer.from(
    hex.slice(offset + 64, offset + 64 + length),
    'hex',
  ).toString('utf8')
}

test('exports a zero-input Viem example', () => {
  expect(sourceText).toMatch(/from ['"]viem/)
  expect(sourceText).toMatch(/\bActions\.multicall\s*\(/)
  expect(sourceText).toMatch(/^const \w*client\s*=\s*Client\.create\s*\(/im)
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('batches and decodes the USDC summary', async () => {
  const summary = await example()
  const account = owner.slice(2).toLowerCase().padStart(64, '0')
  const [name, symbol, decimals, balance] = await Promise.all([
    rpc('eth_call', [{ data: '0x06fdde03', to: usdc }, 'latest']),
    rpc('eth_call', [{ data: '0x95d89b41', to: usdc }, 'latest']),
    rpc('eth_call', [{ data: '0x313ce567', to: usdc }, 'latest']),
    rpc('eth_call', [{ data: `0x70a08231${account}`, to: usdc }, 'latest']),
  ])
  expect(summary).toEqual({
    balance: BigInt(balance),
    decimals: Number(BigInt(decimals)),
    name: decodeString(name),
    symbol: decodeString(symbol),
  })
}, 60_000)
