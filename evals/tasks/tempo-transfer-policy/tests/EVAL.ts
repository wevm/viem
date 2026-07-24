import { readFileSync } from 'node:fs'
import { beforeAll, expect, test } from 'vitest'
import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'
import { addMember, setupGatedToken, transferGated } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const senderKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const member = '0x4545454545454545454545454545454545454545'
const nonMember = '0x4646464646464646464646464646464646464646'
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

beforeAll(async () => {
  // Dev account 0 holds faucet-seeded pathUSD at genesis (fee payment); top up if not.
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
let policyId: bigint

test('sets up a whitelist-gated token holding the initial supply', async () => {
  const result = await setupGatedToken(client)
  expect(result?.token).toMatch(/^0x[0-9a-fA-F]{40}$/)
  expect(typeof result?.policyId).toBe('bigint')
  token = result.token
  policyId = result.policyId
  expect(await balanceOf(token, sender)).toBe(1_000_000_000n)
}, 180_000)

test('non-whitelisted transfer reverts and moves nothing', async () => {
  await expect(
    transferGated(client, { amount: 1_000_000n, to: nonMember, token }),
  ).rejects.toThrow()
  expect(await balanceOf(token, nonMember)).toBe(0n)
  expect(await balanceOf(token, sender)).toBe(1_000_000_000n)
}, 120_000)

test('whitelisted transfer moves exact units', async () => {
  await addMember(client, { member, policyId })
  const before = await balanceOf(token, member)
  const result = await transferGated(client, {
    amount: 2_500_000n,
    to: member,
    token,
  })
  expect(result?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.receipt.status)
  expect((await balanceOf(token, member)) - before).toBe(2_500_000n)
  expect(await balanceOf(token, sender)).toBe(997_500_000n)
}, 120_000)
