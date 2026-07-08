import type { TransactionReceipt } from 'ox'
import { z } from 'ox/zod'
import { expectTypeOf, test } from 'vitest'

import { Actions, Chain, Client, http } from 'viem'
const client = Client.create({ transport: http() })

test('default: returns a bigint', async () => {
  const confirmations = await Actions.transaction.getConfirmations(client, {
    hash: '0x',
  })
  expectTypeOf(confirmations).toEqualTypeOf<bigint>()
})

test('default: accepts the ox receipt as transactionReceipt', async () => {
  const transactionReceipt = {} as TransactionReceipt.TransactionReceipt
  const confirmations = await Actions.transaction.getConfirmations(client, {
    transactionReceipt,
  })
  expectTypeOf(confirmations).toEqualTypeOf<bigint>()
})

test('chain schema: transactionReceipt option reflects the chain codec', async () => {
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

  const confirmations = await Actions.transaction.getConfirmations(
    schemaClient,
    {
      hash: '0x',
    },
  )
  expectTypeOf(confirmations).toEqualTypeOf<bigint>()
})
