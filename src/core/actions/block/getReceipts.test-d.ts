import { TransactionReceipt } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Actions, Chain, Client, http, publicActions } from 'viem'
const client = Client.create({ transport: http() })

test('default: returns an array of transaction receipts', async () => {
  const receipts = await Actions.block.getReceipts(client, {
    blockNumber: 69420n,
  })
  expectTypeOf(receipts).toEqualTypeOf<
    TransactionReceipt.TransactionReceipt[]
  >()
})

test('chain codecs: returns the transaction receipt converter output', async () => {
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

  const receipts = await Actions.block.getReceipts(schemaClient, {
    blockNumber: 69420n,
  })
  expectTypeOf(receipts).toEqualTypeOf<
    TransactionReceipt.TransactionReceipt[]
  >()
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

  const receipts = await decorated.block.getReceipts({ blockNumber: 69420n })
  expectTypeOf(receipts[0]!.custom).toEqualTypeOf<'hello'>()
})
