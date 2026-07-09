import type { Hex, TransactionRequest } from 'ox'
import { expectTypeOf, test } from 'vitest'

import { Chain, Client, http, walletActions } from 'viem'
import type { send } from './send.js'

test('default: request input is the ox default', () => {
  expectTypeOf<send.Options>().toMatchTypeOf<TransactionRequest.toRpc.Input>()
})

test('return type is Hex', () => {
  expectTypeOf<send.ReturnType>().toEqualTypeOf<Hex.Hex>()
})

test('client dataSuffix accepts object format', () => {
  Client.create({
    dataSuffix: { required: true, value: '0x1234' },
    transport: http(),
  })
})

const request = {
  to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
} as const

test('type: legacy', () => {
  expectTypeOf({ ...request, gasPrice: 0n }).toMatchTypeOf<send.Options>()

  expectTypeOf({
    ...request,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  }).not.toMatchTypeOf<send.Options>()

  expectTypeOf({
    ...request,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  }).not.toMatchTypeOf<send.Options>()

  expectTypeOf({
    ...request,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  }).not.toMatchTypeOf<send.Options>()
})

test('type: eip1559', () => {
  expectTypeOf({
    ...request,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  }).toMatchTypeOf<send.Options>()

  expectTypeOf({
    ...request,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  }).not.toMatchTypeOf<send.Options>()

  expectTypeOf({
    ...request,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip1559',
  }).not.toMatchTypeOf<send.Options>()

  expectTypeOf({
    ...request,
    gasPrice: 0n,
    type: 'eip1559',
  }).not.toMatchTypeOf<send.Options>()
})

test('type: eip2930', () => {
  expectTypeOf({ ...request, gasPrice: 0n }).toMatchTypeOf<send.Options>()

  expectTypeOf({
    ...request,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  }).not.toMatchTypeOf<send.Options>()

  expectTypeOf({
    ...request,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  }).not.toMatchTypeOf<send.Options>()

  expectTypeOf({
    ...request,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  }).not.toMatchTypeOf<send.Options>()
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
  expectTypeOf<send.Options<typeof chain>>().toMatchTypeOf<{
    custom: string
  }>()
})

test('decorator: custom request field threads through walletActions', () => {
  const decorated = Client.create({ chain, transport: http() }).extend(
    walletActions(),
  )
  expectTypeOf(decorated.transaction.send)
    .parameter(0)
    .toMatchTypeOf<{ custom: string }>()
})
