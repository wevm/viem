import { readFileSync } from 'node:fs'
import { beforeAll, expect, test } from 'vitest'
import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'
import { createToken } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const senderKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
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

function decodeAbiString(hex: string) {
  const data = hex.slice(2)
  const offset = Number(BigInt(`0x${data.slice(0, 64)}`)) * 2
  const length = Number(BigInt(`0x${data.slice(offset, offset + 64)}`)) * 2
  return Buffer.from(
    data.slice(offset + 64, offset + 64 + length),
    'hex',
  ).toString('utf8')
}

async function readOnchainMetadata(token: string) {
  const call = (data: string) =>
    rpc('eth_call', [{ to: token, data }, 'latest'])
  return {
    name: decodeAbiString(await call('0x06fdde03')),
    symbol: decodeAbiString(await call('0x95d89b41')),
    decimals: Number(BigInt(await call('0x313ce567'))),
  }
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

test('creates a token whose metadata matches the creation args', async () => {
  const result = await createToken(client, {
    name: 'Orbital USD',
    symbol: 'OUSD',
  })
  expect(result?.token).toMatch(/^0x[0-9a-fA-F]{40}$/)
  expect(result?.metadata?.name).toBe('Orbital USD')
  expect(result?.metadata?.symbol).toBe('OUSD')
  expect(Number(result?.metadata?.decimals)).toBe(6)

  const code = await rpc('eth_getCode', [result.token, 'latest'])
  expect(code).toMatch(/^0x[0-9a-fA-F]+$/)

  const onchain = await readOnchainMetadata(result.token)
  expect(onchain).toEqual({ name: 'Orbital USD', symbol: 'OUSD', decimals: 6 })
}, 120_000)

test('creates a fresh token per call with distinct args', async () => {
  const a = await createToken(client, { name: 'Beacon USD', symbol: 'BUSD' })
  const b = await createToken(client, { name: 'Harbor USD', symbol: 'HUSD' })
  expect(a.token).not.toBe(b.token)

  const onchainA = await readOnchainMetadata(a.token)
  expect(onchainA).toEqual({ name: 'Beacon USD', symbol: 'BUSD', decimals: 6 })
  expect(b?.metadata?.name).toBe('Harbor USD')
  expect(b?.metadata?.symbol).toBe('HUSD')

  const onchainB = await readOnchainMetadata(b.token)
  expect(onchainB).toEqual({ name: 'Harbor USD', symbol: 'HUSD', decimals: 6 })
}, 120_000)
