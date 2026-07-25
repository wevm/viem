import { readFileSync } from 'node:fs'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const alphaUsd = '0x20c0000000000000000000000000000000000001'
const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const recipient = '0x4242424242424242424242424242424242424242'

async function rpc(method: string, params: unknown[]) {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const { result, error } = (await res.json()) as any
  if (error) throw new Error(error.message)
  return result
}

async function balanceOf(token: string, account: string) {
  const data = `0x70a08231${account.slice(2).toLowerCase().padStart(64, '0')}`
  return BigInt(await rpc('eth_call', [{ to: token, data }, 'latest']))
}

beforeAll(async () => {
  // Dev account 0 holds faucet-seeded pathUSD + AlphaUSD at genesis; top up
  // if not. The pathUSD headroom covers the transfer plus the fee-AMM deposit.
  const funded = async () =>
    (await balanceOf(pathUsd, sender)) >= 10_000_000_000n &&
    (await balanceOf(alphaUsd, sender)) >= 100_000_000n
  if (await funded()) return
  await rpc('tempo_fundAddress', [sender])
  for (let i = 0; i < 300; i++) {
    if (await funded()) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error('failed to fund dev account 0 with pathUSD and AlphaUSD')
}, 120_000)

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 60_000)

test('transfers 12.5 pathUSD with the fee debited in AlphaUSD', async () => {
  const recipientBefore = await balanceOf(pathUsd, recipient)
  const senderAlphaBefore = await balanceOf(alphaUsd, sender)

  const result = await example()
  expect(result?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.receipt.status)

  // pathUSD transfer amount lands exactly.
  expect((await balanceOf(pathUsd, recipient)) - recipientBefore).toBe(
    12_500_000n,
  )
  // The transfer moves no AlphaUSD, so any sender decrease is the fee debit.
  expect(
    senderAlphaBefore - (await balanceOf(alphaUsd, sender)),
  ).toBeGreaterThan(0n)
  // The AlphaUSD debit is a fee, not a transfer to the recipient.
  expect(await balanceOf(alphaUsd, recipient)).toBe(0n)
}, 120_000)
