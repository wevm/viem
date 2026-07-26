import { readFileSync } from 'node:fs'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const token = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const alice = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const bob = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
const carol = '0x90F79bf6EB2c4f870365E785982E1f101E93b906'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('uses a scoped node filter and cleans it up', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/Actions\.event\.createFilter/)
  expect(source).toMatch(/createFilter[\s\S]*?address\s*:/)
  expect(source).toMatch(/createFilter[\s\S]*?args\s*:/)
  expect(source).toMatch(/Actions\.filter\.getChanges/)
  expect(source).toMatch(/Actions\.filter\.uninstall/)
  expect(source).not.toMatch(/impersonat/i)
}, 60_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('collects matching transfers and uninstalls the filter', async () => {
  const [alice_before, bob_before, carol_before] = await Promise.all([
    Actions.token.getBalance(client, { account: alice, token }),
    Actions.token.getBalance(client, { account: bob, token }),
    Actions.token.getBalance(client, { account: carol, token }),
  ])

  const result = await example()

  expect(result.uninstalled).toBe(true)
  expect(
    result.transfers.map(({ from, to, value }) => ({
      from: from.toLowerCase(),
      to: to.toLowerCase(),
      value,
    })),
  ).toEqual([
    { from: sender.toLowerCase(), to: alice.toLowerCase(), value: 1_230_000n },
    { from: sender.toLowerCase(), to: bob.toLowerCase(), value: 45_000_000n },
  ])

  const [alice_after, bob_after, carol_after] = await Promise.all([
    Actions.token.getBalance(client, { account: alice, token }),
    Actions.token.getBalance(client, { account: bob, token }),
    Actions.token.getBalance(client, { account: carol, token }),
  ])
  expect(alice_after.amount - alice_before.amount).toBe(1_230_000n)
  expect(bob_after.amount - bob_before.amount).toBe(45_000_000n)
  expect(carol_after.amount - carol_before.amount).toBe(999n)
}, 120_000)
