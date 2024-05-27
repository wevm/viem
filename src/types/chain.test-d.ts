import { expectTypeOf, test } from 'vitest'

import type { base } from '~viem/chains/index.js'
import type { celo } from '../chains/definitions/celo.js'
import type { mainnet } from '../chains/definitions/mainnet.js'
import type { optimism } from '../chains/definitions/optimism.js'
import type {
  Chain,
  DeriveChain,
  ExtractChainFormatterParameters,
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

  type Result2 = ExtractChainFormatterParameters<
    typeof base,
    'transactionRequest',
    TransactionRequest
  >

  type Result3 = ExtractChainFormatterParameters<
    typeof celo,
    'transactionRequest',
    TransactionRequest
  >
})
