import { readFileSync } from 'node:fs'
import { Account, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { seedUsdc } from '../src/index.ts'

async function rpc(method: string, params: unknown[]) {
  const res = await fetch('http://anvil:8545', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const { result, error } = (await res.json()) as any
  if (error) throw new Error(error.message)
  return result
}

const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
// Binance 14: holds 31872448355 USDC base units at the pinned block.
const whale = '0x28C6c06298d514Db089934071355E5743bf21d60'
// Dev account 2 (EIP-7702 code cleared at boot).
const recipient = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'

const amount = 12_345_678n

const client = Client.create({
  account: Account.from(whale),
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

async function balanceOf(address: string) {
  const data = `0x70a08231${address.slice(2).toLowerCase().padStart(64, '0')}`
  return BigInt(await rpc('eth_call', [{ to: usdc, data }, 'latest']))
}

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('moves the exact USDC amount from the whale', async () => {
  const whaleBefore = await balanceOf(whale)
  const recipientBefore = await balanceOf(recipient)

  const hash = await seedUsdc(client, { amount, to: recipient })
  expect(hash).toMatch(/^0x[0-9a-f]{64}$/i)

  const receipt = await rpc('eth_getTransactionReceipt', [hash])
  expect(receipt.status).toBe('0x1')
  expect(receipt.from.toLowerCase()).toBe(whale.toLowerCase())

  expect(await balanceOf(recipient)).toBe(recipientBefore + amount)
  expect(await balanceOf(whale)).toBe(whaleBefore - amount)
}, 60_000)

test('impersonation is stopped afterwards', async () => {
  await expect(
    rpc('eth_sendTransaction', [{ from: whale, to: recipient, value: '0x1' }]),
  ).rejects.toThrow()
}, 60_000)
