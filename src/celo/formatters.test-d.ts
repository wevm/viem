import type { Address } from 'abitype'
import { describe, expectTypeOf, test } from 'vitest'
import { getTransaction } from '../actions/public/getTransaction.js'
import { prepareTransactionRequest } from '../actions/wallet/prepareTransactionRequest.js'
import { sendTransaction } from '../actions/wallet/sendTransaction.js'
import { signTransaction } from '../actions/wallet/signTransaction.js'
import { celo } from '../chains/index.js'
import { createPublicClient } from '../clients/createPublicClient.js'
import { createWalletClient } from '../clients/createWalletClient.js'
import { http } from '../clients/transports/http.js'
import { formatters } from './formatters.js'
import type { CeloTransactionRequest } from './types.js'

describe('transaction', () => {
  expectTypeOf<
    ReturnType<typeof formatters.transaction.format>['feeCurrency']
  >().toEqualTypeOf<Address | null | undefined>()
  expectTypeOf<
    ReturnType<typeof formatters.transaction.format>['gatewayFee']
  >().toEqualTypeOf<bigint | null | undefined>()
  expectTypeOf<
    ReturnType<typeof formatters.transaction.format>['gatewayFeeRecipient']
  >().toEqualTypeOf<`0x${string}` | null | undefined>()
})

describe('transactionRequest', () => {
  expectTypeOf(formatters.transactionRequest.format)
    .parameter(0)
    .toEqualTypeOf<CeloTransactionRequest>()
  expectTypeOf<
    ReturnType<typeof formatters.transactionRequest.format>['feeCurrency']
  >().toEqualTypeOf<`0x${string}` | undefined>()
})

describe('smoke', () => {
  test('transaction', async () => {
    const client = createPublicClient({
      chain: celo,
      transport: http(),
    })

    const transaction = await getTransaction(client, {
      blockNumber: 16628100n,
      index: 0,
    })

    expectTypeOf(transaction.feeCurrency).toEqualTypeOf<
      Address | null | undefined
    >()
    expectTypeOf(transaction.gatewayFee).toEqualTypeOf<
      bigint | null | undefined
    >()
    expectTypeOf(transaction.gatewayFeeRecipient).toEqualTypeOf<
      `0x${string}` | null | undefined
    >()
    expectTypeOf(transaction.type).toEqualTypeOf<
      | 'legacy'
      | 'eip2930'
      | 'eip1559'
      | 'eip4844'
      | 'eip7702'
      | 'cip42'
      | 'cip64'
      | 'deposit'
    >()
  })

  test('transactionRequest (prepareTransactionRequest)', async () => {
    const client = createWalletClient({
      account: '0x',
      chain: celo,
      transport: http(),
    })

    prepareTransactionRequest(client, {
      feeCurrency: '0x',
    })

    // @ts-expect-error `gasPrice` is not defined
    prepareTransactionRequest(client, {
      feeCurrency: '0x',
      gasPrice: 0n,
      type: 'cip64',
    })
  })

  test('transactionRequest (sendTransaction)', async () => {
    const client = createWalletClient({
      account: '0x',
      chain: celo,
      transport: http(),
    })

    sendTransaction(client, {
      feeCurrency: '0x',
    })
  })

  test('transactionRequest (signTransaction)', async () => {
    const client = createWalletClient({
      account: '0x',
      chain: celo,
      transport: http(),
    })

    signTransaction(client, {
      feeCurrency: '0x',
    })
  })

  test('transactionRequest (chain on action)', async () => {
    const client = createWalletClient({
      account: '0x',
      transport: http(),
    })

    sendTransaction(client, {
      chain: celo,
      feeCurrency: '0x',
    })
  })
})
