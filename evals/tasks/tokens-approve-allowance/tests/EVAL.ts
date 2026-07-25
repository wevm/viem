import { readFileSync } from 'node:fs'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const whale = '0x28C6c06298d514Db089934071355E5743bf21d60'
const owner = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const spender = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
const recipient = '0x90F79bf6EB2c4f870365E785982E1f101E93b906'

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
    typeof value === 'bigint'
      ? value.toString(16)
      : value.toLowerCase().slice(2)
  return hex.padStart(64, '0')
}

async function call(data: string) {
  return BigInt(await rpc('eth_call', [{ to: usdc, data }, 'latest']))
}

const balanceOf = (account: string) => call(`0x70a08231${word(account)}`)
const allowance = () => call(`0xdd62ed3e${word(owner)}${word(spender)}`)

beforeAll(async () => {
  await rpc('anvil_setBalance', [whale, '0xde0b6b3a7640000'])
  await rpc('anvil_impersonateAccount', [whale])
  await rpc('eth_sendTransaction', [
    {
      from: whale,
      to: usdc,
      data: `0xa9059cbb${word(owner)}${word(50_000_000n)}`,
    },
  ])
  await rpc('anvil_stopImpersonatingAccount', [whale])
}, 60_000)

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 60_000)

test('approves and spends part of the allowance', async () => {
  const ownerBefore = await balanceOf(owner)
  const recipientBefore = await balanceOf(recipient)

  const result = await example()

  expect(result.approved).toBe(25_000_000n)
  expect(result.remaining).toBe(15_000_000n)
  expect(await allowance()).toBe(15_000_000n)
  expect(await balanceOf(owner)).toBe(ownerBefore - 10_000_000n)
  expect(await balanceOf(recipient)).toBe(recipientBefore + 10_000_000n)
}, 120_000)
