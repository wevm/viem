import { publicClient } from '../../_test/utils.js'
import type { Hash, Hex } from '../../types/misc.js'
import type { Transaction } from '../../types/transaction.js'
import { getBlock } from './getBlock.js'
import { expectTypeOf, test } from 'vitest'

test('includeTransactions = false', async () => {
  const block_1 = await getBlock(publicClient)
  expectTypeOf(block_1.transactions).toEqualTypeOf<Hash[]>()

  const block_2 = await getBlock(publicClient, { includeTransactions: false })
  expectTypeOf(block_2.transactions).toEqualTypeOf<Hash[]>()
})

test('includeTransactions = true', async () => {
  const block = await getBlock(publicClient, { includeTransactions: true })
  expectTypeOf(block.transactions).toEqualTypeOf<
    Transaction<bigint, number, false>[]
  >()
})

test('blockTag = "latest" & includeTransactions = true', async () => {
  const block = await getBlock(publicClient, { includeTransactions: true })
  expectTypeOf(block.transactions[0].blockHash).toEqualTypeOf<Hex>()
  expectTypeOf(block.transactions[0].blockNumber).toEqualTypeOf<bigint>()
  expectTypeOf(block.transactions[0].transactionIndex).toEqualTypeOf<number>()
})

test('blockTag = "pending" & includeTransactions = true', async () => {
  const block = await getBlock(publicClient, {
    blockTag: 'pending',
    includeTransactions: true,
  })
  expectTypeOf(block.transactions).toEqualTypeOf<
    Transaction<bigint, number, true>[]
  >()
  expectTypeOf(block.transactions[0].blockHash).toEqualTypeOf<null>()
  expectTypeOf(block.transactions[0].blockNumber).toEqualTypeOf<null>()
  expectTypeOf(block.transactions[0].transactionIndex).toEqualTypeOf<null>()
})
