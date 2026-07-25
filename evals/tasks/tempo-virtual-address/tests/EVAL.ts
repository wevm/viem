import { readFileSync } from 'node:fs'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const registry = '0xfdc0000000000000000000000000000000000000'
const magic = 'fdfdfdfdfdfdfdfdfdfd'
const userTag = '0x010203040506'

// Fresh account, unknown to the agent: its master registration state is
// untouched by anything the agent registered while testing.
const master = '0x123463a4b065722e99115d6c222f267d9cabb524'

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

// `getMaster(bytes4)` on the address registry precompile.
async function getMaster(id: string) {
  const data = `0xd84ab166${id.slice(2).toLowerCase().padEnd(64, '0')}`
  const result = (await rpc('eth_call', [
    { to: registry, data },
    'latest',
  ])) as string
  return `0x${result.slice(-40)}`
}

beforeAll(async () => {
  // Fund the master account with pathUSD to pay registration fees. Retry:
  // right after boot the faucet can hit transient nonce-expiry errors while
  // block timestamps catch up to wall clock.
  for (let i = 0; i < 30; i++) {
    try {
      await rpc('tempo_fundAddress', [master])
      break
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }
  for (let i = 0; i < 300; i++) {
    if ((await balanceOf(master)) > 0n) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error('failed to fund the master account with pathUSD')
}, 120_000)

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 60_000)

test('registers, derives, and resolves virtual addresses', async () => {
  const result = await example()
  const registration = result.registration
  expect(['success', '0x1']).toContain(registration.receipt.status)
  expect(registration.masterAddress.toLowerCase()).toBe(master)
  expect(await getMaster(registration.masterId)).toBe(master)
  expect(result.virtualAddress.toLowerCase()).toBe(
    `${registration.masterId}${magic}${userTag.slice(2)}`,
  )
  expect(result.resolved?.toLowerCase()).toBe(master)
  expect(result.direct?.toLowerCase()).toBe(master)
  expect(result.unknown).toBeNull()
}, 300_000)
