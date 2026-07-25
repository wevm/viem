import { readFileSync } from 'node:fs'
import { Actions as core_Actions } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { Actions, Client, http } from 'viem/tempo'
import type { Address } from 'viem/utils'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const recipient = '0x5151515151515151515151515151515151515151'
const client = Client.create({
  chain: tempoLocalnet,
  transport: http(rpcUrl),
})

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

async function balanceOf(account: Address.Address) {
  return (await Actions.token.getBalance(client, { account, token: pathUsd }))
    .amount
}

async function latestTimestamp() {
  return Number((await core_Actions.block.get(client)).timestamp)
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
  expect(source).toMatch(/transferSync[\s\S]*\bvalidAfter\s*[:,]/)
  expect(source).not.toMatch(/\b(?:setTimeout|sleep)\s*\(/)
}, 60_000)

test('scheduled transfer lands only after the window opens', async () => {
  const before = await balanceOf(recipient)
  const startedAt = await latestTimestamp()
  const pending = example()
  pending.catch(() => {})

  await new Promise((resolve) => setTimeout(resolve, 1_500))
  if ((await latestTimestamp()) < startedAt + 6)
    expect(await balanceOf(recipient)).toBe(before)

  const { result, validAfter } = await pending
  expect(['success', '0x1']).toContain(result.receipt.status)
  expect((await balanceOf(recipient)) - before).toBe(12_500_000n)

  // The mined transaction carries the window and its block honors it.
  const tx = await rpc('eth_getTransactionByHash', [
    result.receipt.transactionHash,
  ])
  expect(Number(tx.validAfter)).toBe(validAfter)
  expect(validAfter).toBeGreaterThanOrEqual(startedAt + 6)
  const block = await rpc('eth_getBlockByNumber', [tx.blockNumber, false])
  expect(Number(block.timestamp)).toBeGreaterThanOrEqual(validAfter)
}, 120_000)
