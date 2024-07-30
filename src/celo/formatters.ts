import type { ChainFormatters } from '../types/chain.js'
import type { RpcTransaction } from '../types/rpc.js'
import { hexToBigInt } from '../utils/encoding/fromHex.js'
import { defineBlock } from '../utils/formatters/block.js'
import {
  defineTransaction,
  formatTransaction,
} from '../utils/formatters/transaction.js'
import { defineTransactionRequest } from '../utils/formatters/transactionRequest.js'
import type {
  CeloBlock,
  CeloRpcBlock,
  CeloRpcTransaction,
  CeloRpcTransactionRequest,
  CeloTransaction,
  CeloTransactionRequest,
} from './types.js'
import { isCIP64 } from './utils.js'

export const formatters = {
  block: /*#__PURE__*/ defineBlock({
    format(args: CeloRpcBlock): CeloBlock {
      const transactions = args.transactions?.map((transaction) => {
        if (typeof transaction === 'string') return transaction
        const formatted = formatTransaction(transaction as RpcTransaction)
        return {
          ...formatted,
          ...(transaction.gatewayFee
            ? {
                gatewayFee: hexToBigInt(transaction.gatewayFee),
                gatewayFeeRecipient: transaction.gatewayFeeRecipient,
              }
            : {}),
          feeCurrency: transaction.feeCurrency,
        }
      })
      return {
        transactions,
        ...(args.randomness ? { randomness: args.randomness } : {}),
      } as CeloBlock
    },
  }),
  transaction: /*#__PURE__*/ defineTransaction({
    format(args: CeloRpcTransaction): CeloTransaction {
      if (args.type === '0x7e')
        return {
          isSystemTx: args.isSystemTx,
          mint: args.mint ? hexToBigInt(args.mint) : undefined,
          sourceHash: args.sourceHash,
          type: 'deposit',
        } as CeloTransaction

      const transaction = { feeCurrency: args.feeCurrency } as CeloTransaction

      if (args.type === '0x7b') transaction.type = 'cip64'
      else {
        if (args.type === '0x7c') transaction.type = 'cip42'

        transaction.gatewayFee = args.gatewayFee
          ? hexToBigInt(args.gatewayFee)
          : null
        transaction.gatewayFeeRecipient = args.gatewayFeeRecipient
      }

      return transaction
    },
  }),
  transactionRequest: /*#__PURE__*/ defineTransactionRequest({
    format(args: CeloTransactionRequest): CeloRpcTransactionRequest {
      const request = {} as CeloRpcTransactionRequest

      if (args.feeCurrency) request.feeCurrency = args.feeCurrency
      if (isCIP64(args)) request.type = '0x7b'

      return request
    },
  }),
} as const satisfies ChainFormatters
