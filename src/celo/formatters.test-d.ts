import { describe, expectTypeOf, test } from 'vitest'

import type { Address } from 'abitype'
import { getBlock } from '../actions/public/getBlock.js'
import { getTransaction } from '../actions/public/getTransaction.js'
import { prepareTransactionRequest } from '../actions/wallet/prepareTransactionRequest.js'
import { sendTransaction } from '../actions/wallet/sendTransaction.js'
import { signTransaction } from '../actions/wallet/signTransaction.js'
import { celo } from '../chains/index.js'
import { createPublicClient } from '../clients/createPublicClient.js'
import { createWalletClient } from '../clients/createWalletClient.js'
import { http } from '../clients/transports/http.js'
import type { Hash } from '../types/misc.js'
import { formatters } from './formatters.js'
import type { CeloRpcBlock, CeloTransactionRequest } from './types.js'

describe('block', () => {
  expectTypeOf(formatters.block.format)
    .parameter(0)
    .toEqualTypeOf<CeloRpcBlock>()
  expectTypeOf<
    ReturnType<typeof formatters.block.format>['difficulty']
  >().toEqualTypeOf<bigint | undefined>()
  expectTypeOf<
    ReturnType<typeof formatters.block.format>['gasLimit']
  >().toEqualTypeOf<bigint | undefined>()
  expectTypeOf<
    ReturnType<typeof formatters.block.format>['mixHash']
  >().toEqualTypeOf<undefined>()
  expectTypeOf<
    ReturnType<typeof formatters.block.format>['nonce']
  >().toEqualTypeOf<bigint | null | undefined>()
  expectTypeOf<
    ReturnType<typeof formatters.block.format>['uncles']
  >().toEqualTypeOf<undefined>()
  expectTypeOf<
    ReturnType<typeof formatters.block.format>['randomness']
  >().toEqualTypeOf<
    | {
        committed: `0x${string}`
        revealed: `0x${string}`
      }
    | undefined
  >()
})

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
  test('block', async () => {
    const client = createPublicClient({
      chain: celo,
      transport: http(),
    })
    const block = await getBlock(client, {
      blockNumber: 16645775n,
    })

    expectTypeOf(block.randomness).toEqualTypeOf<
      | {
          committed: `0x${string}`
          revealed: `0x${string}`
        }
      | undefined
    >()
    expectTypeOf(block.difficulty).toEqualTypeOf<bigint | undefined>()
    expectTypeOf(block.gasLimit).toEqualTypeOf<bigint | undefined>()
    expectTypeOf(block.mixHash).toEqualTypeOf<undefined>()
    expectTypeOf(block.nonce).toEqualTypeOf<Hash>()
    expectTypeOf(block.uncles).toEqualTypeOf<undefined>()
    expectTypeOf(block.transactions).toEqualTypeOf<Hash[]>()

    const block_includeTransactions = await getBlock(client, {
      blockNumber: 16645775n,
      includeTransactions: true,
    })
    expectTypeOf(
      block_includeTransactions.transactions[0].feeCurrency,
    ).toEqualTypeOf<Address | null | undefined>()
    expectTypeOf(
      block_includeTransactions.transactions[0].gatewayFee,
    ).toEqualTypeOf<bigint | null | undefined>()
    expectTypeOf(
      block_includeTransactions.transactions[0].gatewayFeeRecipient,
    ).toEqualTypeOf<`0x${string}` | null | undefined>()

    const block_pending = await getBlock(client, {
      blockTag: 'pending',
      includeTransactions: true,
    })
    expectTypeOf(block_pending.hash).toEqualTypeOf<null>()
    expectTypeOf(block_pending.logsBloom).toEqualTypeOf<null>()
    expectTypeOf(block_pending.number).toEqualTypeOf<null>()
    expectTypeOf(block_pending.transactions[0].blockHash).toEqualTypeOf<null>()
    expectTypeOf(
      block_pending.transactions[0].blockNumber,
    ).toEqualTypeOf<null>()
    expectTypeOf(
      block_pending.transactions[0].transactionIndex,
    ).toEqualTypeOf<null>()
  })

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
