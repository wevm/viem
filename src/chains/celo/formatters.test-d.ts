import { describe, expectTypeOf, test } from 'vitest'

import { getBlock } from '../../actions/public/getBlock.js'
import { getTransaction } from '../../actions/public/getTransaction.js'
import { getTransactionReceipt } from '../../actions/public/getTransactionReceipt.js'
import { prepareTransactionRequest } from '../../actions/wallet/prepareTransactionRequest.js'
import { signTransaction } from '../../actions/wallet/signTransaction.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { createWalletClient } from '../../clients/createWalletClient.js'
import { http } from '../../clients/transports/http.js'
import type { Hash } from '../../types/misc.js'
import type { RpcBlock, RpcTransactionReceipt } from '../../types/rpc.js'
import type { TransactionRequest } from '../../types/transaction.js'
import type { Assign } from '../../types/utils.js'
import { sendTransaction } from '../../wallet/index.js'
import { celo } from '../index.js'
import { formattersCelo } from './formatters.js'
import type {
  CeloBlockOverrides,
  CeloRpcTransaction,
  CeloTransactionRequest,
} from './types.js'

describe('block', () => {
  expectTypeOf(formattersCelo.block.format).parameter(0).toEqualTypeOf<
    Assign<
      Partial<RpcBlock>,
      CeloBlockOverrides & {
        transactions: `0x${string}`[] | CeloRpcTransaction[]
      }
    >
  >()
  expectTypeOf<
    ReturnType<typeof formattersCelo.block.format>['difficulty']
  >().toEqualTypeOf<never>()
  expectTypeOf<
    ReturnType<typeof formattersCelo.block.format>['gasLimit']
  >().toEqualTypeOf<never>()
  expectTypeOf<
    ReturnType<typeof formattersCelo.block.format>['mixHash']
  >().toEqualTypeOf<never>()
  expectTypeOf<
    ReturnType<typeof formattersCelo.block.format>['nonce']
  >().toEqualTypeOf<never>()
  expectTypeOf<
    ReturnType<typeof formattersCelo.block.format>['uncles']
  >().toEqualTypeOf<never>()
  expectTypeOf<
    ReturnType<typeof formattersCelo.block.format>['randomness']
  >().toEqualTypeOf<{
    committed: `0x${string}`
    revealed: `0x${string}`
  }>()
})

describe('transaction', () => {
  expectTypeOf<
    ReturnType<typeof formattersCelo.transaction.format>['feeCurrency']
  >().toEqualTypeOf<`0x${string}` | null>()
  if ('gatewayFee' in formattersCelo.transaction.format) {
    expectTypeOf<
      ReturnType<typeof formattersCelo.transaction.format>['gatewayFee']
    >().toEqualTypeOf<bigint | null>()
  }
  expectTypeOf<
    ReturnType<typeof formattersCelo.transaction.format>['gatewayFeeRecipient']
  >().toEqualTypeOf<`0x${string}` | null>()
})

describe('transactionReceipt', () => {
  expectTypeOf(formattersCelo.transactionReceipt.format)
    .parameter(0)
    .toEqualTypeOf<
      Partial<RpcTransactionReceipt> & {
        feeCurrency: `0x${string}` | null
        gatewayFee: `0x${string}` | null
        gatewayFeeRecipient: `0x${string}` | null
      }
    >()
  expectTypeOf<
    ReturnType<typeof formattersCelo.transactionReceipt.format>['feeCurrency']
  >().toEqualTypeOf<`0x${string}` | null>()
  expectTypeOf<
    ReturnType<typeof formattersCelo.transactionReceipt.format>['gatewayFee']
  >().toEqualTypeOf<bigint | null>()
  expectTypeOf<
    ReturnType<
      typeof formattersCelo.transactionReceipt.format
    >['gatewayFeeRecipient']
  >().toEqualTypeOf<`0x${string}` | null>()
})

