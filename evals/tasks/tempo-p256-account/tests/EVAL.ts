import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const recipient = '0x5151515151515151515151515151515151515151'
const recipient2 = '0x5252525252525252525252525252525252525252'

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

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/\bP256\.randomPrivateKey\s*\(/)
}, 60_000)

test('provisions two P256 accounts and transfers from both', async () => {
  const firstBefore = await balanceOf(recipient)
  const secondBefore = await balanceOf(recipient2)
  const { first, second } = await example()

  expect(first.sender.toLowerCase()).not.toBe(second.sender.toLowerCase())
  expect(first.receipt.from.toLowerCase()).toBe(first.sender.toLowerCase())
  expect(second.receipt.from.toLowerCase()).toBe(second.sender.toLowerCase())
  expect((await balanceOf(recipient)) - firstBefore).toBe(10_500_000n)
  expect((await balanceOf(recipient2)) - secondBefore).toBe(250_000n)
  for (const result of [first, second]) {
    const tx = await rpc('eth_getTransactionByHash', [
      result.receipt.transactionHash,
    ])
    const receipt = await rpc('eth_getTransactionReceipt', [
      result.receipt.transactionHash,
    ])
    expect(String(receipt.feePayer ?? receipt.from).toLowerCase()).toBe(
      result.sender.toLowerCase(),
    )
    expect(String(tx?.signature?.type ?? '').toLowerCase()).toBe('p256')
  }
}, 240_000)
