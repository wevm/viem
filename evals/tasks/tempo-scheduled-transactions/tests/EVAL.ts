import { readFileSync } from 'node:fs'
import { beforeAll, expect, test } from 'vitest'
import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'
import { scheduleTransfer } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const senderKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const recipient = '0x5151515151515151515151515151515151515151'
const recipient2 = '0x5252525252525252525252525252525252525252'
const client = Client.create({
  account: Account.fromSecp256k1(senderKey),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http(rpcUrl, { timeout: 60_000 }),
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

async function balanceOf(account: string) {
  const data = `0x70a08231${account.slice(2).toLowerCase().padStart(64, '0')}`
  return BigInt(await rpc('eth_call', [{ to: pathUsd, data }, 'latest']))
}

async function latestTimestamp() {
  const block = await rpc('eth_getBlockByNumber', ['latest', false])
  return Number(block.timestamp)
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

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('scheduled transfer lands only after the window opens', async () => {
  const before = await balanceOf(recipient)
  const validAfter = (await latestTimestamp()) + 6
  const pending = scheduleTransfer(client, {
    amount: '12.5',
    to: recipient,
    validAfter,
  })
  pending.catch(() => {}) // handled by the await below

  // While the window is still closed, nothing may have executed.
  await new Promise((resolve) => setTimeout(resolve, 1_500))
  if ((await latestTimestamp()) < validAfter)
    expect((await balanceOf(recipient)) - before).toBe(0n)

  const result = await pending
  expect(result?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.receipt.status)
  expect((await balanceOf(recipient)) - before).toBe(12_500_000n)

  // The mined transaction carries the window and its block honors it.
  const tx = await rpc('eth_getTransactionByHash', [
    result.receipt.transactionHash,
  ])
  expect(Number(tx.validAfter)).toBe(validAfter)
  const block = await rpc('eth_getBlockByNumber', [tx.blockNumber, false])
  expect(Number(block.timestamp)).toBeGreaterThanOrEqual(validAfter)
}, 120_000)

test('applies the exact amount for another scheduled transfer', async () => {
  const before = await balanceOf(recipient2)
  const validAfter = (await latestTimestamp()) + 5
  const result = await scheduleTransfer(client, {
    amount: '0.75',
    to: recipient2,
    validAfter,
  })
  expect(result?.receipt).toBeTruthy()
  expect((await balanceOf(recipient2)) - before).toBe(750_000n)

  const tx = await rpc('eth_getTransactionByHash', [
    result.receipt.transactionHash,
  ])
  expect(Number(tx.validAfter)).toBe(validAfter)
  const block = await rpc('eth_getBlockByNumber', [tx.blockNumber, false])
  expect(Number(block.timestamp)).toBeGreaterThanOrEqual(validAfter)
}, 120_000)
