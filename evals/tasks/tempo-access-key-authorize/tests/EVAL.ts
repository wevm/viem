import { readFileSync } from 'node:fs'
import { Actions as core_Actions } from 'viem'
import { tempoLocalnet } from 'viem/chains'
import { Account, Actions, Client, http } from 'viem/tempo'
import type { Address } from 'viem/utils'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const root = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const recipient = '0x5151515151515151515151515151515151515151'
const recipient2 = '0x5252525252525252525252525252525252525252'
const rootAccount = Account.fromSecp256k1(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const accessKey = Account.fromP256(
  '0x1111111111111111111111111111111111111111111111111111111111111111',
  { access: rootAccount },
)
const client = Client.create({
  chain: tempoLocalnet,
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

async function balanceOf(account: Address.Address) {
  return (await Actions.token.getBalance(client, { account, token: pathUsd }))
    .amount
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
  expect(source.match(/\bClient\.create\s*\(/g)).toHaveLength(1)
  expect(source).toMatch(/\bContractFunctionRevertedError\b/)
}, 60_000)

test('authorizes the key and enforces its limit', async () => {
  const before = await balanceOf(recipient)
  const result = await example()

  expect(['success', '0x1']).toContain(result.authorization.receipt.status)
  expect(['success', '0x1']).toContain(result.transfer.receipt.status)
  expect(result.authorization.publicKey.toLowerCase()).toBe(
    accessKey.address.toLowerCase(),
  )
  const block = await core_Actions.block.get(client, {
    blockNumber: result.authorization.receipt.blockNumber,
  })
  const duration = Number(result.authorization.expiry) - Number(block.timestamp)
  expect(duration).toBeGreaterThanOrEqual(3_590)
  expect(duration).toBeLessThanOrEqual(3_600)
  const { remaining } = await Actions.accessKey.getRemainingLimit(client, {
    accessKey,
    account: rootAccount,
    blockNumber: result.authorization.receipt.blockNumber,
    token: pathUsd,
  })
  expect(remaining).toBe(100_000_000n)
  expect((await balanceOf(recipient)) - before).toBe(30_500_000n)
  expect(result.rejected).toBe(true)
  expect(await balanceOf(recipient2)).toBe(0n)
}, 120_000)
