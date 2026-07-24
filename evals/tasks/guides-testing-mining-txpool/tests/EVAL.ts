import { readFileSync } from 'node:fs'
import { Account, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { queueAndMineTransfers } from '../src/index.ts'

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

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('queues three transfers and mines them in a single block', async () => {
  const blockBefore = BigInt(await rpc('eth_blockNumber'))
  const balanceBefore = BigInt(
    await rpc('eth_getBalance', [recipient, 'latest']),
  )

  const result = await queueAndMineTransfers(client, {
    amountEther: '1',
    to: recipient,
  })

  expect(result.pooledBefore).toBe(3)
  expect(result.minedTxCount).toBe(3)

  // Exactly one new block, containing exactly the three queued transfers.
  const blockAfter = BigInt(await rpc('eth_blockNumber'))
  expect(blockAfter).toBe(blockBefore + 1n)
  const minedCount = await rpc('eth_getBlockTransactionCountByNumber', [
    `0x${blockAfter.toString(16)}`,
  ])
  expect(Number(minedCount)).toBe(3)

  // The pool is empty after mining.
  const status = await rpc('txpool_status')
  expect(Number(status.pending)).toBe(0)
  expect(Number(status.queued)).toBe(0)

  // The recipient received all three transfers.
  const balanceAfter = BigInt(
    await rpc('eth_getBalance', [recipient, 'latest']),
  )
  expect(balanceAfter - balanceBefore).toBe(3_000_000_000_000_000_000n)
}, 60_000)
