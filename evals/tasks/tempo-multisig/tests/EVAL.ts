import { readFileSync } from 'node:fs'
import { beforeAll, expect, test } from 'vitest'
import { tempoLocalnet } from 'viem/chains'
import { Account, Client, http } from 'viem/tempo'
import { transferFromMultisig } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'

const funder = '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955'
const funderKey =
  '0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356'
const client = Client.create({
  account: Account.fromSecp256k1(funderKey),
  chain: tempoLocalnet,
  pollingInterval: 100,
  transport: http(rpcUrl),
})

// Dev accounts 1-3 own the first multisig; dev accounts 4-6 own the second.
const ownerKeysA = [
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
] as const
const ownerAddressesA = [
  '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
  '0x90f79bf6eb2c4f870365e785982e1f101e93b906',
]
const ownerKeysB = [
  '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
  '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
  '0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e',
] as const
const ownersA = [
  Account.fromSecp256k1(ownerKeysA[0]),
  Account.fromSecp256k1(ownerKeysA[1]),
  Account.fromSecp256k1(ownerKeysA[2]),
] as const
const ownersB = [
  Account.fromSecp256k1(ownerKeysB[0]),
  Account.fromSecp256k1(ownerKeysB[1]),
  Account.fromSecp256k1(ownerKeysB[2]),
] as const

const recipient = '0x4545454545454545454545454545454545454545'
const recipient2 = '0x4646464646464646464646464646464646464646'

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

beforeAll(async () => {
  // Seed the funder with pathUSD via the node faucet.
  if ((await balanceOf(funder)) >= 100_000_000n) return
  await rpc('tempo_fundAddress', [funder])
  for (let i = 0; i < 300; i++) {
    if ((await balanceOf(funder)) >= 100_000_000n) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error('failed to fund the funder account with pathUSD')
}, 120_000)

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('two approvals meet the 2-of-3 threshold: transfer lands', async () => {
  const before = await balanceOf(recipient)
  const result = await transferFromMultisig(client, {
    amount: '10.5',
    approvers: [ownersA[0], ownersA[2]],
    owners: ownersA,
    to: recipient,
  })
  expect(result?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.receipt.status)
  expect((await balanceOf(recipient)) - before).toBe(10_500_000n)

  // The sender is the multisig account itself, not the funder or an owner.
  const multisig = String(result.multisig).toLowerCase()
  expect(String(result.receipt.from).toLowerCase()).toBe(multisig)
  expect([funder.toLowerCase(), ...ownerAddressesA]).not.toContain(multisig)
}, 120_000)

test('one approval is below the threshold: broadcast rejected', async () => {
  const before = await balanceOf(recipient2)
  await expect(
    transferFromMultisig(client, {
      amount: '3',
      approvers: [ownersB[1]],
      owners: ownersB,
      to: recipient2,
    }),
  ).rejects.toThrow()
  expect(await balanceOf(recipient2)).toBe(before)
}, 120_000)
