import { readFileSync } from 'node:fs'
import { beforeAll, expect, test } from 'vitest'
import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'
import { transferWithDeadline } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const senderKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const recipient = '0x4545454545454545454545454545454545454545'
const recipient2 = '0x4646464646464646464646464646464646464646'
const client = Client.create({
  account: Account.fromSecp256k1(senderKey),
  chain: tempoLocalnet,
  pollingInterval: 100,
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

async function balanceOf(account: string) {
  const data = `0x70a08231${account.slice(2).toLowerCase().padStart(64, '0')}`
  return BigInt(await rpc('eth_call', [{ to: pathUsd, data }, 'latest']))
}

/** Current node time in seconds (host clocks may skew). */
async function nodeNow() {
  const block = await rpc('eth_getBlockByNumber', ['latest', false])
  return Number(BigInt(block.timestamp))
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

test('pre-expiry transfer lands exactly, carrying the deadline', async () => {
  const before = await balanceOf(recipient)
  const deadline = (await nodeNow()) + 60
  const result = await transferWithDeadline(client, {
    amount: '10.5',
    deadline,
    to: recipient,
  })
  expect(result?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.receipt.status)
  expect((await balanceOf(recipient)) - before).toBe(10_500_000n)

  // The landed transaction must embed the deadline on chain.
  const transaction = await rpc('eth_getTransactionByHash', [
    result.receipt.transactionHash,
  ])
  expect(transaction?.validBefore).toBeTruthy()
  expect(Number(BigInt(transaction.validBefore))).toBe(deadline)
}, 120_000)

test('post-expiry submission is refused and no tokens move', async () => {
  const before = await balanceOf(recipient2)
  const deadline = (await nodeNow()) - 10
  await expect(
    transferWithDeadline(client, {
      amount: '3.25',
      deadline,
      to: recipient2,
    }),
  ).rejects.toThrow()
  // Give the chain time to include anything erroneously accepted.
  await new Promise((resolve) => setTimeout(resolve, 2_000))
  expect(await balanceOf(recipient2)).toBe(before)
}, 120_000)
