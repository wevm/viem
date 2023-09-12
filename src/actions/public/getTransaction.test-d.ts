import { describe, expectTypeOf, test } from 'vitest'

import { publicClient } from '~test/src/utils.js'
import { optimism } from '../../chains/index.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { http } from '../../clients/transports/http.js'
import type { Hex } from '../../types/misc.js'
import { getTransaction } from './getTransaction.js'

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

describe('chain w/ formatter', () => {
  const client = createPublicClient({
    chain: optimism,
    transport: http(),
  })

  test('blockTag = "latest"', async () => {
    const transaction = await getTransaction(client, {
      hash: '0x',
    })
    expectTypeOf(transaction.blockHash).toEqualTypeOf<Hex>()
    expectTypeOf(transaction.blockNumber).toEqualTypeOf<bigint>()
    expectTypeOf(transaction.transactionIndex).toEqualTypeOf<number>()
  })

  test('blockTag = "pending"', async () => {
    const transaction = await getTransaction(client, {
      blockTag: 'pending',
      index: 0,
    })
    expectTypeOf(transaction.blockHash).toEqualTypeOf<null>()
    expectTypeOf(transaction.blockNumber).toEqualTypeOf<null>()
    expectTypeOf(transaction.transactionIndex).toEqualTypeOf<null>()
  })
})
