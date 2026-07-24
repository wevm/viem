import { readFileSync } from 'node:fs'
import { beforeAll, expect, test } from 'vitest'
import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'
import {
  grantSpendingKey,
  remainingAllowance,
  revokeSpendingKey,
  spendWithKey,
} from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const keychain = '0xaaaaaaaa00000000000000000000000000000000'
const root = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const rootKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
// Deterministic secp256k1 access keypair (not a dev account).
const accessKeyPriv =
  '0x5fe1a3c2f2f7cbb2e6c8e6b092de2e04ae0d24a655e42e15a4f0f37b78f4e989'
const accessKeyAddr = '0xaf2e3fc2f8c2f582836715c908a98a6d30c72aca'
const recipient = '0x4242424242424242424242424242424242424242'
const limit = 50_000_000n // 50 pathUSD
const rootAccount = Account.fromSecp256k1(rootKey)
const accessKey = Account.fromSecp256k1(accessKeyPriv, {
  access: rootAccount,
})
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
const readClient = Client.create({
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

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('authorizes a spending-limited access key', async () => {
  const result = await grantSpendingKey(rootClient, { accessKey, limit })
  expect(result?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.receipt.status)
  expect(await remainingLimit()).toBe(limit)
  expect(
    await remainingAllowance(readClient, {
      accessKey: accessKeyAddr,
      account: root,
    }),
  ).toBe(limit)
}, 120_000)

test('a spend through the key draws down the remaining limit', async () => {
  const before = await balanceOf(recipient)
  const result = await spendWithKey(accessClient, {
    amount: 5_000_000n,
    to: recipient,
  })
  expect(result?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.receipt.status)
  expect((await balanceOf(recipient)) - before).toBe(5_000_000n)

  const remaining = await remainingLimit()
  expect(remaining).toBeLessThan(limit)
  expect(
    await remainingAllowance(readClient, {
      accessKey: accessKeyAddr,
      account: root,
    }),
  ).toBe(remaining)
}, 120_000)

test('revoking the key blocks further spends', async () => {
  const result = await revokeSpendingKey(rootClient, {
    accessKey: accessKeyAddr,
  })
  expect(result?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.receipt.status)
  expect(await isRevoked()).toBe(true)

  const before = await balanceOf(recipient)
  const outcome = await spendWithKey(accessClient, {
    amount: 1_000_000n,
    to: recipient,
  }).then(
    (result) => ({ rejected: false as const, result }),
    () => ({ rejected: true as const }),
  )
  if (!outcome.rejected)
    expect(['success', '0x1']).not.toContain(outcome.result.receipt.status)
  expect(await balanceOf(recipient)).toBe(before)
}, 120_000)
