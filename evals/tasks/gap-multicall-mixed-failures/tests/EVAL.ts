import { readFileSync } from 'node:fs'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const weth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
// Binance 14 hot wallet (holds USDC + WETH at the pinned fork block).
const holder = '0x28C6c06298d514Db089934071355E5743bf21d60'
// Multicall3: a contract with no `balanceOf` (unknown selector reverts).
const nonToken = '0xcA11bde05977b3631167028862bE2a173976CA11'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('uses a failure-tolerant multicall', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/batch\s*:\s*\{\s*multicall\s*:\s*true\s*\}/)
  expect(source).toMatch(/Promise\.allSettled/)
  expect(source).toMatch(/Actions\.token\.getBalance/)
}, 60_000)

test('takes no inputs', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('mixed batch: per-call statuses, correct values, order preserved', async () => {
  const [expectedUsdc, expectedWeth] = await Promise.all([
    Actions.token.getBalance(client, { account: holder, token: usdc }),
    Actions.token.getBalance(client, { account: holder, token: weth }),
  ])
  expect(expectedUsdc.amount).toBeGreaterThan(0n)

  // The bad entry is a deployed contract whose balance read reverts.
  expect(await Actions.address.getCode(client, { address: nonToken })).not.toBe(
    '0x',
  )
  await expect(
    Actions.token.getBalance(client, { account: holder, token: nonToken }),
  ).rejects.toThrow()

  const results = await example()

  expect(results).toHaveLength(3)
  expect(results[0]).toEqual({ status: 'fulfilled', value: expectedUsdc })
  expect(results[1]?.status).toBe('rejected')
  if (results[1]?.status !== 'rejected')
    throw new Error('expected the non-token read to fail')
  expect(results[1].reason).toBeInstanceOf(Error)
  expect(results[2]).toEqual({ status: 'fulfilled', value: expectedWeth })
}, 60_000)
