import { readFileSync, readdirSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import type { Address } from 'viem/utils'
import { beforeAll, expect, expectTypeOf, test } from 'vitest'
import { sendEth } from '../src/index.ts'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

// Arbitrary key with no mainnet history; sender is funded below.
const privateKey =
  '0xf71f379f68c738d29b7a90474497eb9ce74c699bb9ada94bda359f8c2f101263'
const sender = '0x09E993fd7D5A600eF78722F4bFb092ea9Af70e8E'
// History-free recipient: anvil dev accounts carry EIP-7702 sweeper
// delegations on real mainnet, so forked transfers to them are swept.
const recipient = '0x4242424242424242424242424242424242424242'
const value = 1_000_000_000_000_000_000n // 1 ETH

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

function sources() {
  return readdirSync('src', { recursive: true })
    .filter((file) => String(file).endsWith('.ts'))
    .map((file) => readFileSync(`src/${file}`, 'utf8'))
    .join('\n')
}

beforeAll(async () => {
  // Fund the sender (2 ETH) so the transfer plus gas is covered.
  await rpc('anvil_setBalance', [sender, '0x1bc16d674ec80000'])
})

test('uses viem', () => {
  expect(sources()).toMatch(/from ['"]viem/)
}, 60_000)

test('builds the account from a custom sign function, not a key helper', () => {
  expect(sources()).not.toMatch(/fromPrivateKey|fromHdKey|fromMnemonic/)
}, 60_000)

test('sends ETH signed by the custom account', async () => {
  const before = BigInt(await rpc('eth_getBalance', [recipient, 'latest']))

  const receipt = await sendEth(client, {
    privateKey,
    to: recipient,
    value,
  })
  expectTypeOf(receipt.from).toEqualTypeOf<Address.Address>()
  expect(receipt.from.toLowerCase()).toBe(sender.toLowerCase())
  expect(receipt.status).toBe('success')

  // The transaction must originate from the address derived from the key.
  const transaction = await rpc('eth_getTransactionByHash', [
    receipt.transactionHash,
  ])
  expect(transaction.from.toLowerCase()).toBe(sender.toLowerCase())

  const after = BigInt(await rpc('eth_getBalance', [recipient, 'latest']))
  expect(after - before).toBe(value)
}, 60_000)
