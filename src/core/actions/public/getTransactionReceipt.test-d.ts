import type * as TransactionReceipt from 'ox/TransactionReceipt'
import { z } from 'ox/zod'
import { expectTypeOf, test } from 'vitest'

import { Chain, Client, http, publicActions } from 'viem'

import { getTransactionReceipt } from './getTransactionReceipt.js'

const client = Client.create({ transport: http() })

test('default: returns a transaction receipt object', async () => {
  const receipt = await getTransactionReceipt(client, { hash: '0x' })
  expectTypeOf(receipt).toEqualTypeOf<TransactionReceipt.TransactionReceipt>()
})

test('chain schema: returns z.output of the transaction receipt codec', async () => {
  const chain = Chain.from({
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://eth.merkle.io'] } },
    schema: {
      transactionReceipt: { fromRpc: z.TransactionReceipt.TransactionReceipt },
    },
  })
  const schemaClient = Client.create({ chain, transport: http() })

  const receipt = await getTransactionReceipt(schemaClient, { hash: '0x' })
  expectTypeOf(receipt).toEqualTypeOf<
    z.output<typeof z.TransactionReceipt.TransactionReceipt>
  >()
})

test('chain schema: infers custom properties from a transform', async () => {
  const chain = Chain.from({
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://eth.merkle.io'] } },
    schema: {
      transactionReceipt: {
        fromRpc: z.pipe(
          z.TransactionReceipt.TransactionReceipt,
          z.transform((receipt) => ({ ...receipt, custom: 'hello' as const })),
        ),
      },
    },
  })
  const schemaClient = Client.create({ chain, transport: http() })

  const receipt = await getTransactionReceipt(schemaClient, { hash: '0x' })
  expectTypeOf(receipt.custom).toEqualTypeOf<'hello'>()
})

test('decorator: threads custom chain properties through publicActions', async () => {
  const chain = Chain.from({
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://eth.merkle.io'] } },
    schema: {
      transactionReceipt: {
        fromRpc: z.pipe(
          z.TransactionReceipt.TransactionReceipt,
          z.transform((receipt) => ({ ...receipt, custom: 'hello' as const })),
        ),
      },
    },
  })
  const decorated = Client.create({ chain, transport: http() }).extend(
    publicActions(),
  )

  const receipt = await decorated.getTransactionReceipt({ hash: '0x' })
  expectTypeOf(receipt.custom).toEqualTypeOf<'hello'>()
})
