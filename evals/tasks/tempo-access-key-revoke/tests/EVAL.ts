import { readFileSync } from 'node:fs'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const keychain = '0xaaaaaaaa00000000000000000000000000000000'
const root = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const accessKeyAddr = '0xaf2e3fc2f8c2f582836715c908a98a6d30c72aca'
const recipient = '0x4242424242424242424242424242424242424242'
const limit = 50_000_000n // 50 pathUSD

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

const pad = (value: string) => value.slice(2).toLowerCase().padStart(64, '0')

async function balanceOf(account: string) {
  const data = `0x70a08231${pad(account)}`
  return BigInt(await rpc('eth_call', [{ to: pathUsd, data }, 'latest']))
}

/** Keychain precompile `getRemainingLimitWithPeriod(account, keyId, token)`. */
async function remainingLimit() {
  const data = `0xa7f72cab${pad(root)}${pad(accessKeyAddr)}${pad(pathUsd)}`
  const result = await rpc('eth_call', [{ to: keychain, data }, 'latest'])
  return BigInt(result.slice(0, 66))
}

/** Keychain precompile `getKey(account, keyId)`; output word 4 is `isRevoked`. */
async function isRevoked() {
  const data = `0xbc298553${pad(root)}${pad(accessKeyAddr)}`
  const result = await rpc('eth_call', [{ to: keychain, data }, 'latest'])
  return BigInt(`0x${result.slice(2 + 64 * 4, 2 + 64 * 5)}`) === 1n
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

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/\bContractFunctionRevertedError\b/)
}, 60_000)

test('spends through and revokes the limited key', async () => {
  const before = await balanceOf(recipient)
  const result = await example()

  expect(['success', '0x1']).toContain(result.authorization.receipt.status)
  expect(['success', '0x1']).toContain(result.transfer.receipt.status)
  expect(['success', '0x1']).toContain(result.revocation.receipt.status)
  expect(result.before).toBe(limit)
  expect(result.after).toBeLessThan(limit)
  expect((await balanceOf(recipient)) - before).toBe(5_000_000n)
  expect(await remainingLimit()).toBe(result.after)
  expect(await isRevoked()).toBe(true)
  expect(result.rejected).toBe(true)
}, 120_000)
