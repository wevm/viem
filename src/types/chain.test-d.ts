import { expectTypeOf, test } from 'vitest'

import type { base } from '~viem/chains/index.js'
import type { celo } from '../chains/definitions/celo.js'
import type { mainnet } from '../chains/definitions/mainnet.js'
import type { optimism } from '../chains/definitions/optimism.js'
import type {
  Chain,
  DeriveChain,
  ExtractChainFormatterParameters,
  GetChainParameter,
} from './chain.js'
import type { TransactionRequest } from './transaction.js'

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

test('ExtractChainFormatterParameters', () => {
  type Result = ExtractChainFormatterParameters<
    typeof mainnet,
    'transactionRequest',
    TransactionRequest
  >
  expectTypeOf<Result['type']>().toEqualTypeOf<
    'legacy' | 'eip2930' | 'eip1559' | 'eip4844' | 'eip7702' | undefined
  >()

  type Result2 = ExtractChainFormatterParameters<
    typeof base,
    'transactionRequest',
    TransactionRequest
  >
  expectTypeOf<Result2['type']>().toEqualTypeOf<
    'legacy' | 'eip2930' | 'eip1559' | 'eip4844' | 'eip7702' | undefined
  >()

  type Result3 = ExtractChainFormatterParameters<
    typeof celo,
    'transactionRequest',
    TransactionRequest
  >
  expectTypeOf<Result3['type']>().toEqualTypeOf<
    | 'legacy'
    | 'eip2930'
    | 'eip1559'
    | 'eip4844'
    | 'eip7702'
    | 'cip64'
    | undefined
  >()
  expectTypeOf<Result3['feeCurrency']>().toEqualTypeOf<
    `0x${string}` | undefined
  >()

  type Result4 = ExtractChainFormatterParameters<
    typeof celo,
    'transaction',
    TransactionRequest
  >
  expectTypeOf<Result4['gatewayFee']>().toEqualTypeOf<
    `0x${string}` | null | undefined
  >()
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
