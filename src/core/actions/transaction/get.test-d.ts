import { Transaction, type Hex } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Actions, Chain, Client, http, publicActions } from 'viem'
const client = Client.create({ transport: http() })

test('default: returns a transaction object', async () => {
  const transaction = await Actions.transaction.get(client, { hash: '0x' })
  expectTypeOf(transaction).toEqualTypeOf<Transaction.Transaction<false>>()
  expectTypeOf(transaction.hash).toEqualTypeOf<Hex.Hex>()
})

test("blockTag 'pending': threads pending into the transaction type", async () => {
  const transaction = await Actions.transaction.get(client, {
    blockTag: 'pending',
    index: 0,
  })
  expectTypeOf(transaction).toEqualTypeOf<Transaction.Transaction<true>>()
})

test('chain codecs: returns the transaction converter output', async () => {
  const chain = Chain.from({
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://eth.merkle.io'] } },
    codecs: {
      transaction: {
        fromRpc: (rpc: Transaction.Rpc): Transaction.Transaction =>
          Transaction.fromRpc(rpc),
      },
    },
  })
  const schemaClient = Client.create({ chain, transport: http() })

  const transaction = await Actions.transaction.get(schemaClient, {
    hash: '0x',
  })
  expectTypeOf(transaction).toEqualTypeOf<Transaction.Transaction>()
})

test('chain codecs: infers custom properties from a transform', async () => {
  const chain = Chain.from({
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://eth.merkle.io'] } },
    codecs: {
      transaction: {
        fromRpc: (rpc: Transaction.Rpc) => ({
          ...Transaction.fromRpc(rpc),
          custom: 'hello' as const,
        }),
      },
    },
  })
  const schemaClient = Client.create({ chain, transport: http() })

  const transaction = await Actions.transaction.get(schemaClient, {
    hash: '0x',
  })
  expectTypeOf(transaction.custom).toEqualTypeOf<'hello'>()
})

test('decorator: threads custom chain properties through publicActions', async () => {
  const chain = Chain.from({
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://eth.merkle.io'] } },
    codecs: {
      transaction: {
        fromRpc: (rpc: Transaction.Rpc) => ({
          ...Transaction.fromRpc(rpc),
          custom: 'hello' as const,
        }),
      },
    },
  })
  const decorated = Client.create({ chain, transport: http() }).extend(
    publicActions(),
  )

  const transaction = await decorated.transaction.get({ hash: '0x' })
  expectTypeOf(transaction.custom).toEqualTypeOf<'hello'>()
})
