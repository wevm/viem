import { type ChainFormatters } from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'
import type { RpcTransaction, RpcTransactionRequest } from '../../types/rpc.js'
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
  RpcTransactionRequestCIP42,
  RpcTransactionRequestCIP64,
} from './types.js'

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
      return {
        feeCurrency: args.feeCurrency,
        ...(args.type === '0x7c'
          ? {
              gatewayFee: args.gatewayFee ? hexToBigInt(args.gatewayFee) : null,
              gatewayFeeRecipient: args.gatewayFeeRecipient,
            }
          : {}),
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
      if (
        args.type === 'cip64' ||
        ('feeCurrency' in args &&
          !('gatewayFee' in args || 'gatewayFeeRecipient' in args))
      ) {
        return {
          type: '0x7b',
          feeCurrency: args.feeCurrency,
        } as RpcTransactionRequestCIP64
      }

      const request = {
        feeCurrency: args.feeCurrency,
      } as Exclude<CeloRpcTransactionRequest, RpcTransactionRequestCIP64>

      if (
        args.type === 'cip42' ||
        'gatewayFee' in args ||
        'gatewayFeeRecipient' in args
      ) {
        request.type = '0x7c'
        request.gatewayFee =
          'gatewayFee' in args && typeof args.gatewayFee !== 'undefined'
            ? numberToHex(args.gatewayFee)
            : undefined
        request.gatewayFeeRecipient =
          'gatewayFeeRecipient' in args ? args.gatewayFeeRecipient : undefined
        return request as RpcTransactionRequestCIP42
      }
      return request as RpcTransactionRequest
    },
  }),
} as const satisfies ChainFormatters
