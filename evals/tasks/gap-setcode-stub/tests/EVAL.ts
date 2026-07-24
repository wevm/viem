import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { stubContract } from '../src/index.ts'

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

// Runtime bytecode: SLOAD slot 0, return it as a 32-byte word (ignores calldata).
const bytecode = '0x60005460005260206000f3'
// keccak256('getValue()') selector.
const selector = '0x20965255'

function word(value: bigint) {
  return `0x${value.toString(16).padStart(64, '0')}`
}

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('stubs the contract and returns the injected value', async () => {
  const address = '0x51ab7042d3cbeff0e5c25671e419b1682d29d757'
  const value = 481_516_234_233n

  expect(await stubContract(client, { address, bytecode, value })).toBe(value)

  expect(await rpc('eth_getCode', [address, 'latest'])).toBe(bytecode)
  expect(await rpc('eth_getStorageAt', [address, '0x0', 'latest'])).toBe(
    word(value),
  )
  const returned = await rpc('eth_call', [
    { to: address, data: selector },
    'latest',
  ])
  expect(BigInt(returned)).toBe(value)
}, 60_000)

test('works for a second address and value', async () => {
  const address = '0xc0ffee254729296a45a3885639ac7e10f9d54979'
  const value = 42n

  expect(await stubContract(client, { address, bytecode, value })).toBe(value)

  expect(await rpc('eth_getCode', [address, 'latest'])).toBe(bytecode)
  expect(await rpc('eth_getStorageAt', [address, '0x0', 'latest'])).toBe(
    word(value),
  )
}, 60_000)
