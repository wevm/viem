import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

test('uses concurrent multicall batching', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/batch\s*:\s*\{[^}]*multicall/s)
  expect(source).toMatch(/Promise\.all\(/)
  expect(source.match(/Actions\.contract\.read\s*\(/g)).toHaveLength(3)
}, 60_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('reads the WETH/USDC 0.05% pool state', async () => {
  const state = await example()

  expect(state).toEqual({
    feeGrowthGlobal0X128: 4_497_333_906_105_495_928_827_471_777_501_048n,
    liquidity: 1_208_986_767_454_552_710n,
    sqrtPriceX96: 1_424_397_008_595_664_404_064_310_177_661_188n,
    tick: 195_948,
    unlocked: true,
  })
}, 60_000)
