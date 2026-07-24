import { readFileSync } from 'node:fs'
import { beforeAll, expect, test } from 'vitest'
import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'
import { approveSpender, getAllowance, spendAllowance } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const owner = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const ownerKey =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const spender = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const spenderKey =
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
const recipient = '0x4545454545454545454545454545454545454545'
const ownerClient = Client.create({
  account: Account.fromSecp256k1(ownerKey),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http(rpcUrl),
})
const spenderClient = Client.create({
  account: Account.fromSecp256k1(spenderKey),
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

async function balanceOf(account: string) {
  const data = `0x70a08231${account.slice(2).toLowerCase().padStart(64, '0')}`
  return BigInt(await rpc('eth_call', [{ to: pathUsd, data }, 'latest']))
}

async function allowanceOf(account: string, spender: string) {
  const data = `0xdd62ed3e${account
    .slice(2)
    .toLowerCase()
    .padStart(64, '0')}${spender.slice(2).toLowerCase().padStart(64, '0')}`
  return BigInt(await rpc('eth_call', [{ to: pathUsd, data }, 'latest']))
}

async function fund(account: string) {
  // Dev accounts hold faucet-seeded pathUSD at genesis; top up if not.
  if ((await balanceOf(account)) >= 100_000_000n) return
  await rpc('tempo_fundAddress', [account])
  for (let i = 0; i < 300; i++) {
    if ((await balanceOf(account)) >= 100_000_000n) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`failed to fund ${account} with pathUSD`)
}

beforeAll(async () => {
  // The spender pays its own transfer fees in pathUSD.
  await fund(owner)
  await fund(spender)
}, 120_000)

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('approves 75.5 pathUSD and reads the allowance', async () => {
  const result = await approveSpender(ownerClient, {
    amount: '75.5',
    spender,
  })
  expect(result?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.receipt.status)
  expect(await allowanceOf(owner, spender)).toBe(75_500_000n)
  expect(await getAllowance(readClient, { owner, spender })).toBe(75_500_000n)
}, 120_000)

test('spends part of the allowance via a from-transfer', async () => {
  const recipientBefore = await balanceOf(recipient)
  const ownerBefore = await balanceOf(owner)
  const result = await spendAllowance(spenderClient, {
    amount: '20.25',
    owner,
    to: recipient,
  })
  expect(result?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.receipt.status)
  expect((await balanceOf(recipient)) - recipientBefore).toBe(20_250_000n)
  // The spender pays the fee; the owner is debited the transfer alone.
  expect(ownerBefore - (await balanceOf(owner))).toBe(20_250_000n)
  expect(await allowanceOf(owner, spender)).toBe(55_250_000n)
  expect(await getAllowance(readClient, { owner, spender })).toBe(55_250_000n)
}, 120_000)
