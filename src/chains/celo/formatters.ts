import { type ChainFormatters } from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'
import type { RpcTransaction } from '../../types/rpc.js'
import { hexToBigInt } from '../../utils/encoding/fromHex.js'
import { numberToHex } from '../../utils/encoding/toHex.js'
import { defineBlock } from '../../utils/formatters/block.js'
import {
  defineTransaction,
  formatTransaction,
} from '../../utils/formatters/transaction.js'
import { defineTransactionReceipt } from '../../utils/formatters/transactionReceipt.js'
import { defineTransactionRequest } from '../../utils/formatters/transactionRequest.js'
import type {
  CeloBlockOverrides,
  CeloRpcTransaction,
  CeloRpcTransactionReceiptOverrides,
  CeloRpcTransactionRequest,
  CeloTransaction,
  CeloTransactionReceiptOverrides,
  CeloTransactionRequest,
  RpcTransactionRequestCIP64,
  TransactionCIP42,
  TransactionCIP64,
  TransactionRequestCIP42,
  TransactionRequestCIP64,
} from './types.js'

function isTransactionRequestCIP64(args: CeloTransactionRequest): boolean {
  if (args.type === 'cip64') return true
  if (args.type) return false
  return (
    'feeCurrency' in args &&
    // @ts-expect-error `gatewayFee` is not defined
    args.gatewayFee === undefined &&
    // @ts-expect-error `gatewayFeeRecipient` is not defined
    args.gatewayFeeRecipient === undefined
  )
}

function isTransactionRequestCIP42(args: CeloTransactionRequest): boolean {
  if (args.type === 'cip42') return true
  if (args.type) return false
  return (
    (args as TransactionRequestCIP42).gatewayFee !== undefined ||
    (args as TransactionRequestCIP42).gatewayFeeRecipient !== undefined
  )
}

export const formattersCelo = {
  block: /*#__PURE__*/ defineBlock({
    exclude: ['difficulty', 'gasLimit', 'mixHash', 'nonce', 'uncles'],
    format(
      args: CeloBlockOverrides & {
        transactions: Hash[] | CeloRpcTransaction[]
      },
    ): CeloBlockOverrides & {
      transactions: Hash[] | CeloTransaction[]
    } {
      const transactions = args.transactions?.map((transaction) => {
        if (typeof transaction === 'string') return transaction
        return {
          ...formatTransaction(transaction as RpcTransaction),
          feeCurrency: transaction.feeCurrency,

          ...(transaction.type === '0x7c'
            ? {
                gatewayFee: transaction.gatewayFee
                  ? hexToBigInt(transaction.gatewayFee)
                  : null,
                gatewayFeeRecipient: transaction.gatewayFeeRecipient || null,
              }
            : {}),
        }
      }) as Hash[] | CeloTransaction[]
      return {
        randomness: args.randomness,
        transactions,
      }
    },
  }),
  transaction: /*#__PURE__*/ defineTransaction({
    format(args: CeloRpcTransaction): CeloTransaction {
      switch (args.type) {
        case '0x7c':
          return {
            feeCurrency: args.feeCurrency,
            gatewayFee: args.gatewayFee ? hexToBigInt(args.gatewayFee) : null,
            gatewayFeeRecipient: args.gatewayFeeRecipient,
          } as TransactionCIP42
        case '0x7b':
          return {
            feeCurrency: args.feeCurrency,
          } as TransactionCIP64
        default:
          return {
            feeCurrency: args.feeCurrency,
            gatewayFee: args.gatewayFee ? hexToBigInt(args.gatewayFee) : null,
            gatewayFeeRecipient: args.gatewayFeeRecipient,
          } as CeloTransaction
      }
    },
  }),
  transactionReceipt: /*#__PURE__*/ defineTransactionReceipt({
    format(
      args: CeloRpcTransactionReceiptOverrides,
    ): CeloTransactionReceiptOverrides {
      return {
        feeCurrency: args.feeCurrency,
        gatewayFee: args.gatewayFee ? hexToBigInt(args.gatewayFee) : null,
        gatewayFeeRecipient: args.gatewayFeeRecipient,
      }
    },
  }),

  transactionRequest: /*#__PURE__*/ defineTransactionRequest({
    format(args: CeloTransactionRequest) {
      if (isTransactionRequestCIP64(args)) {
        return {
          type: '0x7b',
          feeCurrency: args.feeCurrency,
        } as RpcTransactionRequestCIP64
      }
      const _args = args as Exclude<
        CeloTransactionRequest,
        TransactionRequestCIP64
      >
      const request = {
        feeCurrency: _args.feeCurrency,
        gatewayFee:
          typeof _args.gatewayFee !== 'undefined'
            ? numberToHex(_args.gatewayFee)
            : undefined,
        gatewayFeeRecipient: _args.gatewayFeeRecipient,
      } as CeloRpcTransactionRequest
      if (isTransactionRequestCIP42(_args)) request.type = '0x7c'
      return request
    },
  }),
} as const satisfies ChainFormatters
