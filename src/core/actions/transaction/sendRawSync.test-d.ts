import type * as TransactionReceipt from 'ox/TransactionReceipt'
import { z } from 'ox/zod'
import { expectTypeOf, test } from 'vitest'

import { Actions, Chain, Client, http, walletActions } from 'viem'

test('return type is a transaction receipt', () => {
  expectTypeOf<Actions.transaction.sendRawSync.ReturnType>().toEqualTypeOf<TransactionReceipt.TransactionReceipt>()
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
  const decorated = Client.create({ chain, transport: http() }).extend(
    walletActions(),
  )

  const receipt = await decorated.transaction.sendRawSync({
    transaction: '0x',
  })
  expectTypeOf(receipt).toEqualTypeOf<
    z.output<typeof z.TransactionReceipt.TransactionReceipt>
  >()
})
