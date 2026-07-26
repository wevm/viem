import { readFileSync } from 'node:fs'
import { tempoLocalnet } from 'viem/chains'
import { Actions, Client, http } from 'viem/tempo'
import type { Address } from 'viem/utils'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const owner = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const spender = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const recipient = '0x4545454545454545454545454545454545454545'
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

async function allowanceOf(account: Address.Address, spender: Address.Address) {
  const { amount } = await Actions.token.getAllowance(client, {
    account,
    spender,
    token: pathUsd,
  })
  return amount
}

async function fund(account: Address.Address) {
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

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source.match(/\bClient\.create\s*\(/g)).toHaveLength(1)
}, 60_000)

test('approves, reads, and spends the allowance', async () => {
  const recipientBefore = await balanceOf(recipient)
  const result = await example()

  expect(['success', '0x1']).toContain(result.approval.receipt.status)
  expect(['success', '0x1']).toContain(result.transfer.receipt.status)
  expect(result.approved).toBe(75_500_000n)
  expect(result.remaining).toBe(55_250_000n)
  expect((await balanceOf(recipient)) - recipientBefore).toBe(20_250_000n)
  const ownerAfterApproval = await balanceOf(
    owner,
    result.approval.receipt.blockNumber,
  )
  expect(ownerAfterApproval - (await balanceOf(owner))).toBe(20_250_000n)
  expect(await allowanceOf(owner, spender)).toBe(55_250_000n)
}, 120_000)
