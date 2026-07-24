import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { getUsdcBalances } from '../src/index.ts'

const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const whale = '0x28C6c06298d514Db089934071355E5743bf21d60' // Binance 14
const a = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const b = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

const selectors = {
  balanceOf: '0x70a08231',
  transfer: '0xa9059cbb',
} as const

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

function pad(value: string | bigint) {
  const hex =
    typeof value === 'bigint' ? value.toString(16) : value.replace(/^0x/, '')
  return hex.toLowerCase().padStart(64, '0')
}

// Reference balance via raw eth_call, independent of viem.
async function balanceOf(owner: string) {
  return BigInt(
    await rpc('eth_call', [
      { to: usdc, data: selectors.balanceOf + pad(owner) },
      'latest',
    ]),
  )
}

async function transfer(to: string, amount: bigint) {
  const hash = await rpc('eth_sendTransaction', [
    { from: whale, to: usdc, data: selectors.transfer + pad(to) + pad(amount) },
  ])
  // The receipt lands shortly after the hash is returned; poll for it.
  for (let i = 0; i < 100; i++) {
    const receipt = await rpc('eth_getTransactionReceipt', [hash])
    if (receipt) {
      if (receipt.status !== '0x1') throw new Error('transfer failed')
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error('transfer timed out')
}

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('balances match raw eth_call results at the pinned block', async () => {
  const balances = await getUsdcBalances(client, {
    accounts: [whale, a, b],
  })
  const raw = await Promise.all([balanceOf(whale), balanceOf(a), balanceOf(b)])
  expect(balances[0]).toBe(raw[0])
  expect(balances[1]).toBe(raw[1])
  expect(balances[2]).toBe(raw[2])
  // Binance 14's USDC balance is pinned at fork block 24,000,000.
  expect(balances[0]).toBe(31872448355n)
}, 30_000)

test('balances track fresh transfers', async () => {
  await rpc('anvil_setBalance', [whale, '0x8ac7230489e80000'])
  await rpc('anvil_impersonateAccount', [whale])
  await transfer(a, 12_345_678n)
  await transfer(b, 987_654_321n)

  const balances = await getUsdcBalances(client, {
    accounts: [whale, a, b],
  })
  const raw = await Promise.all([balanceOf(whale), balanceOf(a), balanceOf(b)])
  expect(balances[0]).toBe(raw[0])
  expect(balances[1]).toBe(raw[1])
  expect(balances[2]).toBe(raw[2])
  expect(balances[1]).toBeGreaterThanOrEqual(12_345_678n)
  expect(balances[2]).toBeGreaterThanOrEqual(987_654_321n)
}, 30_000)
