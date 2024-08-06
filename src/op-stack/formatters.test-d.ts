import { describe, expectTypeOf, test } from 'vitest'

import { getBlock } from '../actions/public/getBlock.js'
import { getTransaction } from '../actions/public/getTransaction.js'
import { getTransactionReceipt } from '../actions/public/getTransactionReceipt.js'
import { optimism } from '../chains/index.js'
import { createPublicClient } from '../clients/createPublicClient.js'
import { http } from '../clients/transports/http.js'
import type { Hash } from '../types/misc.js'
import { formatters } from './formatters.js'
import type { OpStackRpcBlock } from './types/block.js'

describe('block', () => {
  expectTypeOf(formatters.block.format)
    .parameter(0)
    .toEqualTypeOf<OpStackRpcBlock>()
})

describe('transaction', () => {
  expectTypeOf<
    ReturnType<typeof formatters.transaction.format>['sourceHash']
  >().toEqualTypeOf<`0x${string}` | undefined>()
  expectTypeOf<
    ReturnType<typeof formatters.transaction.format>['mint']
  >().toEqualTypeOf<bigint | undefined>()
  expectTypeOf<
    ReturnType<typeof formatters.transaction.format>['isSystemTx']
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
    })
    expectTypeOf(block.transactions).toEqualTypeOf<Hash[]>()

    const block_includeTransactions = await getBlock(client, {
      blockNumber: 16645775n,
      includeTransactions: true,
    })
    expectTypeOf(
      block_includeTransactions.transactions[0].sourceHash,
    ).toEqualTypeOf<`0x${string}` | undefined>()
    expectTypeOf(
      block_includeTransactions.transactions[0].type === 'deposit' &&
        block_includeTransactions.transactions[0].sourceHash,
    ).toEqualTypeOf<false | `0x${string}`>()
    expectTypeOf(
      block_includeTransactions.transactions[0].type === 'eip1559' &&
        block_includeTransactions.transactions[0].sourceHash,
    ).toEqualTypeOf<false | undefined>()
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
      'legacy' | 'eip2930' | 'eip1559' | 'eip4844' | 'eip7702' | 'deposit'
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

  test('transaction receipt', async () => {
    const client = createPublicClient({
      chain: optimism,
      transport: http(),
    })

    const transactionReceipt = await getTransactionReceipt(client, {
      hash: '0x',
    })

    expectTypeOf(transactionReceipt.l1Fee).toEqualTypeOf<bigint | null>()
    expectTypeOf(transactionReceipt.l1FeeScalar).toEqualTypeOf<number | null>()
    expectTypeOf(transactionReceipt.l1GasPrice).toEqualTypeOf<bigint | null>()
    expectTypeOf(transactionReceipt.l1GasUsed).toEqualTypeOf<bigint | null>()
  })
})
