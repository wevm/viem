import type { FeeValuesEIP1559 } from '../../types/fee.js'
import { type Formatters } from '../../types/formatter.js'
import type { Hash, Hex } from '../../types/misc.js'
import type {
  Index,
  Quantity,
  RpcTransaction as RpcTransaction_,
} from '../../types/rpc.js'
import type {
  Transaction as Transaction_,
  TransactionBase,
} from '../../types/transaction.js'
import { hexToBigInt } from '../../utils/encoding/fromHex.js'
import { defineBlock } from '../../utils/formatters/block.js'
import {
  defineTransaction,
  formatTransaction,
} from '../../utils/formatters/transaction.js'

type RpcTransaction = RpcTransaction_ & {
  isSystemTx?: undefined
  mint?: undefined
  sourceHash?: undefined
}

type Transaction = Transaction_ & {
  isSystemTx?: undefined
  mint?: undefined
  sourceHash?: undefined
}

export type RpcDepositTransaction = TransactionBase<Quantity, Index> &
  FeeValuesEIP1559<Quantity> & {
    isSystemTx?: boolean
    mint?: Hex
    sourceHash: Hex
    type: '0x7e'
  }

export type DepositTransaction = TransactionBase &
  FeeValuesEIP1559 & {
    isSystemTx?: boolean
    mint?: bigint
    sourceHash: Hex
    type: 'deposit'
  }

export type OptimismFormatOverrides = {
  RpcBlock: {
    transactions: Hash[] | OptimismFormatOverrides['RpcTransaction'][]
  }
  RpcTransaction: RpcTransaction | RpcDepositTransaction
  Transaction: Transaction | DepositTransaction
}

export const formattersOptimism = {
  block: /*#__PURE__*/ defineBlock({
    format(args: OptimismFormatOverrides['RpcBlock']) {
      const transactions = args.transactions?.map((transaction) => {
        if (typeof transaction === 'string') return transaction
        const formatted = formatTransaction(
          transaction as RpcTransaction,
        ) as OptimismFormatOverrides['Transaction']
        if (formatted.typeHex === '0x7e') {
          formatted.isSystemTx = transaction.isSystemTx
          formatted.mint = transaction.mint
            ? hexToBigInt(transaction.mint)
            : undefined
          formatted.sourceHash = transaction.sourceHash
          formatted.type = 'deposit'
        }
        return formatted
      }) as Hash[] | OptimismFormatOverrides['Transaction'][]
      return {
        transactions,
      }
    },
  }),
  transaction: /*#__PURE__*/ defineTransaction({
    format(args: OptimismFormatOverrides['RpcTransaction']) {
      const transaction = {} as OptimismFormatOverrides['Transaction']
      if (args.type === '0x7e') {
        transaction.isSystemTx = args.isSystemTx
        transaction.mint = args.mint ? hexToBigInt(args.mint) : undefined
        transaction.sourceHash = args.sourceHash
        transaction.type = 'deposit'
      }
      return transaction
    },
  }),
} as const satisfies Formatters
