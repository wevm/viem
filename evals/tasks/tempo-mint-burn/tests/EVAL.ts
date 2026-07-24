import { readFileSync } from 'node:fs'
import { beforeAll, expect, test } from 'vitest'
import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'
import { burnToken, createToken, mintToken } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const senderKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const recipient = '0x4242424242424242424242424242424242424242'
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

async function totalSupply(token: string) {
  return BigInt(
    await rpc('eth_call', [{ to: token, data: '0x18160ddd' }, 'latest']),
  )
}

beforeAll(async () => {
  // Dev account 0 holds faucet-seeded pathUSD at genesis; top up if not.
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

test('creates a token with zero supply', async () => {
  const result = await createToken(client, {
    name: 'Eval Supply Token',
    symbol: 'EVS',
  })
  token = result?.token
  expect(token).toMatch(/^0x[0-9a-fA-F]{40}$/)
  expect(await rpc('eth_getCode', [token, 'latest'])).not.toBe('0x')
  expect(await totalSupply(token)).toBe(0n)
}, 120_000)

test('mint increases holder balance and total supply by exact base units', async () => {
  const supplyBefore = await totalSupply(token)
  const balanceBefore = await balanceOf(token, sender)
  const result = await mintToken(client, {
    amount: '12.5',
    to: sender,
    token,
  })
  expect(result?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.receipt.status)
  const supplyAfter = await totalSupply(token)
  const balanceAfter = await balanceOf(token, sender)
  expect(supplyAfter - supplyBefore).toBe(12_500_000n)
  expect(balanceAfter - balanceBefore).toBe(12_500_000n)
  expect(result.balance).toBe(balanceAfter)
  expect(result.totalSupply).toBe(supplyAfter)
}, 120_000)

test('mints an exact base-unit amount to another recipient', async () => {
  const supplyBefore = await totalSupply(token)
  const result = await mintToken(client, {
    amount: '3.25',
    to: recipient,
    token,
  })
  expect(await balanceOf(token, recipient)).toBe(3_250_000n)
  expect((await totalSupply(token)) - supplyBefore).toBe(3_250_000n)
  expect(result.balance).toBe(3_250_000n)
}, 120_000)

test('burn decreases own balance and total supply by exact base units', async () => {
  const supplyBefore = await totalSupply(token)
  const balanceBefore = await balanceOf(token, sender)
  const result = await burnToken(client, { amount: '4.25', token })
  expect(result?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.receipt.status)
  const supplyAfter = await totalSupply(token)
  const balanceAfter = await balanceOf(token, sender)
  expect(supplyBefore - supplyAfter).toBe(4_250_000n)
  expect(balanceBefore - balanceAfter).toBe(4_250_000n)
  expect(result.balance).toBe(balanceAfter)
  expect(result.totalSupply).toBe(supplyAfter)
}, 120_000)
