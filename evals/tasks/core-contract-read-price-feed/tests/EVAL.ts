import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 60_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('reads both price-feed rounds at the pinned block', async () => {
  const { btcUsd, ethUsd } = await example()

  expect(ethUsd).toEqual({
    answer: 308_421_532_390n,
    answeredInRound: 129_127_208_515_966_883_551n,
    roundId: 129_127_208_515_966_883_551n,
    startedAt: 1_765_583_800n,
    updatedAt: 1_765_583_819n,
  })
  expect(btcUsd).toEqual({
    answer: 9_038_468_000_000n,
    answeredInRound: 129_127_208_515_966_876_453n,
    roundId: 129_127_208_515_966_876_453n,
    startedAt: 1_765_581_510n,
    updatedAt: 1_765_581_527n,
  })
}, 60_000)
