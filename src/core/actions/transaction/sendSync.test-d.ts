import type { TransactionReceipt, TransactionRequest } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Chain, Client, http, walletActions } from 'viem'
import type { sendSync } from './sendSync.js'

test('default: request input is the ox default', () => {
  expectTypeOf<sendSync.Options>().toMatchTypeOf<TransactionRequest.toRpc.Input>()
})

test('return type is a transaction receipt', () => {
  expectTypeOf<sendSync.ReturnType>().toEqualTypeOf<TransactionReceipt.TransactionReceipt>()
})

// A chain whose request converter accepts a custom input field.
const chain = Chain.from({
  id: 1,
  name: 'Ethereum',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { http: 'https://eth.merkle.io' },
  codecs: {
    transactionRequest: {
      toRpc: (_request: { custom: string }): TransactionRequest.Rpc => ({}),
    },
  },
})

test("chain codecs: Options use the converter's native request type", () => {
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
