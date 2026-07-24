import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { getBlockGasUsed } from '../src/index.ts'

const client = Client.create({
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

const senders = [
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
]
// History-free recipient: well-known addresses can carry EIP-7702 sweeper
// delegations on the fork.
const recipient = '0x4242424242424242424242424242424242424242'

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('sums receipt gas of a multi-transaction block', async () => {
  await rpc('anvil_setAutomine', [false])
  try {
    for (const from of senders)
      await rpc('eth_sendTransaction', [
        { from, to: recipient, value: '0xde0b6b3a7640000' },
      ])
    await rpc('anvil_mine', ['0x1'])
  } finally {
    await rpc('anvil_setAutomine', [true])
  }

  const block = await rpc('eth_getBlockByNumber', ['latest', false])
  expect(block.transactions).toHaveLength(3)

  const total = await getBlockGasUsed(client, {
    blockNumber: BigInt(block.number),
  })
  expect(total).toBe(BigInt(block.gasUsed))
  // 3 plain ETH transfers at intrinsic gas.
  expect(total).toBe(63_000n)
}, 60_000)
