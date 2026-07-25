import { readFileSync } from 'node:fs'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

type RpcResponse = {
  error?: { message: string }
}

async function rpc(method: string, params: unknown[] = []): Promise<void> {
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

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('uses viem', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(
    /\bprovider\s*=\s*Provider\.from\(\s*\{[\s\S]*?\brequest\s*\(/,
  )
  expect(source).toMatch(/RpcResponse\.parse\(/)
  expect(source).toMatch(/transport\s*:\s*custom\(\s*provider\s*\)/)
  expect(source).not.toMatch(/\bhttp\(/)
}, 60_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('reads fresh state through the provider', async () => {
  const address = '0x5151515151515151515151515151515151515151'
  await rpc('anvil_setBalance', [address, '0xde0b6b3a7640000'])
  expect(await example()).toBe(1_000_000_000_000_000_000n)
  expect(await example()).toBe(
    await Actions.address.getBalance(client, { address }),
  )
}, 60_000)
