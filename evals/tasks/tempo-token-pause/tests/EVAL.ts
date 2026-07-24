import { readFileSync } from 'node:fs'
import { beforeAll, expect, test } from 'vitest'
import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'
import {
  pauseToken,
  setupToken,
  transferToken,
  unpauseToken,
} from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const senderKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const recipient = '0x4545454545454545454545454545454545454545'
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

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

let token: `0x${string}`

test('issues a token with 1000 minted to the issuer', async () => {
  token = (await setupToken(client)) as `0x${string}`
  expect(token).toMatch(/^0x[0-9a-fA-F]{40}$/)
  expect(await balanceOf(token, sender)).toBe(1_000_000_000n)
}, 120_000)

test('transfer rejects while paused', async () => {
  await pauseToken(client, { token })
  expect(await isPaused(token)).toBe(true)
  await expect(
    transferToken(client, { amount: '5', to: recipient, token }),
  ).rejects.toThrow()
  expect(await balanceOf(token, recipient)).toBe(0n)
}, 120_000)

test('transfer succeeds with exact delta after unpause', async () => {
  await unpauseToken(client, { token })
  expect(await isPaused(token)).toBe(false)
  const before = await balanceOf(token, recipient)
  const result = await transferToken(client, {
    amount: '12.5',
    to: recipient,
    token,
  })
  expect(result?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.receipt.status)
  expect((await balanceOf(token, recipient)) - before).toBe(12_500_000n)
}, 120_000)
