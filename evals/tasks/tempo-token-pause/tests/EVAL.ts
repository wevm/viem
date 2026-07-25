import { readFileSync } from 'node:fs'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
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

async function balanceOf(token: string, account: string) {
  const data = `0x70a08231${account.slice(2).toLowerCase().padStart(64, '0')}`
  return BigInt(await rpc('eth_call', [{ to: token, data }, 'latest']))
}

async function isPaused(token: string) {
  return (
    BigInt(
      await rpc('eth_call', [{ to: token, data: '0x5c975abb' }, 'latest']),
    ) !== 0n
  )
}

beforeAll(async () => {
  // Dev account 0 holds faucet-seeded pathUSD at genesis (pays fees); top up if not.
  if ((await balanceOf(pathUsd, sender)) >= 100_000_000n) return
  await rpc('tempo_fundAddress', [sender])
  for (let i = 0; i < 300; i++) {
    if ((await balanceOf(pathUsd, sender)) >= 100_000_000n) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error('failed to fund dev account 0 with pathUSD')
}, 120_000)

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/\bContractFunctionRevertedError\b/)
}, 60_000)

test('blocks transfers while paused, then resumes them', async () => {
  const result = await example()
  expect(result.token).toMatch(/^0x[0-9a-fA-F]{40}$/)
  expect(result.rejected).toBe(true)
  expect(await isPaused(result.token)).toBe(false)
  expect(['success', '0x1']).toContain(result.transfer.receipt.status)
  expect(await balanceOf(result.token, sender)).toBe(987_500_000n)
  expect(await balanceOf(result.token, recipient)).toBe(12_500_000n)
}, 120_000)
