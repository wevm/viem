import type { ChainFormatters } from '../types/chain.js'
import type { RpcBlock, RpcTransaction } from '../types/rpc.js'
import { hexToBigInt } from '../utils/encoding/fromHex.js'
import { formatBlock } from '../utils/formatters/block.js'
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

const block = {
  exclude: undefined as [] | undefined,
  format: (args: CeloRpcBlock, action?: string | undefined) => {
    // `formatBlock` formats every transaction, so it gets none and each
    // transaction is formatted once here, in the same order of errors.
    const formatted = Array.isArray(args.transactions)
      ? args.transactions.map((transaction) =>
          typeof transaction === 'string'
            ? transaction
            : formatTransaction(transaction as RpcTransaction),
        )
      : undefined
    const base = formatBlock(
      (formatted ? { ...args, transactions: [] } : args) as RpcBlock,
      action,
    )
    const transactions = formatted?.map((transaction, i) => {
      if (typeof transaction === 'string') return transaction
      const rpcTransaction = args.transactions![i] as CeloRpcTransaction
      if (rpcTransaction.type === '0x7e')
        return {
          ...transaction,
          isSystemTx: rpcTransaction.isSystemTx,
          mint: rpcTransaction.mint
            ? hexToBigInt(rpcTransaction.mint)
            : undefined,
          sourceHash: rpcTransaction.sourceHash,
          type: 'deposit',
        }
      return {
        ...transaction,
        ...(rpcTransaction.type === '0x7b' ? { type: 'cip64' } : {}),
        ...(rpcTransaction.type === '0x7c' ? { type: 'cip42' } : {}),
        ...(rpcTransaction.gatewayFee
          ? {
              gatewayFee: hexToBigInt(rpcTransaction.gatewayFee),
              gatewayFeeRecipient: rpcTransaction.gatewayFeeRecipient,
            }
          : {}),
        feeCurrency: rpcTransaction.feeCurrency,
      }
    })
    return { ...base, transactions } as CeloBlock
  },
  type: 'block' as const,
}

export const formatters = {
  block,
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
