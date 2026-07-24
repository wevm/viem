import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { beforeAll, expect, test } from 'vitest'
import {
  countBlockTransactions,
  getFinalizedBlock,
  getLatestBlock,
} from '../src/index.ts'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

// JSON-RPC-level failure; never retried.
class RpcError extends Error {}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function rpcOnce(method: string, params: unknown[] = []) {
  const res = await fetch('http://anvil:8545', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const { result, error } = (await res.json()) as any
  if (error) throw new RpcError(error.message)
  return result
}

// Retry any network-level failure (ENOTFOUND, fetch failed, socket drops)
// under full-suite docker load. RPC errors rethrow immediately.
async function rpc(method: string, params: unknown[] = []) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await rpcOnce(method, params)
    } catch (error) {
      if (error instanceof RpcError || attempt >= 10) throw error
      await sleep(1_000)
    }
  }
}

// Non-idempotent: send once, then confirm via the sender's pending nonce.
// Re-send only when the node provably never received the transaction.
async function sendTransaction(tx: {
  from: string
  to: string
  value: string
}) {
  const before = BigInt(
    await rpc('eth_getTransactionCount', [tx.from, 'pending']),
  )
  const deadline = Date.now() + 120_000
  for (;;) {
    try {
      return await rpcOnce('eth_sendTransaction', [tx])
    } catch (error) {
      if (error instanceof RpcError) throw error
      for (let i = 0; i < 5; i++) {
        await sleep(1_000)
        const nonce = BigInt(
          await rpc('eth_getTransactionCount', [tx.from, 'pending']),
        )
        if (nonce > before) return
      }
      if (Date.now() > deadline) throw error
    }
  }
}

const sender0 = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const sender1 = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
// History-free address: safe transfer recipient on the fork.
const recipient = '0x4242424242424242424242424242424242424242'

// Mine past the finality window so `finalized` resolves to a local block.
beforeAll(async () => {
  await rpc('anvil_mine', ['0x64'])
}, 180_000)

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 90_000)

test('reads the latest block', async () => {
  const block = await getLatestBlock(client)
  expect(block.hash).toMatch(/^0x[0-9a-f]{64}$/)
  expect(block.number).toBeGreaterThanOrEqual(24_000_000n)
  expect(block.number).toBeLessThan(24_001_000n)
  const node = await rpc('eth_getBlockByNumber', ['latest', false])
  expect(block.hash).toBe(node.hash)
}, 90_000)

test('reads the finalized block', async () => {
  const block = await getFinalizedBlock(client)
  const node = await rpc('eth_getBlockByNumber', ['finalized', false])
  expect(block.hash).toBe(node.hash)
  expect(block.number).toBe(BigInt(node.number))
}, 90_000)

test('counts transactions in a block', async () => {
  await rpc('anvil_setAutomine', [false])
  try {
    await sendTransaction({ from: sender0, to: recipient, value: '0x1' })
    await sendTransaction({ from: sender1, to: recipient, value: '0x1' })
    await rpc('anvil_mine', ['0x1'])
  } finally {
    await rpc('anvil_setAutomine', [true])
  }
  const blockNumber = BigInt(await rpc('eth_blockNumber'))
  expect(await countBlockTransactions(client, { blockNumber })).toBe(2)
  // The pre-mined block directly below is empty.
  expect(
    await countBlockTransactions(client, { blockNumber: blockNumber - 1n }),
  ).toBe(0)
}, 180_000)
