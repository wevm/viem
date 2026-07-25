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

const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
// History-free address at the pinned fork block (no balance, no code).
const recipient = '0x1111000000000000000000000000000000001111'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('uses viem', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(
    /Client\.create\(\{[\s\S]*?\bblockTag\s*:\s*['"]pending['"]/,
  )
}, 120_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('sees the pending balance while latest differs', async () => {
  // No code at the recipient (no EIP-7702 sweeper on the fork).
  expect(await Actions.address.getCode(client, { address: recipient })).toBe(
    '0x',
  )

  const before = await Actions.address.getBalance(client, {
    address: recipient,
  })
  const value = 12345678901234567n

  await rpc('anvil_setAutomine', [false])
  try {
    await rpc('eth_sendTransaction', [
      { from: sender, to: recipient, value: `0x${value.toString(16)}` },
    ])

    const pending = await example()
    const latest = await Actions.address.getBalance(client, {
      address: recipient,
    })

    expect(latest).toBe(before)
    expect(pending).toBe(before + value)
    expect(pending).not.toBe(latest)
  } finally {
    await rpc('anvil_setAutomine', [true])
    await rpc('anvil_mine', [1])
  }
}, 120_000)
