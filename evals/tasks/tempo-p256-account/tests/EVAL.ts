import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { tempoLocalnet } from 'viem/chains'
import { Client, http } from 'viem/tempo'
import { transferFromNewAccount } from '../src/index.ts'

const rpcUrl = 'http://tempo:8545'
const pathUsd = '0x20c0000000000000000000000000000000000000'
const recipient = '0x5151515151515151515151515151515151515151'
const recipient2 = '0x5252525252525252525252525252525252525252'
const client = Client.create({
  chain: tempoLocalnet,
  feeToken: pathUsd,
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

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('transfers 10.5 pathUSD from a fresh faucet-funded P256 account', async () => {
  const before = await balanceOf(recipient)
  const result = await transferFromNewAccount(client, {
    amount: '10.5',
    to: recipient,
  })

  expect(result?.sender).toMatch(/^0x[0-9a-fA-F]{40}$/)
  expect(result?.receipt).toBeTruthy()
  expect(['success', '0x1']).toContain(result.receipt.status)
  expect(result.receipt.from.toLowerCase()).toBe(result.sender.toLowerCase())
  expect((await balanceOf(recipient)) - before).toBe(10_500_000n)

  // The transfer must be signed by a P256 key, not secp256k1.
  const tx = await rpc('eth_getTransactionByHash', [
    result.receipt.transactionHash,
  ])
  expect(String(tx?.signature?.type ?? '').toLowerCase()).toBe('p256')

  // The sender was faucet-funded and paid its own fees.
  expect(await balanceOf(result.sender)).toBeGreaterThan(0n)
}, 120_000)

test('each call provisions a distinct fresh account', async () => {
  const before = await balanceOf(recipient2)
  const a = await transferFromNewAccount(client, {
    amount: '0.25',
    to: recipient2,
  })
  const b = await transferFromNewAccount(client, {
    amount: '0.25',
    to: recipient2,
  })

  expect(a.sender.toLowerCase()).not.toBe(b.sender.toLowerCase())
  expect(a.receipt.from.toLowerCase()).toBe(a.sender.toLowerCase())
  expect(b.receipt.from.toLowerCase()).toBe(b.sender.toLowerCase())
  expect((await balanceOf(recipient2)) - before).toBe(500_000n)
}, 240_000)
