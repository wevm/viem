import { expectTypeOf, test } from 'vitest'

import { mainnet } from '../chains/definitions/mainnet.js'
import { optimism } from '../chains/definitions/optimism.js'
import { type Chain, type DeriveChain } from './chain.js'

test('DeriveChain', () => {
  type Result = DeriveChain<Chain | undefined, Chain | undefined>
  expectTypeOf<Result>().toEqualTypeOf<Chain | undefined>()

  type Result2 = DeriveChain<typeof mainnet, Chain | undefined>
  expectTypeOf<Result2>().toEqualTypeOf<typeof mainnet | Chain>()

  type Result3 = DeriveChain<Chain | undefined, typeof mainnet>
  expectTypeOf<Result3>().toEqualTypeOf<typeof mainnet>()

  type Result4 = DeriveChain<typeof mainnet, typeof optimism>
  expectTypeOf<Result4>().toEqualTypeOf<typeof optimism>()

  type Result5 = DeriveChain<Chain | undefined, Chain>
  expectTypeOf<Result5>().toEqualTypeOf<Chain>()
})
