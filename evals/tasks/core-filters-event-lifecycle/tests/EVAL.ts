import { readFileSync } from 'node:fs'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const token = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const weth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const whale = '0x28C6c06298d514Db089934071355E5743bf21d60'
const alice = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const bob = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('uses a scoped node filter and cleans it up', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/Actions\.event\.createFilter/)
  expect(source).toMatch(/createFilter[\s\S]*?address\s*:/)
  expect(source).toMatch(/Actions\.filter\.getChanges/)
  expect(source).toMatch(/Actions\.filter\.uninstall/)
  expect(source).toMatch(/Actions\.address\.stopImpersonating/)
}, 60_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('collects both transfers and uninstalls the filter', async () => {
  const [aliceUsdc_before, aliceWeth_before, bobUsdc_before] =
    await Promise.all([
      Actions.token.getBalance(client, { account: alice, token }),
      Actions.token.getBalance(client, { account: alice, token: weth }),
      Actions.token.getBalance(client, { account: bob, token }),
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
    { from: whale.toLowerCase(), to: alice.toLowerCase(), value: 1_230_000n },
    { from: whale.toLowerCase(), to: bob.toLowerCase(), value: 45_000_000n },
  ])
  const [aliceUsdc_after, aliceWeth_after, bobUsdc_after] = await Promise.all([
    Actions.token.getBalance(client, { account: alice, token }),
    Actions.token.getBalance(client, { account: alice, token: weth }),
    Actions.token.getBalance(client, { account: bob, token }),
  ])
  expect(aliceUsdc_after.amount - aliceUsdc_before.amount).toBe(1_230_000n)
  expect(aliceWeth_after.amount - aliceWeth_before.amount).toBe(999n)
  expect(bobUsdc_after.amount - bobUsdc_before.amount).toBe(45_000_000n)
}, 120_000)
