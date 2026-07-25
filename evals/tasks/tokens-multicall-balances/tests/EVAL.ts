import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const whale = '0x28C6c06298d514Db089934071355E5743bf21d60'
const a = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const b = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'

async function rpc(method: string, params: unknown[]) {
  const res = await fetch('http://anvil:8545', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const { result, error } = (await res.json()) as any
  if (error) throw new Error(error.message)
  return result
}

function word(value: string | bigint) {
  const hex =
    typeof value === 'bigint' ? value.toString(16) : value.replace(/^0x/, '')
  return hex.toLowerCase().padStart(64, '0')
}

async function balanceOf(owner: string) {
  return BigInt(
    await rpc('eth_call', [
      { to: usdc, data: `0x70a08231${word(owner)}` },
      'latest',
    ]),
  )
}

async function transfer(to: string, amount: bigint) {
  const hash = await rpc('eth_sendTransaction', [
    { from: whale, to: usdc, data: `0xa9059cbb${word(to)}${word(amount)}` },
  ])
  for (let i = 0; i < 100; i++) {
    const receipt = await rpc('eth_getTransactionReceipt', [hash])
    if (receipt) {
      if (receipt.status !== '0x1') throw new Error('transfer failed')
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error('transfer timed out')
}

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source.match(/\bActions\.multicall\s*\(/g)).toHaveLength(1)
  expect(source.match(/\ballowFailure\s*:\s*false/g)).toHaveLength(1)
}, 60_000)

test('returns fresh balances in account order', async () => {
  await rpc('anvil_setBalance', [whale, '0x8ac7230489e80000'])
  await rpc('anvil_impersonateAccount', [whale])
  try {
    await transfer(a, 12_345_678n)
    await transfer(b, 987_654_321n)
  } finally {
    await rpc('anvil_stopImpersonatingAccount', [whale])
  }

  const balances = await example()
  const expected = await Promise.all([
    balanceOf(whale),
    balanceOf(a),
    balanceOf(b),
  ])
  expect(balances).toEqual(expected)
  expect(balances[1]).toBeGreaterThanOrEqual(12_345_678n)
  expect(balances[2]).toBeGreaterThanOrEqual(987_654_321n)
}, 120_000)
