import { readFileSync } from 'node:fs'
import { beforeAll, expect, test } from 'vitest'
import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'
import { authorizeSessionKey, sendWithSessionKey } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const root = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const rootKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
// Deterministic P256 scalar (well below the curve order).
const sessionKey =
  '0x1111111111111111111111111111111111111111111111111111111111111111'
const recipient = '0x5151515151515151515151515151515151515151'
const recipient2 = '0x5252525252525252525252525252525252525252'
const rootAccount = Account.fromSecp256k1(rootKey)
const accessKey = Account.fromP256(sessionKey, { access: rootAccount })
const rootClient = Client.create({
  account: rootAccount,
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http(rpcUrl),
})
const accessClient = Client.create({
  account: accessKey,
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

beforeAll(async () => {
  // Dev account 0 holds faucet-seeded pathUSD at genesis; top up if not.
  if ((await balanceOf(root)) >= 100_000_000n) return
  await rpc('tempo_fundAddress', [root])
  for (let i = 0; i < 300; i++) {
    if ((await balanceOf(root)) >= 100_000_000n) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error('failed to fund dev account 0 with pathUSD')
}, 120_000)

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('authorizes the session key and spends under the limit', async () => {
  const auth = await authorizeSessionKey(rootClient, {
    accessKey,
    limit: '100',
  })
  expect(auth?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(auth.receipt.status)

  const before = await balanceOf(recipient)
  const result = await sendWithSessionKey(accessClient, {
    amount: '30.5',
    to: recipient,
  })
  expect(result?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.receipt.status)
  expect((await balanceOf(recipient)) - before).toBe(30_500_000n)
}, 120_000)

test('a transfer exceeding the remaining allowance reverts', async () => {
  // 30.5 of the 100 pathUSD allowance is spent; 75 exceeds the remainder.
  await expect(
    sendWithSessionKey(accessClient, { amount: '75', to: recipient2 }),
  ).rejects.toThrow()
  expect(await balanceOf(recipient2)).toBe(0n)
}, 120_000)
