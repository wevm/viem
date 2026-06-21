import type * as Hex from 'ox/Hex'
import type * as Transaction from 'ox/Transaction'
import { z } from 'ox/zod'
import { expectTypeOf, test } from 'vitest'

import { Chain, Client, http, publicActions } from 'viem'

import { getTransaction } from './getTransaction.js'

const client = Client.create({ transport: http() })

test('default: returns a transaction object', async () => {
  const transaction = await getTransaction(client, { hash: '0x' })
  expectTypeOf(transaction).toEqualTypeOf<Transaction.Transaction<false>>()
  expectTypeOf(transaction.hash).toEqualTypeOf<Hex.Hex>()
})

test("blockTag 'pending': threads pending into the transaction type", async () => {
  const transaction = await getTransaction(client, {
    blockTag: 'pending',
    index: 0,
  })
  expectTypeOf(transaction).toEqualTypeOf<Transaction.Transaction<true>>()
})

test('chain schema: returns z.output of the transaction codec', async () => {
  const chain = Chain.from({
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://eth.merkle.io'] } },
    schema: { transaction: { fromRpc: z.Transaction.Transaction } },
  })
  const schemaClient = Client.create({ chain, transport: http() })

  const transaction = await getTransaction(schemaClient, { hash: '0x' })
  expectTypeOf(transaction).toEqualTypeOf<
    z.output<typeof z.Transaction.Transaction>
  >()
})

test('chain schema: infers custom properties from a transform', async () => {
  const chain = Chain.from({
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://eth.merkle.io'] } },
    schema: {
      transaction: {
        fromRpc: z.pipe(
          z.Transaction.Transaction,
          z.transform((transaction) => ({
            ...transaction,
            custom: 'hello' as const,
          })),
        ),
      },
    },
  })
  const schemaClient = Client.create({ chain, transport: http() })

  const transaction = await getTransaction(schemaClient, { hash: '0x' })
  expectTypeOf(transaction.custom).toEqualTypeOf<'hello'>()
})

test('decorator: threads custom chain properties through publicActions', async () => {
  const chain = Chain.from({
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://eth.merkle.io'] } },
    schema: {
      transaction: {
        fromRpc: z.pipe(
          z.Transaction.Transaction,
          z.transform((transaction) => ({
            ...transaction,
            custom: 'hello' as const,
          })),
        ),
      },
    },
  })
  const decorated = Client.create({ chain, transport: http() }).extend(
    publicActions(),
  )

  const transaction = await decorated.getTransaction({ hash: '0x' })
  expectTypeOf(transaction.custom).toEqualTypeOf<'hello'>()
})
