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
  expect(source).toMatch(/\.extend\(\s*publicActions\(\)\s*\)/)
  expect(source).toMatch(/\.extend\(\s*\([^)]*\)\s*=>\s*\(\{/)
  expect(source).toMatch(/\.health\.check\(\)/)
  expect(source).toMatch(/\.block\.getNumber\(\)/)
}, 60_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('extended methods report node-derived values', async () => {
  const result = await example()
  const [blockNumber, chainId] = await Promise.all([
    Actions.block.getNumber(client),
    Actions.chains.getId(client),
  ])
  expect(result.health.blockNumber).toBe(blockNumber)
  expect(result.health.chainId).toBe(chainId)
  expect(result.blockNumber).toBe(blockNumber)
  expect(result.chain.id).toBe(1)
}, 60_000)
