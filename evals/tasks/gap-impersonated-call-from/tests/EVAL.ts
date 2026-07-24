import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { wouldTransferSucceed } from '../src/index.ts'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

// Binance 14: holds 31_872_448_355 USDC base units at the pinned fork block.
const whale = '0x28C6c06298d514Db089934071355E5743bf21d60'
// Fresh address: no history, zero USDC balance.
const empty = '0xa1484a31504c80e30ce0a25c8f94dbaee9cde6bc'

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('whale can transfer a small amount', async () => {
  expect(
    await wouldTransferSucceed(client, { amount: 1_000_000n, from: whale }),
  ).toBe(true)
}, 30_000)

test('whale cannot transfer more than its balance', async () => {
  expect(
    await wouldTransferSucceed(client, {
      amount: 40_000_000_000n,
      from: whale,
    }),
  ).toBe(false)
}, 30_000)

test('fresh empty address cannot transfer', async () => {
  expect(
    await wouldTransferSucceed(client, { amount: 1_000_000n, from: empty }),
  ).toBe(false)
}, 30_000)
