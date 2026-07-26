import { readFileSync } from 'node:fs'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const admin = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const grantee = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const recipient = '0x4545454545454545454545454545454545454545'

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

async function fund(address: string) {
  if ((await balanceOf(pathUsd, address)) >= 100_000_000n) return
  await rpc('tempo_fundAddress', [address])
  for (let i = 0; i < 300; i++) {
    if ((await balanceOf(pathUsd, address)) >= 100_000_000n) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`failed to fund ${address} with pathUSD`)
}

beforeAll(async () => {
  // Admin and grantee both pay transaction fees in pathUSD.
  await fund(admin)
  await fund(grantee)
}, 120_000)

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source.match(/\bClient\.create\s*\(/g)).toHaveLength(1)
  expect(source).toMatch(/\bContractFunctionRevertedError\b/)
}, 60_000)

test('grant lets the grantee mint; revoke stops it', async () => {
  const result = await example()
  const { token } = result
  expect(token).toMatch(/^0x[0-9a-fA-F]{40}$/)
  expect(result.before).toBe(false)
  expect(result.granted).toBe(true)
  expect(result.revoked).toBe(false)
  expect(result.rejected).toBe(true)
  expect(['success', '0x1']).toContain(result.grant.receipt.status)
  expect(['success', '0x1']).toContain(result.mint.receipt.status)
  expect(['success', '0x1']).toContain(result.revoke.receipt.status)
  expect(await balanceOf(token, recipient)).toBe(25_000_000n)
}, 180_000)
