import type { TransactionReceipt, TransactionRequest } from 'ox'
import { z } from 'ox/zod'
import { expectTypeOf, test } from 'vitest'

import { Chain, Client, http, walletActions } from 'viem'
import type { sendSync } from './sendSync.js'

test('default: request input is the ox default', () => {
  expectTypeOf<sendSync.Options>().toMatchTypeOf<TransactionRequest.toRpc.Input>()
})

test('return type is a transaction receipt', () => {
  expectTypeOf<sendSync.ReturnType>().toEqualTypeOf<TransactionReceipt.TransactionReceipt>()
})

// A chain whose request codec accepts a custom input field.
const chain = Chain.from({
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://eth.merkle.io'] } },
  schema: {
    transactionRequest: {
      toRpc: z.codec(z.any(), z.object({ custom: z.string() }), {
        decode: () => ({ custom: '' }),
        encode: () => ({}) as TransactionRequest.Rpc,
      }),
    },
  },
})

test('chain schema: Options use z.output of the request codec', () => {
  expectTypeOf<sendSync.Options<typeof chain>>().toMatchTypeOf<{
    custom: string
  }>()
})

test('decorator: custom request field threads through walletActions', () => {
  const decorated = Client.create({ chain, transport: http() }).extend(
    walletActions(),
  )
  expectTypeOf(decorated.transaction.sendSync)
    .parameter(0)
    .toMatchTypeOf<{ custom: string }>()
})
