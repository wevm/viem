import { readFileSync } from 'node:fs'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

type RpcResponse = {
  error?: { message: string }
}

async function rpc(method: string, params: unknown[]): Promise<void> {
  let response: RpcResponse | undefined
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await fetch('http://anvil:8545', {
        body: JSON.stringify({ id: 1, jsonrpc: '2.0', method, params }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      if (!result.ok) throw new Error(`HTTP ${result.status}`)
      response = await result.json()
      break
    } catch (error) {
      if (attempt === 2) throw error
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }
  if (!response) throw new Error('RPC did not return a response')
  if (response.error) throw new Error(response.error.message)
}

const senders = [
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
]
// History-free recipient: well-known addresses can carry EIP-7702 sweeper
// delegations on the fork.
const recipient = '0x4242424242424242424242424242424242424242'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('gets block receipts and reduces their gas', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/Actions\.block\.getReceipts/)
  expect(source).toMatch(/\.reduce\s*\(/)
}, 60_000)

test('takes no inputs', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

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

  const block = await Actions.block.get(client)
  expect(block.transactions).toHaveLength(3)

  const total = await example()
  expect(total).toBe(block.gasUsed)
  // 3 plain ETH transfers at intrinsic gas.
  expect(total).toBe(63_000n)
}, 120_000)
