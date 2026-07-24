import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { client, getPoolState } from '../src/index.ts'

const wethUsdc500 = '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640'
const wethUsdc3000 = '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8'

test('uses concurrent multicall batching', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/batch\s*:\s*\{[^}]*multicall/s)
  expect(source).toMatch(/Promise\.all\(/)
}, 60_000)

test('reads the WETH/USDC 0.05% pool state', async () => {
  const state = await getPoolState(client, { pool: wethUsdc500 })

  expectTypeOf(state.feeGrowthGlobal0X128).toEqualTypeOf<bigint>()
  expectTypeOf(state.liquidity).toEqualTypeOf<bigint>()
  expectTypeOf(state.sqrtPriceX96).toEqualTypeOf<bigint>()
  expectTypeOf(state.tick).toEqualTypeOf<number>()
  expectTypeOf(state.unlocked).toEqualTypeOf<boolean>()
  expect(state).toEqual({
    feeGrowthGlobal0X128: 4_497_333_906_105_495_928_827_471_777_501_048n,
    liquidity: 1_208_986_767_454_552_710n,
    sqrtPriceX96: 1_424_397_008_595_664_404_064_310_177_661_188n,
    tick: 195_948,
    unlocked: true,
  })
}, 60_000)

test('reads a second pool at a different address', async () => {
  await expect(getPoolState(client, { pool: wethUsdc3000 })).resolves.toEqual({
    feeGrowthGlobal0X128: 5_458_102_078_759_698_048_246_564_033_698_016n,
    liquidity: 1_700_947_346_421_962_359n,
    sqrtPriceX96: 1_425_752_930_643_034_588_187_851_354_524_375n,
    tick: 195_967,
    unlocked: true,
  })
}, 60_000)
