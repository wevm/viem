import { expectTypeOf, test } from 'vitest'

import type { mainnet } from '../chains/definitions/mainnet.js'
import type { optimism } from '../chains/definitions/optimism.js'
import type {
  Chain,
  DeriveChain,
  ExtractChainFormatterExclude,
  ExtractChainFormatterParameters,
  ExtractChainFormatterReturnType,
  GetChainParameter,
} from './chain.js'

test('ExtractChainFormatterExclude', () => {
  type Result = ExtractChainFormatterExclude<
    typeof optimism,
    'transactionReceipt'
  >
})

test('ExtractChainFormatterParameters', () => {
  type Result = ExtractChainFormatterParameters<
    typeof mainnet,
    'transactionReceipt',
    unknown
  >
  expectTypeOf<Result>().toEqualTypeOf<unknown>()

  type Result2 = ExtractChainFormatterParameters<
    typeof optimism,
    'transactionReceipt',
    unknown
  >
  expectTypeOf<Result2>().not.toEqualTypeOf<unknown>()
})

test('ExtractChainFormatterReturnType', () => {
  type Result = ExtractChainFormatterReturnType<
    typeof mainnet,
    'transactionReceipt',
    unknown
  >
  expectTypeOf<Result>().toEqualTypeOf<unknown>()

  type Result2 = ExtractChainFormatterReturnType<
    typeof optimism,
    'transactionReceipt',
    unknown
  >
  expectTypeOf<Result2>().not.toEqualTypeOf<unknown>()
})

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

test('GetChainParameter', () => {
  type Result = GetChainParameter<Chain | undefined, Chain | undefined>
  expectTypeOf<Result>().toEqualTypeOf<{ chain: Chain | null | undefined }>()

  type Result2 = GetChainParameter<Chain, Chain | undefined>
  expectTypeOf<Result2>().toEqualTypeOf<{ chain?: Chain | null | undefined }>()

  type Result3 = GetChainParameter<Chain | undefined, Chain>
  expectTypeOf<Result3>().toEqualTypeOf<{ chain: Chain | null }>()

  type Result4 = GetChainParameter<undefined, Chain>
  expectTypeOf<Result4>().toEqualTypeOf<{ chain: Chain | null }>()

  type Result5 = GetChainParameter<Chain, undefined>
  expectTypeOf<Result5>().toEqualTypeOf<{ chain?: undefined | null }>()

  type Result6 = GetChainParameter<typeof mainnet, undefined>
  expectTypeOf<Result6>().toEqualTypeOf<{ chain?: undefined | null }>()

  type Result7 = GetChainParameter<typeof mainnet, typeof optimism>
  expectTypeOf<Result7>().toEqualTypeOf<{
    chain?: typeof optimism | undefined | null
  }>()
})
