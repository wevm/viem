import { readFileSync } from 'node:fs'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('uses viem', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/Chain\.from\(/)
  expect(source).toMatch(/maxPriorityFeePerGas\s*:/)
}, 60_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('pins the priority fee and covers the base fee', async () => {
  const { chain, fees } = await example()
  expect(chain.id).toBe(1)
  expect(chain.rpcUrls.http).toBe('http://anvil:8545')
  expect(chain.fees.maxPriorityFeePerGas).toBe(3_000_000_000n)
  expect(typeof fees.maxFeePerGas).toBe('bigint')
  expect(fees.maxPriorityFeePerGas).toBe(3_000_000_000n)
  expect(fees.maxFeePerGas).toBeGreaterThanOrEqual(fees.maxPriorityFeePerGas)

  const block = await Actions.block.get(client)
  expect(block.baseFeePerGas).toBeDefined()
  if (block.baseFeePerGas === undefined) throw new Error('missing base fee')
  expect(fees.maxFeePerGas).toBeGreaterThanOrEqual(
    block.baseFeePerGas + 3_000_000_000n,
  )
}, 60_000)
