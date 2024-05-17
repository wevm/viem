import type { ChainFormatters } from '../types/chain.js'
import type { Hash } from '../types/misc.js'
import type { RpcTransaction } from '../types/rpc.js'
import { hexToBigInt } from '../utils/encoding/fromHex.js'
import { defineBlock } from '../utils/formatters/block.js'
import {
  defineTransaction,
  formatTransaction,
} from '../utils/formatters/transaction.js'
import { defineTransactionReceipt } from '../utils/formatters/transactionReceipt.js'
import type {
  OpStackBlockOverrides,
  OpStackRpcBlockOverrides,
} from './types/block.js'
import type {
  OpStackRpcTransaction,
  OpStackRpcTransactionReceiptOverrides,
  OpStackTransaction,
  OpStackTransactionReceiptOverrides,
} from './types/transaction.js'

export const formatters = {
  block: /*#__PURE__*/ defineBlock({
    format(
      args: OpStackRpcBlockOverrides & {
        transactions: Hash[] | OpStackRpcTransaction[]
      },
    ): OpStackBlockOverrides & {
      transactions: Hash[] | OpStackTransaction[]
    } {
      const transactions = args.transactions?.map((transaction) => {
        if (typeof transaction === 'string') return transaction
        const formatted = formatTransaction(
          transaction as RpcTransaction,
        ) as OpStackTransaction
        if (formatted.typeHex === '0x7e') {
          formatted.isSystemTx = transaction.isSystemTx
          formatted.mint = transaction.mint
            ? hexToBigInt(transaction.mint)
            : undefined
          formatted.sourceHash = transaction.sourceHash
          formatted.type = 'deposit'
        }
        return formatted
      }) as Hash[] | OpStackTransaction[]
      return {
        transactions,
        stateRoot: args.stateRoot,
      }
    },
  }),
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
    format(
      args: OpStackRpcTransactionReceiptOverrides,
    ): OpStackTransactionReceiptOverrides {
      return {
        l1GasPrice: args.l1GasPrice ? hexToBigInt(args.l1GasPrice) : null,
        l1GasUsed: args.l1GasUsed ? hexToBigInt(args.l1GasUsed) : null,
        l1Fee: args.l1Fee ? hexToBigInt(args.l1Fee) : null,
        l1FeeScalar: args.l1FeeScalar ? Number(args.l1FeeScalar) : null,
      }
    },
  }),
} as const satisfies ChainFormatters