describe('transactionRequest', () => {
  expectTypeOf(formattersCelo.transactionRequest.format)
    .parameter(0)
    .toEqualTypeOf<
      Assign<Partial<TransactionRequest>, CeloTransactionRequest>
    >()
  expectTypeOf<
    ReturnType<typeof formattersCelo.transactionRequest.format>['feeCurrency']
  >().toEqualTypeOf<`0x${string}` | undefined>()
  expectTypeOf<
    ReturnType<typeof formattersCelo.transactionRequest.format>['gatewayFee']
  >().toEqualTypeOf<`0x${string}` | undefined>()
  expectTypeOf<
    ReturnType<
      typeof formattersCelo.transactionRequest.format
    >['gatewayFeeRecipient']
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

    expectTypeOf(block.difficulty).toEqualTypeOf<never>()
    expectTypeOf(block.gasLimit).toEqualTypeOf<never>()
    expectTypeOf(block.mixHash).toEqualTypeOf<never>()
    expectTypeOf(block.nonce).toEqualTypeOf<never>()
    expectTypeOf(block.uncles).toEqualTypeOf<never>()
    expectTypeOf(block.randomness).toEqualTypeOf<{
      committed: `0x${string}`
      revealed: `0x${string}`
    }>()
    expectTypeOf(block.transactions).toEqualTypeOf<Hash[]>()

    const block_includeTransactions = await getBlock(client, {
      blockNumber: 16645775n,
      includeTransactions: true,
    })
    expectTypeOf(
      block_includeTransactions.transactions[0].feeCurrency,
    ).toEqualTypeOf<`0x${string}` | null>()
    expectTypeOf(
      block_includeTransactions.transactions[0].gatewayFee,
    ).toEqualTypeOf<bigint | null>()
    expectTypeOf(
      block_includeTransactions.transactions[0].gatewayFeeRecipient,
    ).toEqualTypeOf<`0x${string}` | null>()

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

    expectTypeOf(transaction.feeCurrency).toEqualTypeOf<`0x${string}` | null>()
    expectTypeOf(transaction.gatewayFee).toEqualTypeOf<bigint | null>()
    expectTypeOf(transaction.gatewayFeeRecipient).toEqualTypeOf<
      `0x${string}` | null
    >()
    expectTypeOf(transaction.type).toEqualTypeOf<
      'legacy' | 'eip2930' | 'eip1559' | 'cip42' | 'cip64'
    >()
  })

  test('transactionReceipt', async () => {
    const client = createPublicClient({
      chain: celo,
      transport: http(),
    })

    const transaction = await getTransactionReceipt(client, {
      hash: '0x',
    })

    expectTypeOf(transaction.feeCurrency).toEqualTypeOf<`0x${string}` | null>()
    expectTypeOf(transaction.gatewayFee).toEqualTypeOf<bigint | null>()
    expectTypeOf(transaction.gatewayFeeRecipient).toEqualTypeOf<
      `0x${string}` | null
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
      gatewayFee: 0n,
      gatewayFeeRecipient: '0x',
    })

    // @ts-expect-error `gasPrice` is not defined
    prepareTransactionRequest(client, {
      feeCurrency: '0x',
      gatewayFee: 0n,
      gatewayFeeRecipient: '0x',
      gasPrice: 0n,
      maxFeePerGas: 0n,
      maxPriorityFeePerGas: 0n,
    })

    // @ts-expect-error `gasPrice` is not defined
    prepareTransactionRequest(client, {
      feeCurrency: '0x',
      gatewayFee: 0n,
      gatewayFeeRecipient: '0x',
      gasPrice: 0n,
      type: 'cip42',
    })

    // @ts-expect-error `gasPrice` is not defined
    prepareTransactionRequest(client, {
      feeCurrency: '0x',
      gasPrice: 0n,
      type: 'cip64',
    })

    // @ts-expect-error `gasPrice` is not defined
    prepareTransactionRequest(client, {
      feeCurrency: '0x',
      gatewayFee: 0n,
      gatewayFeeRecipient: '0x',
      gasPrice: 0n,
      type: 'eip1559',
    })

    // @ts-expect-error `type` cannot be "legacy"
    prepareTransactionRequest(client, {
      feeCurrency: '0x',
      gatewayFee: 0n,
      gatewayFeeRecipient: '0x',
      maxFeePerGas: 0n,
      type: 'legacy',
    })

    // @ts-expect-error `type` cannot be "eip2930"
    prepareTransactionRequest(client, {
      feeCurrency: '0x',
      gatewayFee: 0n,
      gatewayFeeRecipient: '0x',
      maxFeePerGas: 0n,
      type: 'eip2930',
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
      gatewayFee: 0n,
      gatewayFeeRecipient: '0x',
    })

    // @ts-expect-error `gasPrice` is not defined
    sendTransaction(client, {
      feeCurrency: '0x',
      gatewayFee: 0n,
      gatewayFeeRecipient: '0x',
      gasPrice: 0n,
      maxFeePerGas: 0n,
      maxPriorityFeePerGas: 0n,
    })

    // @ts-expect-error `gasPrice` is not defined
    sendTransaction(client, {
      feeCurrency: '0x',
      gatewayFee: 0n,
      gatewayFeeRecipient: '0x',
      gasPrice: 0n,
      type: 'cip42',
    })

    // @ts-expect-error `gasPrice` is not defined
    sendTransaction(client, {
      feeCurrency: '0x',
      gatewayFee: 0n,
      gatewayFeeRecipient: '0x',
      gasPrice: 0n,
      type: 'eip1559',
    })

    // @ts-expect-error `type` cannot be "legacy"
    sendTransaction(client, {
      feeCurrency: '0x',
      gatewayFee: 0n,
      gatewayFeeRecipient: '0x',
      maxFeePerGas: 0n,
      type: 'legacy',
    })

    // @ts-expect-error `type` cannot be "eip2930"
    sendTransaction(client, {
      feeCurrency: '0x',
      gatewayFee: 0n,
      gatewayFeeRecipient: '0x',
      maxFeePerGas: 0n,
      type: 'eip2930',
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
      gatewayFee: 0n,
      gatewayFeeRecipient: '0x',
    })

    // @ts-expect-error `gasPrice` is not defined
    signTransaction(client, {
      feeCurrency: '0x',
      gatewayFee: 0n,
      gatewayFeeRecipient: '0x',
      gasPrice: 0n,
      maxFeePerGas: 0n,
      maxPriorityFeePerGas: 0n,
    })

    // @ts-expect-error `gasPrice` is not defined
    signTransaction(client, {
      feeCurrency: '0x',
      gatewayFee: 0n,
      gatewayFeeRecipient: '0x',
      gasPrice: 0n,
      type: 'cip42',
    })

    // @ts-expect-error `gasPrice` is not defined
    signTransaction(client, {
      feeCurrency: '0x',
      gatewayFee: 0n,
      gatewayFeeRecipient: '0x',
      gasPrice: 0n,
      type: 'eip1559',
    })

    // @ts-expect-error `type` cannot be "legacy"
    signTransaction(client, {
      feeCurrency: '0x',
      gatewayFee: 0n,
      gatewayFeeRecipient: '0x',
      maxFeePerGas: 0n,
      type: 'legacy',
    })

    // @ts-expect-error `type` cannot be "eip2930"
    signTransaction(client, {
      feeCurrency: '0x',
      gatewayFee: 0n,
      gatewayFeeRecipient: '0x',
      maxFeePerGas: 0n,
      type: 'eip2930',
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
      gatewayFee: 0n,
      gatewayFeeRecipient: '0x',
    })

    // @ts-expect-error `gasPrice` is not defined
    sendTransaction(client, {
      chain: celo,
      feeCurrency: '0x',
      gatewayFee: 0n,
      gatewayFeeRecipient: '0x',
      gasPrice: 0n,
      maxFeePerGas: 0n,
      maxPriorityFeePerGas: 0n,
    })

    // @ts-expect-error `gasPrice` is not defined
    sendTransaction(client, {
      chain: celo,
      feeCurrency: '0x',
      gatewayFee: 0n,
      gatewayFeeRecipient: '0x',
      gasPrice: 0n,
      type: 'cip42',
    })

    // @ts-expect-error `gasPrice` is not defined
    sendTransaction(client, {
      chain: celo,
      feeCurrency: '0x',
      gatewayFee: 0n,
      gatewayFeeRecipient: '0x',
      gasPrice: 0n,
      type: 'eip1559',
    })

    // @ts-expect-error `type` cannot be "legacy"
    sendTransaction(client, {
      chain: celo,
      feeCurrency: '0x',
      gatewayFee: 0n,
      gatewayFeeRecipient: '0x',
      maxFeePerGas: 0n,
      type: 'legacy',
    })

    // @ts-expect-error `type` cannot be "eip2930"
    sendTransaction(client, {
      chain: celo,
      feeCurrency: '0x',
      gatewayFee: 0n,
      gatewayFeeRecipient: '0x',
      maxFeePerGas: 0n,
      type: 'eip2930',
    })
  })
})
