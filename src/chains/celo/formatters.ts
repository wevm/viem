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
} from './types.js'

function isTransactionRequestCIP64(args: CeloTransactionRequest): boolean {
  if (args.type === 'cip64') return true
  if (args.type) return false
  return (
    'feeCurrency' in args &&
    args.gatewayFee === undefined &&
    args.gatewayFeeRecipient === undefined
  )
}

function isTransactionRequestCIP42(args: CeloTransactionRequest): boolean {
  if (args.type === 'cip42') return true
  if (args.type) return false
  return args.gatewayFee !== undefined || args.gatewayFeeRecipient !== undefined
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

          ...(transaction.type !== '0x7b'
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
      if (args.type === '0x7b')
        return {
          feeCurrency: args.feeCurrency,
        } as CeloTransaction
      return {
        feeCurrency: args.feeCurrency,
        gatewayFee: args.gatewayFee ? hexToBigInt(args.gatewayFee) : null,
        gatewayFeeRecipient: args.gatewayFeeRecipient,
      } as CeloTransaction
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
    format(args: CeloTransactionRequest): CeloRpcTransactionRequest {
      if (isTransactionRequestCIP64(args))
        return {
          type: '0x7b',
          feeCurrency: args.feeCurrency,
        } as CeloRpcTransactionRequest

      const request = {
        feeCurrency: args.feeCurrency,
        gatewayFee:
          typeof args.gatewayFee !== 'undefined'
            ? numberToHex(args.gatewayFee)
            : undefined,
        gatewayFeeRecipient: args.gatewayFeeRecipient,
      } as CeloRpcTransactionRequest

      if (isTransactionRequestCIP42(args)) request.type = '0x7c'

      return request
    },
  }),
} as const satisfies ChainFormatters
