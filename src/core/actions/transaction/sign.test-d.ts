import type * as Hex from 'ox/Hex'
import type * as TransactionRequest from 'ox/TransactionRequest'
import { z } from 'ox/zod'
import { expectTypeOf, test } from 'vitest'

import { Chain, Client, http, walletActions } from 'viem'
import type { sign } from './sign.js'

test('default: request input is the ox default', () => {
  expectTypeOf<sign.Options>().toMatchTypeOf<TransactionRequest.toRpc.Input>()
})

test('return type is Hex', () => {
  expectTypeOf<sign.ReturnType>().toEqualTypeOf<Hex.Hex>()
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
  expectTypeOf<sign.Options<typeof chain>>().toMatchTypeOf<{
    custom: string
  }>()
})

test('decorator: custom request field threads through walletActions', () => {
  const decorated = Client.create({ chain, transport: http() }).extend(
    walletActions(),
  )
  expectTypeOf(decorated.transaction.sign)
    .parameter(0)
    .toMatchTypeOf<{ custom: string }>()
})
