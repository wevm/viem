import { readFileSync } from 'node:fs'
import { beforeAll, expect, test } from 'vitest'
import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'
import {
  claimBlockedFunds,
  getBlockedAmount,
  sendTokens,
  setBlockingPolicy,
} from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const guard = '0xb10c000000000000000000000000000000000000'
const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const senderKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
// Dev account 4 (blocked recipient) and a fresh claim destination.
const recipient = '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65'
const recipientKey =
  '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a'
const claimDest = '0x4545454545454545454545454545454545454545'
const senderClient = Client.create({
  account: Account.fromSecp256k1(senderKey),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http(rpcUrl),
})
const recipientClient = Client.create({
  account: Account.fromSecp256k1(recipientKey),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http(rpcUrl),
})
const readClient = Client.create({
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

// Guard `balanceOf(bytes)` (selector 0x78415365) with ABI-encoded receipt.
async function blockedBalanceOf(receipt: string) {
  const bytes = receipt.slice(2)
  const data =
    '0x78415365' +
    '20'.padStart(64, '0') +
    (bytes.length / 2).toString(16).padStart(64, '0') +
    bytes.padEnd(Math.ceil(bytes.length / 64) * 64, '0')
  return BigInt(await rpc('eth_call', [{ to: guard, data }, 'latest']))
}

async function fund(address: string) {
  if ((await balanceOf(address)) >= 100_000_000n) return
  await rpc('tempo_fundAddress', [address])
  for (let i = 0; i < 300; i++) {
    if ((await balanceOf(address)) >= 100_000_000n) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`failed to fund ${address} with pathUSD`)
}

beforeAll(async () => {
  // Fund the recipient (fee money) BEFORE its blocking policy is installed.
  await fund(sender)
  await fund(recipient)
}, 240_000)

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

let claimReceipt: `0x${string}`

test('blocked transfer holds funds instead of crediting the recipient', async () => {
  const policy = await setBlockingPolicy(recipientClient)
  expect(['success', '0x1']).toContain(policy?.receipt?.status)

  const recipientBefore = await balanceOf(recipient)
  const result = await sendTokens(senderClient, {
    amount: '12.5',
    to: recipient,
  })
  expect(['success', '0x1']).toContain(result?.receipt?.status)
  expect(result?.claimReceipt).toMatch(/^0x[0-9a-fA-F]+$/)
  claimReceipt = result.claimReceipt

  // Spendable balance must NOT be credited.
  expect(await balanceOf(recipient)).toBe(recipientBefore)

  // Blocked balance holds the exact amount (chain truth + agent's reader).
  expect(await blockedBalanceOf(claimReceipt)).toBe(12_500_000n)
  expect(await getBlockedAmount(readClient, { claimReceipt })).toBe(12_500_000n)
}, 120_000)

test('claim releases the exact blocked amount to the destination', async () => {
  const before = await balanceOf(claimDest)
  const result = await claimBlockedFunds(senderClient, {
    claimReceipt,
    to: claimDest,
  })
  expect(['success', '0x1']).toContain(result?.receipt?.status)

  expect(await blockedBalanceOf(claimReceipt)).toBe(0n)
  expect(await getBlockedAmount(readClient, { claimReceipt })).toBe(0n)
  expect((await balanceOf(claimDest)) - before).toBe(12_500_000n)
}, 120_000)
