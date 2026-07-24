import { readFileSync } from 'node:fs'
import { beforeAll, expect, test } from 'vitest'
import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'
import {
  createToken,
  grantMintRole,
  hasMintRole,
  mintTokens,
  revokeMintRole,
} from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const admin = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const adminKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const grantee = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const granteeKey =
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
const recipient = '0x4545454545454545454545454545454545454545'
const adminClient = Client.create({
  account: Account.fromSecp256k1(adminKey),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http(rpcUrl),
})
const granteeClient = Client.create({
  account: Account.fromSecp256k1(granteeKey),
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

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('grant lets the grantee mint; revoke stops it', async () => {
  const { token } = await createToken(adminClient, {
    name: 'Role Token',
    symbol: 'ROLE',
  })
  expect(token).toMatch(/^0x[0-9a-fA-F]{40}$/)

  // No role before the grant.
  expect(await hasMintRole(readClient, { account: grantee, token })).toBe(false)

  const granted = await grantMintRole(adminClient, { grantee, token })
  expect(granted?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(granted.receipt.status)
  expect(await hasMintRole(readClient, { account: grantee, token })).toBe(true)

  // Grantee mints while holding the role.
  const before = await balanceOf(token, recipient)
  const minted = await mintTokens(granteeClient, {
    amount: 25_000_000n,
    to: recipient,
    token,
  })
  expect(minted?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(minted.receipt.status)
  expect((await balanceOf(token, recipient)) - before).toBe(25_000_000n)

  const revoked = await revokeMintRole(adminClient, { grantee, token })
  expect(revoked?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(revoked.receipt.status)
  expect(await hasMintRole(readClient, { account: grantee, token })).toBe(false)

  // Mint attempts after the revoke fail and move no tokens.
  await expect(
    mintTokens(granteeClient, {
      amount: 1_000_000n,
      to: recipient,
      token,
    }),
  ).rejects.toThrow()
  expect(await balanceOf(token, recipient)).toBe(before + 25_000_000n)
}, 180_000)
