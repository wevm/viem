import { readFileSync } from 'node:fs'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

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

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 60_000)

test('creates two distinct tokens with matching metadata', async () => {
  const { first, second } = await example()
  expect(first.token).not.toBe(second.token)
  expect(await rpc('eth_getCode', [first.token, 'latest'])).not.toBe('0x')
  expect(await rpc('eth_getCode', [second.token, 'latest'])).not.toBe('0x')
  expect(first.metadata.name).toBe('Orbital USD')
  expect(first.metadata.symbol).toBe('OUSD')
  expect(second.metadata.name).toBe('Harbor USD')
  expect(second.metadata.symbol).toBe('HUSD')
  expect(await readOnchainMetadata(first.token)).toEqual({
    name: 'Orbital USD',
    symbol: 'OUSD',
    decimals: 6,
  })
  expect(await readOnchainMetadata(second.token)).toEqual({
    name: 'Harbor USD',
    symbol: 'HUSD',
    decimals: 6,
  })
}, 120_000)
