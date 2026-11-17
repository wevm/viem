import { TransactionReceipt } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Actions, Chain, Client, http, publicActions } from 'viem'
const client = Client.create({ transport: http() })

test('default: returns a transaction receipt object', async () => {
  const receipt = await Actions.transaction.getReceipt(client, { hash: '0x' })
  expectTypeOf(receipt).toEqualTypeOf<TransactionReceipt.TransactionReceipt>()
})

test('chain codecs: returns the receipt converter output', async () => {
  const chain = Chain.from({
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { http: 'https://eth.merkle.io' },
    codecs: {
      transactionReceipt: {
        fromRpc: (
          rpc: TransactionReceipt.Rpc,
        ): TransactionReceipt.TransactionReceipt =>
          TransactionReceipt.fromRpc(rpc),
      },
    },
  })
  const schemaClient = Client.create({ chain, transport: http() })

  const receipt = await Actions.transaction.getReceipt(schemaClient, {
    hash: '0x',
  })
  expectTypeOf(receipt).toEqualTypeOf<TransactionReceipt.TransactionReceipt>()
})

test('chain codecs: infers custom properties from a converter', async () => {
  const chain = Chain.from({
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { http: 'https://eth.merkle.io' },
    codecs: {
      transactionReceipt: {
        fromRpc: (rpc: TransactionReceipt.Rpc) => ({
          ...TransactionReceipt.fromRpc(rpc),
          custom: 'hello' as const,
        }),
      },
    },
  })
  const schemaClient = Client.create({ chain, transport: http() })

  const receipt = await Actions.transaction.getReceipt(schemaClient, {
    hash: '0x',
  })
  expectTypeOf(receipt.custom).toEqualTypeOf<'hello'>()
})

test('decorator: threads custom chain properties through publicActions', async () => {
  const chain = Chain.from({
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { http: 'https://eth.merkle.io' },
    codecs: {
      transactionReceipt: {
        fromRpc: (rpc: TransactionReceipt.Rpc) => ({
          ...TransactionReceipt.fromRpc(rpc),
          custom: 'hello' as const,
        }),
      },
    },
  })
  const decorated = Client.create({ chain, transport: http() }).extend(
    publicActions(),
  )

  const receipt = await decorated.transaction.getReceipt({ hash: '0x' })
  expectTypeOf(receipt.custom).toEqualTypeOf<'hello'>()
})
