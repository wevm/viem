import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { getTokenSummaryStrict, getUsdcSummary } from '../src/index.ts'

const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const whale = '0x28C6c06298d514Db089934071355E5743bf21d60'
const holder = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
// Given revert-all bytecode via anvil_setCode, so every ERC-20 read reverts.
const bogus = '0x4242424242424242424242424242424242424242'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

const selectors = {
  balanceOf: '0x70a08231',
  decimals: '0x313ce567',
  name: '0x06fdde03',
  symbol: '0x95d89b41',
  transfer: '0xa9059cbb',
} as const

async function rpc(method: string, params: unknown[]) {
  // Retry transient socket/DNS failures seen under parallel suite load.
  let response: any
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch('http://anvil:8545', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      })
      response = await res.json()
      break
    } catch (error) {
      if (attempt >= 3) throw error
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
    }
  }
  const { result, error } = response
  if (error) throw new Error(error.message)
  return result
}

function pad(value: string | bigint) {
  const hex =
    typeof value === 'bigint' ? value.toString(16) : value.replace(/^0x/, '')
  return hex.toLowerCase().padStart(64, '0')
}

// ABI-decode a single returned string.
function decodeString(data: string) {
  const hex = data.slice(2)
  const offset = Number(BigInt(`0x${hex.slice(0, 64)}`)) * 2
  const length = Number(BigInt(`0x${hex.slice(offset, offset + 64)}`)) * 2
  return Buffer.from(
    hex.slice(offset + 64, offset + 64 + length),
    'hex',
  ).toString('utf8')
}

// Reference values via raw eth_call, independent of viem.
async function readRaw(owner: string) {
  const [name, symbol, decimals, balance] = await Promise.all([
    rpc('eth_call', [{ to: usdc, data: selectors.name }, 'latest']),
    rpc('eth_call', [{ to: usdc, data: selectors.symbol }, 'latest']),
    rpc('eth_call', [{ to: usdc, data: selectors.decimals }, 'latest']),
    rpc('eth_call', [
      { to: usdc, data: selectors.balanceOf + pad(owner) },
      'latest',
    ]),
  ])
  return {
    balance: BigInt(balance),
    decimals: Number(BigInt(decimals)),
    name: decodeString(name),
    symbol: decodeString(symbol),
  }
}

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 60_000)

test('summary matches raw eth_call results for the whale', async () => {
  const summary = await getUsdcSummary(client, { owner: whale })
  const raw = await readRaw(whale)
  expect(summary.name).toBe(raw.name)
  expect(summary.symbol).toBe(raw.symbol)
  expect(summary.decimals).toBe(raw.decimals)
  expect(summary.balance).toBe(raw.balance)
  expect(summary.balance).toBeGreaterThan(0n)
}, 120_000)

test('summary tracks a fresh transfer to another holder', async () => {
  await rpc('anvil_setBalance', [whale, '0x8ac7230489e80000'])
  await rpc('anvil_impersonateAccount', [whale])
  const hash = await rpc('eth_sendTransaction', [
    {
      from: whale,
      to: usdc,
      data: selectors.transfer + pad(holder) + pad(12_345_678n),
    },
  ])
  // The receipt lands shortly after the hash is returned; poll for it.
  let mined = false
  for (let i = 0; i < 100; i++) {
    const receipt = await rpc('eth_getTransactionReceipt', [hash])
    if (receipt) {
      if (receipt.status !== '0x1') throw new Error('transfer failed')
      mined = true
      break
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  if (!mined) throw new Error('transfer timed out')

  const summary = await getUsdcSummary(client, { owner: holder })
  const raw = await readRaw(holder)
  expect(summary.balance).toBe(raw.balance)
  expect(summary.balance).toBeGreaterThanOrEqual(12_345_678n)
  expect(summary.name).toBe(raw.name)
  expect(summary.symbol).toBe(raw.symbol)
  expect(summary.decimals).toBe(raw.decimals)
}, 120_000)

test('strict variant returns the same values for USDC', async () => {
  const summary = await getTokenSummaryStrict(client, {
    owner: whale,
    token: usdc,
  })
  const raw = await readRaw(whale)
  expect(summary.name).toBe(raw.name)
  expect(summary.symbol).toBe(raw.symbol)
  expect(summary.decimals).toBe(raw.decimals)
  expect(summary.balance).toBe(raw.balance)
}, 120_000)

test('strict variant rejects when a call fails', async () => {
  // PUSH1 0x00 PUSH1 0x00 REVERT: contract that reverts on every call.
  await rpc('anvil_setCode', [bogus, '0x60006000fd'])
  await expect(
    getTokenSummaryStrict(client, { owner: whale, token: bogus }),
  ).rejects.toThrow()
}, 120_000)
