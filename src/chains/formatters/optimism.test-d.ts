import { describe, expectTypeOf, test } from 'vitest'

import { getBlock } from '../../actions/public/getBlock.js'
import { getTransaction } from '../../actions/public/getTransaction.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { http } from '../../clients/transports/http.js'
import type { RpcBlock, RpcTransaction } from '../../types/rpc.js'
import type { Transaction } from '../../types/transaction.js'
import { optimism } from '../index.js'
import {
  type DepositTransaction,
  type RpcDepositTransaction,
  optimismFormatters,
} from './optimism.js'

describe('block', () => {
  expectTypeOf(optimismFormatters.block.format).parameter(0).toEqualTypeOf<
    Partial<RpcBlock> & {
      transactions: `0x${string}`[] | (RpcTransaction | RpcDepositTransaction)[]
    }
  >()
})

describe('transaction', () => {
  expectTypeOf<
    ReturnType<typeof optimismFormatters.transaction.format>['sourceHash']
  >().toEqualTypeOf<`0x${string}` | undefined>()
  expectTypeOf<
    ReturnType<typeof optimismFormatters.transaction.format>['mint']
  >().toEqualTypeOf<bigint | undefined>()
  expectTypeOf<
    ReturnType<typeof optimismFormatters.transaction.format>['isSystemTx']
  >().toEqualTypeOf<boolean | undefined>()
})

describe('smoke', () => {
  test('block', async () => {
    const client = createPublicClient({
      chain: optimism,
      transport: http(),
    })
    const block = await getBlock(client, {
      blockNumber: 16645775n,
      includeTransactions: true,
    })

    expectTypeOf(block.transactions).toEqualTypeOf<
      `0x${string}`[] | (Transaction | DepositTransaction)[]
    >()
  })

  test('transaction', async () => {
    const client = createPublicClient({
      chain: optimism,
      transport: http(),
    })

    const transaction = await getTransaction(client, {
      blockNumber: 16628100n,
      index: 0,
    })

    expectTypeOf(transaction.type).toEqualTypeOf<
      'legacy' | 'eip2930' | 'eip1559' | 'deposit'
    >()
    expectTypeOf(
      transaction.type === 'deposit' && transaction.isSystemTx,
    ).toEqualTypeOf<boolean | undefined>()
    expectTypeOf(
      transaction.type === 'deposit' && transaction.sourceHash,
    ).toEqualTypeOf<false | `0x${string}`>()
    expectTypeOf(
      transaction.type === 'deposit' && transaction.mint,
    ).toEqualTypeOf<false | undefined | bigint>()
    expectTypeOf(
      transaction.type === 'eip1559' && transaction.isSystemTx,
    ).toEqualTypeOf<false | undefined>()
    expectTypeOf(
      transaction.type === 'eip1559' && transaction.sourceHash,
    ).toEqualTypeOf<false | undefined>()
    expectTypeOf(
      transaction.type === 'eip1559' && transaction.mint,
    ).toEqualTypeOf<false | undefined>()
  })
})
