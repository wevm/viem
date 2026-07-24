import { readFileSync } from 'node:fs'
import { beforeAll, expect, test } from 'vitest'
import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'
import { readNonce, sendParallelTransfers } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const nonceManager = '0x4e4f4e4345000000000000000000000000000000'
const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const senderKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const client = Client.create({
  account: Account.fromSecp256k1(senderKey),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http(rpcUrl),
})
const readClient = Client.create({
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http(rpcUrl),
})

const transfers = [
  {
    to: '0x5151515151515151515151515151515151515151',
    amount: '1.5',
    nonceKey: 77001n,
    delta: 1_500_000n,
  },
  {
    to: '0x5252525252525252525252525252525252525252',
    amount: '2.25',
    nonceKey: 77002n,
    delta: 2_250_000n,
  },
  {
    to: '0x5353535353535353535353535353535353535353',
    amount: '3.75',
    nonceKey: 77003n,
    delta: 3_750_000n,
  },
] as const

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

// getNonce(address,uint256) on the nonce manager precompile.
async function nonceOf(account: string, nonceKey: bigint) {
  const data = `0x89535803${account
    .slice(2)
    .toLowerCase()
    .padStart(64, '0')}${nonceKey.toString(16).padStart(64, '0')}`
  return BigInt(await rpc('eth_call', [{ to: nonceManager, data }, 'latest']))
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

test('sends 3 parallel transfers on distinct nonce keys', async () => {
  const balancesBefore = await Promise.all(
    transfers.map((transfer) => balanceOf(transfer.to)),
  )
  const noncesBefore = await Promise.all(
    transfers.map((transfer) => nonceOf(sender, transfer.nonceKey)),
  )

  const result = await sendParallelTransfers(client, {
    transfers: transfers.map(({ to, amount, nonceKey }) => ({
      amount,
      nonceKey,
      to,
    })),
  })

  expect(result?.receipts).toHaveLength(3)
  for (const receipt of result.receipts)
    expect(['success', '0x1']).toContain(receipt.status)

  for (const [i, transfer] of transfers.entries()) {
    expect((await balanceOf(transfer.to)) - balancesBefore[i]!).toBe(
      transfer.delta,
    )
    expect(await nonceOf(sender, transfer.nonceKey)).toBe(noncesBefore[i]! + 1n)
  }
}, 120_000)

test('reads back the nonce for a used key', async () => {
  const raw = await nonceOf(sender, 77002n)
  expect(raw).toBeGreaterThanOrEqual(1n)
  expect(
    await readNonce(readClient, { account: sender, nonceKey: 77002n }),
  ).toBe(raw)
}, 60_000)

test('reads back the nonce for an unused key', async () => {
  const nonceKey = 606060606n
  expect(await readNonce(readClient, { account: sender, nonceKey })).toBe(
    await nonceOf(sender, nonceKey),
  )
}, 60_000)
