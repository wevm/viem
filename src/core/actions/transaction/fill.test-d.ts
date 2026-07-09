import type { TransactionRequest } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Chain, Client, http, publicActions, walletActions } from 'viem'
import type { fill } from './fill.js'

test('default: request input is the ox default', () => {
  expectTypeOf<
    Chain.ExtractTransactionRequest<undefined>
  >().toEqualTypeOf<TransactionRequest.toRpc.Input>()
  expectTypeOf<fill.Options>().toMatchTypeOf<TransactionRequest.toRpc.Input>()
})

// A chain whose request converter accepts a custom input field.
const chain = Chain.from({
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://eth.merkle.io'] } },
  schema: {
    transactionRequest: {
      toRpc: (_request: { custom: string }): TransactionRequest.Rpc => ({}),
    },
  },
})

test("chain schema: Options use the converter's native request type", () => {
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
