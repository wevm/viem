import { readFileSync } from 'node:fs'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const recipient = '0x4545454545454545454545454545454545454545'
const recipient2 = '0x4646464646464646464646464646464646464646'

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

beforeAll(async () => {
  // Dev account 0 holds faucet-seeded pathUSD at genesis; top up if not.
  if ((await balanceOf(sender)) >= 100_000_000n) return
  await rpc('tempo_fundAddress', [sender])
  for (let i = 0; i < 300; i++) {
    if ((await balanceOf(sender)) >= 100_000_000n) return
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

test('honors future and expired deadlines', async () => {
  const before = await balanceOf(recipient)
  const expiredBefore = await balanceOf(recipient2)
  const { deadline, expired, result } = await example()

  expect(['success', '0x1']).toContain(result.receipt.status)
  expect((await balanceOf(recipient)) - before).toBe(10_500_000n)
  const transaction = await rpc('eth_getTransactionByHash', [
    result.receipt.transactionHash,
  ])
  expect(Number(BigInt(transaction.validBefore))).toBe(deadline)
  expect(expired).toBe(true)
  await new Promise((resolve) => setTimeout(resolve, 2_000))
  expect(await balanceOf(recipient2)).toBe(expiredBefore)
}, 120_000)
