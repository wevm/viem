import { readFileSync } from 'node:fs'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

type MultisigOwner = {
  owner: string
  weight: number | string
}

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'

const funder = '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955'

const ownerAddressesA = [
  '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
  '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
  '0x90f79bf6eb2c4f870365e785982e1f101e93b906',
]
const recipient = '0x4545454545454545454545454545454545454545'
const rejectedRecipient = '0x4646464646464646464646464646464646464646'

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

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/\bRpcError\.ExecutionError\b/)
  expect(source).toMatch(/\berror\.cause\.message\b/)
}, 60_000)

test('enforces the approval threshold for two multisigs', async () => {
  const before = await balanceOf(recipient)
  const rejectedBefore = await balanceOf(rejectedRecipient)
  const result = await example()
  expect(result?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.receipt.status)
  expect((await balanceOf(recipient)) - before).toBe(10_500_000n)

  // The sender is the multisig account itself, not the funder or an owner.
  const multisig = String(result.multisig).toLowerCase()
  expect(String(result.receipt.from).toLowerCase()).toBe(multisig)
  expect([funder.toLowerCase(), ...ownerAddressesA]).not.toContain(multisig)

  const transaction = await rpc('eth_getTransactionByHash', [
    result.receipt.transactionHash,
  ])
  expect(transaction.signature?.type).toBe('multisig')
  const init = transaction.signature?.init
  const owners: readonly MultisigOwner[] = init?.owners ?? []
  expect(Number(init?.threshold)).toBe(2)
  expect(owners.map(({ owner }) => owner.toLowerCase())).toEqual(
    ownerAddressesA,
  )
  expect(owners.map(({ weight }) => Number(weight))).toEqual([1, 1, 1])
  expect(transaction.signature?.signatures).toHaveLength(2)

  expect(result.rejected).toBe(true)
  expect(await balanceOf(rejectedRecipient)).toBe(rejectedBefore)
}, 120_000)
