import { readFileSync } from 'node:fs'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

// History-free address at the pinned fork block.
const address = '0x4242424242424242424242424242424242424242'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('uses viem', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/z\.RpcSchema\.from\(/)
  expect(source).toMatch(/Client\.create\(\{[\s\S]*?\bschema\b/)
  expect(source).toMatch(
    /\.request\(\{[\s\S]*?method\s*:\s*['"]anvil_setBalance/,
  )
  expect(source).not.toMatch(/\bas\s+(?:any|never|unknown)\b/)
}, 60_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('sets the balance and returns it', async () => {
  const wei = 123_456_789_012_345_678_901n
  expect(await example()).toBe(wei)
  expect(await Actions.address.getBalance(client, { address })).toBe(wei)
}, 60_000)
