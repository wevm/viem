import type { ChainFormatters } from '../types/chain.js'
import type { RpcBlock, RpcTransaction } from '../types/rpc.js'
import { hexToBigInt, hexToNumber } from '../utils/encoding/fromHex.js'
import { formatBlock } from '../utils/formatters/block.js'
import {
  defineTransaction,
  formatTransaction,
} from '../utils/formatters/transaction.js'
import { defineTransactionReceipt } from '../utils/formatters/transactionReceipt.js'
import type { OpStackBlock, OpStackRpcBlock } from './types/block.js'
import type {
  OpStackRpcTransaction,
  OpStackRpcTransactionReceipt,
  OpStackTransaction,
  OpStackTransactionReceipt,
} from './types/transaction.js'

const block = {
  exclude: undefined as [] | undefined,
  format: (args: OpStackRpcBlock, action?: string | undefined) => {
    // `formatBlock` formats every transaction, so it gets none and each
    // transaction is formatted once here, in the same order of errors.
    const transactions = Array.isArray(args.transactions)
      ? args.transactions.map((transaction) =>
          typeof transaction === 'string'
            ? transaction
            : (formatTransaction(
                transaction as RpcTransaction,
              ) as OpStackTransaction),
        )
      : undefined
    const base = formatBlock(
      (transactions ? { ...args, transactions: [] } : args) as RpcBlock,
      action,
    )
    for (let i = 0; transactions && i < transactions.length; i++) {
      const formatted = transactions[i]!
      const transaction = args.transactions![i] as OpStackRpcTransaction
      if (typeof formatted === 'string' || formatted.typeHex !== '0x7e')
        continue
      formatted.isSystemTx = transaction.isSystemTx
      formatted.mint = transaction.mint
        ? hexToBigInt(transaction.mint)
        : undefined
      formatted.sourceHash = transaction.sourceHash
      formatted.type = 'deposit'
    }
    return {
      ...base,
      transactions,
      stateRoot: args.stateRoot,
    } as OpStackBlock
  },
  type: 'block' as const,
}

export const formatters = {
  block,
  transaction: /*#__PURE__*/ defineTransaction({
    format(args: OpStackRpcTransaction): OpStackTransaction {
      const transaction = {} as OpStackTransaction
      if (args.type === '0x7e') {
        transaction.isSystemTx = args.isSystemTx
        transaction.mint = args.mint ? hexToBigInt(args.mint) : undefined
        transaction.sourceHash = args.sourceHash
        transaction.type = 'deposit'
      }
      return transaction
    },
  }),
  transactionReceipt: /*#__PURE__*/ defineTransactionReceipt({
    format(args: OpStackRpcTransactionReceipt): OpStackTransactionReceipt {
      return {
        ...(args.depositNonce
          ? { depositNonce: hexToBigInt(args.depositNonce) }
          : {}),
        ...(args.depositReceiptVersion
          ? { depositReceiptVersion: hexToNumber(args.depositReceiptVersion) }
          : {}),
        ...(args.opGasRefund !== undefined
          ? {
              opGasRefund:
                args.opGasRefund === null
                  ? null
                  : hexToBigInt(args.opGasRefund),
            }
          : {}),
        l1GasPrice: args.l1GasPrice ? hexToBigInt(args.l1GasPrice) : null,
        l1GasUsed: args.l1GasUsed ? hexToBigInt(args.l1GasUsed) : null,
        l1Fee: args.l1Fee ? hexToBigInt(args.l1Fee) : null,
        l1FeeScalar: args.l1FeeScalar ? Number(args.l1FeeScalar) : null,
      } as OpStackTransactionReceipt
    },
  }),
} as const satisfies ChainFormatters
