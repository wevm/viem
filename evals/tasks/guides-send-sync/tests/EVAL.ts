import { readFileSync, readdirSync } from 'node:fs'
import { Account, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { beforeAll, expect, test } from 'vitest'
import { sendPayment } from '../src/index.ts'

const sender = '0x09E993fd7D5A600eF78722F4bFb092ea9Af70e8E'
// History-free recipient: anvil dev accounts carry EIP-7702 sweeper
// delegations on real mainnet, so forked transfers to them are swept.
const recipient = '0x4242424242424242424242424242424242424242'
const value = 500_000_000_000_000_000n // 0.5 ETH

const client = Client.create({
  // Arbitrary key with no mainnet history; sender is funded below.
  account: Account.fromPrivateKey(
    '0xf71f379f68c738d29b7a90474497eb9ce74c699bb9ada94bda359f8c2f101263',
  ),
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

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
})

test('confirms in one call, not a separate receipt wait', () => {
  expect(sources()).not.toMatch(
    /waitForReceipt|getReceipt|eth_getTransactionReceipt/,
  )
})

test('sends ETH and returns the confirmed receipt', async () => {
  const before = BigInt(await rpc('eth_getBalance', [recipient, 'latest']))

  const receipt = await sendPayment(client, {
    amountEther: '0.5',
    to: recipient,
  })
  expect(receipt.status).toBe('success')

  // The receipt must correspond to a mined transaction from the sender.
  const mined = await rpc('eth_getTransactionReceipt', [
    receipt.transactionHash,
  ])
  expect(mined.status).toBe('0x1')
  expect(mined.from.toLowerCase()).toBe(sender.toLowerCase())

  const after = BigInt(await rpc('eth_getBalance', [recipient, 'latest']))
  expect(after - before).toBe(value)
}, 60_000)
