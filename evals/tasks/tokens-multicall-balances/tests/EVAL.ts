import { readFileSync } from 'node:fs'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const token = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const holder = '0x28C6c06298d514Db089934071355E5743bf21d60'
const alice = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const bob = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source.match(/\bActions\.multicall\s*\(/g)).toHaveLength(1)
  expect(source.match(/\ballowFailure\s*:\s*false/g)).toHaveLength(1)
}, 60_000)

test('returns fresh balances in account order', async () => {
  const expected = (
    await Promise.all([
      Actions.token.getBalance(client, { account: holder, token }),
      Actions.token.getBalance(client, { account: alice, token }),
      Actions.token.getBalance(client, { account: bob, token }),
    ])
  ).map(({ amount }) => amount)

  expect(await example()).toEqual(expected)
  expect(expected[0]).toBeGreaterThan(0n)
}, 120_000)
