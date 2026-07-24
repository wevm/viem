import { readFileSync } from 'node:fs'
import { Account, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { getConfirmationCount, sendPaymentAndWait } from '../src/index.ts'

async function rpc(method: string, params: unknown[] = []) {
  const res = await fetch('http://anvil:8545', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const { result, error } = (await res.json()) as any
  if (error) throw new Error(error.message)
  return result
}

// Polls until `fn` settles on `expected` (client-side block-number caches may
// lag a few seconds), then returns the last value for an exact assertion.
async function until(fn: () => Promise<bigint>, expected: bigint) {
  const deadline = Date.now() + 20_000
  let value = await fn()
  while (value !== expected && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    value = await fn()
  }
  return value
}

// History-free address: anvil dev accounts carry EIP-7702 sweeper delegations
// on real mainnet, so forked transfers to them are swept in the same tx.
const recipient = '0x4242424242424242424242424242424242424242'

const client = Client.create({
  account: Account.fromPrivateKey(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  ),
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('sends a payment and returns a successful mined receipt', async () => {
  const before = BigInt(await rpc('eth_getBalance', [recipient, 'latest']))
  const receipt = await sendPaymentAndWait(client, {
    amountEther: '1',
    to: recipient,
  })
  expect(receipt.status).toBe('success')

  const after = BigInt(await rpc('eth_getBalance', [recipient, 'latest']))
  expect(after - before).toBe(10n ** 18n)

  // The receipt matches a real mined transaction on the node.
  const remote = await rpc('eth_getTransactionReceipt', [
    receipt.transactionHash,
  ])
  expect(remote.status).toBe('0x1')
  expect(BigInt(remote.blockNumber)).toBe(receipt.blockNumber)
}, 60_000)

test('confirmation count increases as blocks are mined', async () => {
  const { transactionHash: hash } = await sendPaymentAndWait(client, {
    amountEther: '0.5',
    to: recipient,
  })

  // Automine: the transaction sits on the chain tip.
  const before = await until(() => getConfirmationCount(client, { hash }), 1n)
  expect(before).toBe(1n)

  await rpc('anvil_mine', ['0x3'])
  const after = await until(() => getConfirmationCount(client, { hash }), 4n)
  expect(after).toBe(4n)
}, 60_000)

test('a pending transaction has zero confirmations', async () => {
  await rpc('anvil_setAutomine', [false])
  try {
    const hash = await rpc('eth_sendTransaction', [
      {
        from: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        to: recipient,
        value: '0x1',
      },
    ])
    expect(await getConfirmationCount(client, { hash })).toBe(0n)
  } finally {
    await rpc('anvil_setAutomine', [true])
    await rpc('anvil_mine', ['0x1'])
  }
}, 60_000)
