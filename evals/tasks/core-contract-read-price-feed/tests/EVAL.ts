import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, expectTypeOf, test } from 'vitest'
import { getLatestRound } from '../src/index.ts'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 60_000)

test(
  'reads the ETH/USD round at the pinned block',
  async () => {
    const round = await getLatestRound(client, {
      feed: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    })

    expectTypeOf(round.answer).toEqualTypeOf<bigint>()
    expectTypeOf(round.answeredInRound).toEqualTypeOf<bigint>()
    expectTypeOf(round.roundId).toEqualTypeOf<bigint>()
    expectTypeOf(round.startedAt).toEqualTypeOf<bigint>()
    expectTypeOf(round.updatedAt).toEqualTypeOf<bigint>()
    expect(round).toEqual({
      answer: 308_421_532_390n,
      answeredInRound: 129_127_208_515_966_883_551n,
      roundId: 129_127_208_515_966_883_551n,
      startedAt: 1_765_583_800n,
      updatedAt: 1_765_583_819n,
    })
  },
  { retry: 2, timeout: 60_000 },
)

test(
  'reads a second feed at a different address',
  async () => {
    await expect(
      getLatestRound(client, {
        feed: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
      }),
    ).resolves.toEqual({
      answer: 9_038_468_000_000n,
      answeredInRound: 129_127_208_515_966_876_453n,
      roundId: 129_127_208_515_966_876_453n,
      startedAt: 1_765_581_510n,
      updatedAt: 1_765_581_527n,
    })
  },
  { retry: 2, timeout: 60_000 },
)
