import type { Hex } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Chain } from 'viem'
import {
  Block,
  chainConfig,
  Transaction,
  TransactionReceipt,
} from 'viem/op-stack'

const chain = Chain.from({
  ...chainConfig,
  id: 10,
  name: 'OP Mainnet',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: { default: { http: ['https://mainnet.optimism.io'] } },
})

test('block codec', () => {
  expectTypeOf<Chain.ExtractBlock<typeof chain>>().toMatchTypeOf<Block.Block>()
})

test('transaction codec', () => {
  type Result = Chain.ExtractTransaction<typeof chain>
  type Deposit = Extract<Result, { type: 'deposit' }>

  expectTypeOf<Result>().toMatchTypeOf<Transaction.Transaction>()
  expectTypeOf<Deposit['sourceHash']>().toEqualTypeOf<Hex.Hex>()
  expectTypeOf<Deposit['mint']>().toEqualTypeOf<bigint | undefined>()
})

test('transaction receipt codec', () => {
  type Receipt = Chain.ExtractTransactionReceipt<typeof chain>

  expectTypeOf<Receipt>().toMatchTypeOf<TransactionReceipt.TransactionReceipt>()
  expectTypeOf<Receipt['daFootprintGasScalar']>().toEqualTypeOf<bigint | null>()
  expectTypeOf<Receipt['l1BlobBaseFee']>().toEqualTypeOf<bigint | null>()
  expectTypeOf<Receipt['operatorFeeScalar']>().toEqualTypeOf<bigint | null>()
})

test('transaction serializer', () => {
  expectTypeOf(chain.transaction.serialize).returns.toEqualTypeOf<
    Hex.Hex | undefined
  >()
})
