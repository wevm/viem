import { publicClient } from '../../_test/utils.js'
import type { Hex } from '../../types/misc.js'
import { getTransaction } from './getTransaction.js'
import { expectTypeOf, test } from 'vitest'

test('blockTag = "latest"', async () => {
  const transaction = await getTransaction(publicClient, {
    hash: '0x',
  })
  expectTypeOf(transaction.blockHash).toEqualTypeOf<Hex>()
  expectTypeOf(transaction.blockNumber).toEqualTypeOf<bigint>()
  expectTypeOf(transaction.transactionIndex).toEqualTypeOf<number>()
})

test('blockTag = "pending"', async () => {
  const transaction = await getTransaction(publicClient, {
    blockTag: 'pending',
    index: 0,
  })
  expectTypeOf(transaction.blockHash).toEqualTypeOf<null>()
  expectTypeOf(transaction.blockNumber).toEqualTypeOf<null>()
  expectTypeOf(transaction.transactionIndex).toEqualTypeOf<null>()
})
