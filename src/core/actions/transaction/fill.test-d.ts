import type * as TransactionRequest from 'ox/TransactionRequest'
import { z } from 'ox/zod'
import { expectTypeOf, test } from 'vitest'

import { Chain, Client, http, publicActions, walletActions } from 'viem'
import type { fill } from './fill.js'

test('default: request input is the ox default', () => {
  expectTypeOf<
    Chain.ExtractTransactionRequest<undefined>
  >().toEqualTypeOf<TransactionRequest.toRpc.Input>()
  expectTypeOf<fill.Options>().toMatchTypeOf<TransactionRequest.toRpc.Input>()
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
  expectTypeOf<Chain.ExtractTransactionRequest<typeof chain>>().toEqualTypeOf<{
    custom: string
  }>()
  expectTypeOf<fill.Options<typeof chain>>().toMatchTypeOf<{
    custom: string
  }>()
})

test('decorator: custom request field threads through publicActions', () => {
  const decorated = Client.create({ chain, transport: http() }).extend(
    publicActions(),
  )
  expectTypeOf(decorated.transaction.fill)
    .parameter(0)
    .toMatchTypeOf<{ custom: string }>()
})

test('decorator: custom request field threads through walletActions', () => {
  const decorated = Client.create({ chain, transport: http() }).extend(
    walletActions(),
  )
  expectTypeOf(decorated.transaction.fill)
    .parameter(0)
    .toMatchTypeOf<{ custom: string }>()
})
