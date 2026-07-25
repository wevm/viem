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
      const res = await fetch('http://anvil:8545', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      response = await res.json()
      break
    } catch (error) {
      if (attempt === 2) throw error
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }
  if (!response) throw new Error('RPC did not return a response')
  if (response.error) throw new Error(response.error.message)
}

// Fixed fresh keys; setup pins balance and code so upstream state is irrelevant.
const poorAddress = '0xA75ECd00106901c1C37447B2Cd889326bE03822b'
const richAddress = '0x701dc6864212b700915dd281d9ee0035ce358c04'
// History-free recipient (avoids EIP-7702 sweeper delegations on known EOAs).
const recipient = '0x4242424242424242424242424242424242424242'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('uses viem', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/RpcError\.InsufficientFundsError/)
  expect(source).toMatch(/\.walk\(/)
  expect(source).not.toMatch(/\.message\b/)
  expect(source.match(/Client\.create\(/g)).toHaveLength(1)
  expect(source).toMatch(/Actions\.transaction\.send\([\s\S]*account\s*[:,]/)
}, 120_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('classifies transfer outcomes', async () => {
  await rpc('anvil_setBalance', [poorAddress, '0x0'])
  await rpc('anvil_setCode', [poorAddress, '0x'])
  await rpc('anvil_setBalance', [richAddress, '0x3635c9adc5dea00000'])
  await rpc('anvil_setCode', [richAddress, '0x'])
  await rpc('anvil_setBalance', [recipient, '0x0'])

  const result = await example()
  expect(result).toEqual({
    insufficientFunds: 'insufficient-funds',
    sent: 'sent',
    unknown: 'unknown',
  })
  await rpc('evm_mine', [])
  const balance = await Actions.address.getBalance(client, {
    address: recipient,
  })
  expect(balance).toBe(1_000_000_000_000_000_000n)
}, 120_000)
