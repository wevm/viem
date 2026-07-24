import { readFileSync } from 'node:fs'
import { beforeAll, expect, test } from 'vitest'
import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'
import {
  deriveVirtualAddress,
  registerMasterAddress,
  resolveVirtualAddress,
} from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const registry = '0xfdc0000000000000000000000000000000000000'
const magic = 'fdfdfdfdfdfdfdfdfdfd'
const userTag = '0x010203040506'

// Fresh account, unknown to the agent: its master registration state is
// untouched by anything the agent registered while testing.
const masterKey =
  '0x2e0834786285daccd064ca17f1654f67b4aef298acbb82cef9ec422fb4975622'
const master = '0x123463a4b065722e99115d6c222f267d9cabb524'
// First valid PoW salt above this start is 0x2807fa695 (149 increments away).
const saltStart = 0x2807fa600n
const client = Client.create({
  account: Account.fromSecp256k1(masterKey),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http(rpcUrl),
})
const readClient = Client.create({
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http(rpcUrl),
})

let masterId: `0x${string}`

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

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('mines a salt and registers the master onchain', async () => {
  const result = await registerMasterAddress(client, { saltStart })
  expect(result?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.receipt.status)
  expect(result.masterAddress?.toLowerCase()).toBe(master)
  expect(result.masterId).toMatch(/^0x[0-9a-fA-F]{8}$/)
  masterId = result.masterId
  // The registry must resolve the master id straight back to the wallet.
  expect(await getMaster(masterId)).toBe(master)
}, 300_000)

test('derives the virtual address for a user tag', () => {
  const virtual = deriveVirtualAddress({ masterId, userTag })
  expect(virtual.toLowerCase()).toBe(`${masterId}${magic}${userTag.slice(2)}`)
})

test('resolves a virtual address back to the registered master', async () => {
  const virtual = deriveVirtualAddress({ masterId, userTag })
  const resolved = await resolveVirtualAddress(readClient, { address: virtual })
  expect(resolved?.toLowerCase()).toBe(master)
}, 120_000)

test('returns non-virtual addresses unchanged', async () => {
  const resolved = await resolveVirtualAddress(readClient, { address: master })
  expect(resolved?.toLowerCase()).toBe(master)
}, 120_000)

test('resolves an unregistered virtual address to null', async () => {
  const resolved = await resolveVirtualAddress(readClient, {
    address: `0xdeadbeef${magic}010203040506`,
  })
  expect(resolved).toBeNull()
}, 120_000)
