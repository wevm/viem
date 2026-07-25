import { readFileSync } from 'node:fs'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
// Dev accounts 7 (sender) and 6 (sponsor) from the standard mnemonic.
const sender = '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955'
const sponsor = '0x976EA74026E726554dB657fA54763abd0C3a0aa9'
const recipient = '0x4545454545454545454545454545454545454545'

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

async function balanceOf(account: string) {
  const data = `0x70a08231${account.slice(2).toLowerCase().padStart(64, '0')}`
  return BigInt(await rpc('eth_call', [{ to: pathUsd, data }, 'latest']))
}

async function fund(account: string) {
  if ((await balanceOf(account)) >= 100_000_000n) return
  await rpc('tempo_fundAddress', [account])
  for (let i = 0; i < 300; i++) {
    if ((await balanceOf(account)) >= 100_000_000n) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`failed to fund ${account} with pathUSD`)
}

beforeAll(async () => {
  await fund(sender)
  await fund(sponsor)
}, 120_000)

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 60_000)

test('transfer lands exactly; sponsor pays every fee', async () => {
  const senderBefore = await balanceOf(sender)
  const sponsorBefore = await balanceOf(sponsor)
  const recipientBefore = await balanceOf(recipient)

  const result = await example()
  expect(result?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.receipt.status)

  expect((await balanceOf(recipient)) - recipientBefore).toBe(12_340_000n)
  // Sender is debited the transfer amount and nothing else (no fee).
  expect(senderBefore - (await balanceOf(sender))).toBe(12_340_000n)
  // Sponsor is debited the fee.
  expect(sponsorBefore - (await balanceOf(sponsor))).toBeGreaterThan(0n)
}, 120_000)
