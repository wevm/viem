import type { Hex, TransactionRequest } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Chain, Client, http, walletActions } from 'viem'
import type { sign } from './sign.js'

test('default: request input is the ox default', () => {
  expectTypeOf<sign.Options>().toMatchTypeOf<TransactionRequest.toRpc.Input>()
})

test('return type is Hex', () => {
  expectTypeOf<sign.ReturnType>().toEqualTypeOf<Hex.Hex>()
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
