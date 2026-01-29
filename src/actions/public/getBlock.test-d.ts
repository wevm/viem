import { describe, expectTypeOf, test } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { optimism } from '../../chains/index.js'
import { http, createPublicClient } from '../../index.js'
import type { Hash, Hex } from '../../types/misc.js'
import type { Transaction } from '../../types/transaction.js'
import type { Prettify } from '../../types/utils.js'
import { getBlock } from './getBlock.js'

const client = anvilMainnet.getClient()

test('includeTransactions = false', async () => {
  const block_1 = await getBlock(client)
  expectTypeOf(block_1.transactions).toEqualTypeOf<Hash[]>()

  const block_2 = await getBlock(client, { includeTransactions: false })
  expectTypeOf(block_2.transactions).toEqualTypeOf<Hash[]>()
})

test('includeTransactions = true', async () => {
  const block = await getBlock(client, { includeTransactions: true })
  expectTypeOf(block.transactions).toEqualTypeOf<
    Prettify<Transaction<bigint, number, false>>[]
  >()
})

test('blockTag = "latest" & includeTransactions = true', async () => {
  const block = await getBlock(client, { includeTransactions: true })
  expectTypeOf(block.hash).toEqualTypeOf<Hex>()
  expectTypeOf(block.logsBloom).toEqualTypeOf<Hex>()
  expectTypeOf(block.nonce).toEqualTypeOf<Hex>()
  expectTypeOf(block.number).toEqualTypeOf<bigint>()
  expectTypeOf(block.transactions[0].blockHash).toEqualTypeOf<Hex>()
  expectTypeOf(block.transactions[0].blockNumber).toEqualTypeOf<bigint>()
  expectTypeOf(block.transactions[0].transactionIndex).toEqualTypeOf<number>()
})

test('blockTag = "pending" & includeTransactions = true', async () => {
  const block = await getBlock(client, {
    blockTag: 'pending',
    includeTransactions: true,
  })
  expectTypeOf(block.hash).toEqualTypeOf<null>()
  expectTypeOf(block.logsBloom).toEqualTypeOf<null>()
  expectTypeOf(block.nonce).toEqualTypeOf<null>()
  expectTypeOf(block.number).toEqualTypeOf<null>()
  expectTypeOf(block.transactions).toEqualTypeOf<
    Prettify<Transaction<bigint, number, true>>[]
  >()
  expectTypeOf(block.transactions[0].blockHash).toEqualTypeOf<null>()
  expectTypeOf(block.transactions[0].blockNumber).toEqualTypeOf<null>()
  expectTypeOf(block.transactions[0].transactionIndex).toEqualTypeOf<null>()
})

describe('chain w/ formatter', () => {
  const client = createPublicClient({
    chain: optimism,
    transport: http(),
  })

  test('blockTag = "latest" & includeTransactions = true', async () => {
    const block = await getBlock(client, { includeTransactions: true })
    expectTypeOf(block.hash).toEqualTypeOf<Hex>()
    expectTypeOf(block.logsBloom).toEqualTypeOf<Hex>()
    expectTypeOf(block.nonce).toEqualTypeOf<Hex>()
    expectTypeOf(block.number).toEqualTypeOf<bigint>()
    expectTypeOf(block.transactions[0].blockHash).toEqualTypeOf<Hex>()
    expectTypeOf(block.transactions[0].blockNumber).toEqualTypeOf<bigint>()
    expectTypeOf(block.transactions[0].transactionIndex).toEqualTypeOf<number>()
  })

  test('blockTag = "pending" & includeTransactions = true', async () => {
    const block = await getBlock(client, {
      blockTag: 'pending',
      includeTransactions: true,
    })
    expectTypeOf(block.hash).toEqualTypeOf<null>()
    expectTypeOf(block.logsBloom).toEqualTypeOf<null>()
    expectTypeOf(block.nonce).toEqualTypeOf<null>()
    expectTypeOf(block.number).toEqualTypeOf<null>()
    expectTypeOf(block.transactions[0].blockHash).toEqualTypeOf<null>()
    expectTypeOf(block.transactions[0].blockNumber).toEqualTypeOf<null>()
    expectTypeOf(block.transactions[0].transactionIndex).toEqualTypeOf<null>()
  })
})
