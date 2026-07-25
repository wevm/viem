import { readFileSync } from 'node:fs'
import { tempoLocalnet } from 'viem/chains'
import { Actions, Client, http } from 'viem/tempo'
import type { Address } from 'viem/utils'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
// Dev account 4 (blocked recipient) and a fresh claim destination.
const recipient = '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65'
const claimDest = '0x4545454545454545454545454545454545454545'
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

async function balanceOf(account: Address.Address, blockNumber?: bigint) {
  const { amount } = await Actions.token.getBalance(client, {
    account,
    token: pathUsd,
    ...(blockNumber === undefined ? {} : { blockNumber }),
  })
  return amount
}

async function fund(address: Address.Address) {
  if ((await balanceOf(address)) >= 100_000_000n) return
  await rpc('tempo_fundAddress', [address])
  for (let i = 0; i < 300; i++) {
    if ((await balanceOf(address)) >= 100_000_000n) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`failed to fund ${address} with pathUSD`)
}

beforeAll(async () => {
  // Fund the recipient (fee money) BEFORE its blocking policy is installed.
  await fund(sender)
  await fund(recipient)
}, 240_000)

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 60_000)

test('blocks and reclaims the transfer', async () => {
  const claimBefore = await balanceOf(claimDest)
  const result = await example()

  expect(['success', '0x1']).toContain(result.policy.receipt.status)
  expect(['success', '0x1']).toContain(result.transfer.receipt.status)
  expect(['success', '0x1']).toContain(result.claim.receipt.status)
  expect(await balanceOf(recipient)).toBe(
    await balanceOf(recipient, result.policy.receipt.blockNumber),
  )
  expect(result.before).toBe(12_500_000n)
  expect(result.after).toBe(0n)
  expect(
    await Actions.receivePolicy.getBlockedBalance(client, {
      receipt: result.claimReceipt,
    }),
  ).toBe(0n)
  expect((await balanceOf(claimDest)) - claimBefore).toBe(12_500_000n)
}, 120_000)
