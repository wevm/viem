import { readFileSync } from 'node:fs'
import { Account, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { sendEth } from '../src/index.ts'

const key0 =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const sender0 = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
const key1 =
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
const sender1 = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
// History-free address: anvil dev accounts carry EIP-7702 sweeper delegations
// on real mainnet, so forked transfers to them are swept in the same tx.
const recipient = '0x4242424242424242424242424242424242424242'

const client0 = Client.create({
  account: Account.fromPrivateKey(key0),
  chain: mainnet,
  transport: http('http://anvil:8545'),
})
const client1 = Client.create({
  account: Account.fromPrivateKey(key1),
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

async function rpc(method: string, params: unknown[]) {
  // Retry transient DNS/socket failures seen under parallel suite load.
  // All calls here are idempotent reads, so blind retry is safe.
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
      if (attempt >= 10) throw error
      await new Promise((resolve) => setTimeout(resolve, 1_000))
    }
  }
  const { result, error } = response
  if (error) throw new Error(error.message)
  return result
}

test('uses viem', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).not.toMatch(/\baccount\s*:/)
}, 90_000)

test('sends ETH from the hoisted account', async () => {
  const before = BigInt(await rpc('eth_getBalance', [recipient, 'latest']))
  const receipt = await sendEth(client0, {
    amountEther: '1.25',
    to: recipient,
  })
  expect(receipt.status).toBe('success')

  const raw = await rpc('eth_getTransactionReceipt', [receipt.transactionHash])
  expect(raw.status).toBe('0x1')
  expect(raw.from.toLowerCase()).toBe(sender0)
  expect(raw.to.toLowerCase()).toBe(recipient)

  const after = BigInt(await rpc('eth_getBalance', [recipient, 'latest']))
  expect(after - before).toBe(1_250_000_000_000_000_000n)
}, 180_000)

test('uses the account from a different client', async () => {
  const before = BigInt(await rpc('eth_getBalance', [recipient, 'latest']))
  const receipt = await sendEth(client1, {
    amountEther: '0.5',
    to: recipient,
  })
  expect(receipt.status).toBe('success')

  const raw = await rpc('eth_getTransactionReceipt', [receipt.transactionHash])
  expect(raw.status).toBe('0x1')
  expect(raw.from.toLowerCase()).toBe(sender1)

  const after = BigInt(await rpc('eth_getBalance', [recipient, 'latest']))
  expect(after - before).toBe(500_000_000_000_000_000n)
}, 180_000)
