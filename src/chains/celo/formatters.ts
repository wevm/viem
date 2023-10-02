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
          ...(transaction.type === '0x7b'
            ? {}
            : {
                gatewayFee: transaction.gatewayFee
                  ? hexToBigInt(transaction.gatewayFee)
                  : null,
                gatewayFeeRecipient: transaction.gatewayFeeRecipient,
              }),
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
        ...(args.type === '0x7b'
          ? {}
          : {
              gatewayFee: args.gatewayFee ? hexToBigInt(args.gatewayFee) : null,
              gatewayFeeRecipient: args.gatewayFeeRecipient,
            }),
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

  // TODO: Figure out how to deal with the error here. gateway fields aren't on all
  // types in the union type. Also the type indicator can be blank, so.... this is super ambiguous
  transactionRequest: /*#__PURE__*/ defineTransactionRequest({
    format(args: CeloTransactionRequest): CeloRpcTransactionRequest {
      const request = {
        feeCurrency: args.feeCurrency,
        // gatewayFee:
        //   typeof args.gatewayFee !== 'undefined'
        //     ? numberToHex(args.gatewayFee)
        //     : undefined,
        // gatewayFeeRecipient: args.gatewayFeeRecipient,
      } as CeloRpcTransactionRequest

      if (args.type === 'cip64') request.type = '0x7b'
      if (args.type === 'cip42') request.type = '0x7c'

      if (typeof args.gatewayFee !== 'undefined') {
        request.gatewayFee = numberToHex(args.gatewayFee)
      }
      if (args.gatewayFeeRecipient) {
        request.gatewayFeeRecipient = args.gatewayFeeRecipient
      }
      return request
    },
  }),
} as const satisfies ChainFormatters
