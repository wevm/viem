import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const whale = '0x28C6c06298d514Db089934071355E5743bf21d60'
const sender = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
const recipient = '0x4242424242424242424242424242424242424242'

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
  const hex = typeof value === 'bigint' ? value.toString(16) : value.slice(2)
  return hex.toLowerCase().padStart(64, '0')
}

async function balanceOf(address: string) {
  return BigInt(
    await rpc('eth_call', [
      { to: usdc, data: `0x70a08231${word(address)}` },
      'latest',
    ]),
  )
}

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 60_000)

test('transfers exactly 1.5 USDC', async () => {
  await rpc('anvil_setBalance', [whale, '0x8ac7230489e80000'])
  await rpc('anvil_impersonateAccount', [whale])
  try {
    await rpc('eth_sendTransaction', [
      {
        from: whale,
        to: usdc,
        data: `0xa9059cbb${word(sender)}${word(10_000_000n)}`,
      },
    ])
  } finally {
    await rpc('anvil_stopImpersonatingAccount', [whale])
  }

  const senderBefore = await balanceOf(sender)
  const recipientBefore = await balanceOf(recipient)
  const receipt = await example()

  expect(receipt.status).toBe('success')
  expect((await balanceOf(recipient)) - recipientBefore).toBe(1_500_000n)
  expect(senderBefore - (await balanceOf(sender))).toBe(1_500_000n)
}, 120_000)
