import { describe, expectTypeOf, test } from 'vitest'

import { getBlock } from '../../actions/public/getBlock.js'
import { getTransaction } from '../../actions/public/getTransaction.js'
import { getTransactionReceipt } from '../../actions/public/getTransactionReceipt.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { http } from '../../clients/transports/http.js'
import type {
  RpcBlock,
  RpcTransaction,
  RpcTransactionReceipt,
} from '../../types/rpc.js'
import type {
  Transaction,
  TransactionRequest,
} from '../../types/transaction.js'
import { celo } from '../index.js'
import { celoFormatters } from './celo.js'

describe('block', () => {
  expectTypeOf(celoFormatters.block.format).parameter(0).toEqualTypeOf<
    Partial<RpcBlock> & {
      randomness: { committed: `0x${string}`; revealed: `0x${string}` }
      transactions:
        | `0x${string}`[]
        | (RpcTransaction & {
            feeCurrency: `0x${string}` | null
            gatewayFee: `0x${string}` | null
            gatewayFeeRecipient: `0x${string}` | null
          })[]
    }
  >()
  expectTypeOf<
    ReturnType<typeof celoFormatters.block.format>['difficulty']
  >().toEqualTypeOf<never>()
  expectTypeOf<
    ReturnType<typeof celoFormatters.block.format>['gasLimit']
  >().toEqualTypeOf<never>()
  expectTypeOf<
    ReturnType<typeof celoFormatters.block.format>['mixHash']
  >().toEqualTypeOf<never>()
  expectTypeOf<
    ReturnType<typeof celoFormatters.block.format>['nonce']
  >().toEqualTypeOf<never>()
  expectTypeOf<
    ReturnType<typeof celoFormatters.block.format>['uncles']
  >().toEqualTypeOf<never>()
  expectTypeOf<
    ReturnType<typeof celoFormatters.block.format>['randomness']
  >().toEqualTypeOf<{
    committed: `0x${string}`
    revealed: `0x${string}`
  }>()
})

describe('transaction', () => {
  expectTypeOf(celoFormatters.transaction.format).parameter(0).toEqualTypeOf<
    Partial<RpcTransaction> & {
      feeCurrency: `0x${string}` | null
      gatewayFee: `0x${string}` | null
      gatewayFeeRecipient: `0x${string}` | null
    }
  >()
  expectTypeOf<
    ReturnType<typeof celoFormatters.transaction.format>['feeCurrency']
  >().toEqualTypeOf<`0x${string}` | null>()
  expectTypeOf<
    ReturnType<typeof celoFormatters.transaction.format>['gatewayFee']
  >().toEqualTypeOf<bigint | null>()
  expectTypeOf<
    ReturnType<typeof celoFormatters.transaction.format>['gatewayFeeRecipient']
  >().toEqualTypeOf<`0x${string}` | null>()
})

describe('transactionReceipt', () => {
  expectTypeOf(celoFormatters.transactionReceipt.format)
    .parameter(0)
    .toEqualTypeOf<
      Partial<RpcTransactionReceipt> & {
        feeCurrency: `0x${string}` | null
        gatewayFee: `0x${string}` | null
        gatewayFeeRecipient: `0x${string}` | null
      }
    >()
  expectTypeOf<
    ReturnType<typeof celoFormatters.transactionReceipt.format>['feeCurrency']
  >().toEqualTypeOf<`0x${string}` | null>()
  expectTypeOf<
    ReturnType<typeof celoFormatters.transactionReceipt.format>['gatewayFee']
  >().toEqualTypeOf<bigint | null>()
  expectTypeOf<
    ReturnType<
      typeof celoFormatters.transactionReceipt.format
    >['gatewayFeeRecipient']
  >().toEqualTypeOf<`0x${string}` | null>()
})

describe('transactionRequest', () => {
  expectTypeOf(celoFormatters.transactionRequest.format)
    .parameter(0)
    .toEqualTypeOf<
      Partial<TransactionRequest> & {
        feeCurrency?: `0x${string}` | undefined
        gatewayFee?: bigint | undefined
        gatewayFeeRecipient?: `0x${string}` | undefined
      }
    >()
  expectTypeOf<
    ReturnType<typeof celoFormatters.transactionRequest.format>['feeCurrency']
  >().toEqualTypeOf<`0x${string}` | undefined>()
  expectTypeOf<
    ReturnType<typeof celoFormatters.transactionRequest.format>['gatewayFee']
  >().toEqualTypeOf<`0x${string}` | undefined>()
  expectTypeOf<
    ReturnType<
      typeof celoFormatters.transactionRequest.format
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
      includeTransactions: true,
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
    expectTypeOf(block.transactions).toEqualTypeOf<
      | `0x${string}`[]
      | (Transaction & {
          feeCurrency: `0x${string}` | null
          gatewayFee: bigint | null
          gatewayFeeRecipient: `0x${string}` | null
        })[]
    >()
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
})
