import { readFileSync } from 'node:fs'
import { beforeAll, expect, test } from 'vitest'
import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'
import { launchCappedToken } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const senderKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const recipient = '0x4242424242424242424242424242424242424242'
const recipient2 = '0x4343434343434343434343434343434343434343'
const client = Client.create({
  account: Account.fromSecp256k1(senderKey),
  chain: tempoLocalnet,
  feeToken: pathUsd,
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

async function call(to: string, data: string) {
  return BigInt(await rpc('eth_call', [{ to, data }, 'latest']))
}

async function balanceOf(token: string, account: string) {
  const data = `0x70a08231${account.slice(2).toLowerCase().padStart(64, '0')}`
  return call(token, data)
}

async function totalSupply(token: string) {
  return call(token, '0x18160ddd')
}

async function supplyCap(token: string) {
  return call(token, '0x8f770ad0')
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

test('launches a capped token, mints to the cap, over-cap mint reverts', async () => {
  const result = await launchCappedToken(client, {
    name: 'Capped Coin',
    symbol: 'CAPA',
    cap: '1000',
    to: recipient,
  })

  expect(result?.token).toMatch(/^0x[0-9a-fA-F]{40}$/)
  expect(await rpc('eth_getCode', [result.token, 'latest'])).not.toBe('0x')
  expect(result?.mintReceipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.mintReceipt.status)
  expect(result.overCapMintFailed).toBe(true)

  expect(await supplyCap(result.token)).toBe(1_000_000_000n)
  expect(await balanceOf(result.token, recipient)).toBe(1_000_000_000n)
  const supply = await totalSupply(result.token)
  expect(supply).toBe(1_000_000_000n)
  expect(supply <= (await supplyCap(result.token))).toBe(true)
}, 120_000)

test('enforces a different cap value', async () => {
  const result = await launchCappedToken(client, {
    name: 'Capped Coin B',
    symbol: 'CAPB',
    cap: '0.25',
    to: recipient2,
  })

  expect(result.overCapMintFailed).toBe(true)
  expect(await supplyCap(result.token)).toBe(250_000n)
  expect(await balanceOf(result.token, recipient2)).toBe(250_000n)
  expect(await totalSupply(result.token)).toBe(250_000n)
}, 120_000)
