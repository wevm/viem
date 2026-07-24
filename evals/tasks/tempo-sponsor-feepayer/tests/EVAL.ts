import { readFileSync } from 'node:fs'
import { beforeAll, expect, test } from 'vitest'
import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'
import { sponsoredTransfer } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
// Dev accounts 7 (sender) and 6 (sponsor) from the standard mnemonic.
const sender = '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955'
const senderKey =
  '0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356'
const sponsor = '0x976EA74026E726554dB657fA54763abd0C3a0aa9'
const sponsorKey =
  '0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e'
const recipient = '0x4545454545454545454545454545454545454545'
const client = Client.create({
  account: Account.fromSecp256k1(senderKey),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http(rpcUrl),
})
const feePayer = Account.fromSecp256k1(sponsorKey)

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

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('transfer lands exactly; sponsor pays every fee', async () => {
  const senderBefore = await balanceOf(sender)
  const sponsorBefore = await balanceOf(sponsor)
  const recipientBefore = await balanceOf(recipient)

  const result = await sponsoredTransfer(client, {
    amount: '12.34',
    feePayer,
    to: recipient,
  })
  expect(result?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.receipt.status)

  expect((await balanceOf(recipient)) - recipientBefore).toBe(12_340_000n)
  // Sender is debited the transfer amount and nothing else (no fee).
  expect(senderBefore - (await balanceOf(sender))).toBe(12_340_000n)
  // Sponsor is debited the fee.
  expect(sponsorBefore - (await balanceOf(sponsor))).toBeGreaterThan(0n)
}, 120_000)

test('another amount: sender debit still exactly matches', async () => {
  const senderBefore = await balanceOf(sender)
  const sponsorBefore = await balanceOf(sponsor)
  const recipientBefore = await balanceOf(recipient)

  await sponsoredTransfer(client, {
    amount: '0.07',
    feePayer,
    to: recipient,
  })

  expect((await balanceOf(recipient)) - recipientBefore).toBe(70_000n)
  expect(senderBefore - (await balanceOf(sender))).toBe(70_000n)
  expect(sponsorBefore - (await balanceOf(sponsor))).toBeGreaterThan(0n)
}, 120_000)
