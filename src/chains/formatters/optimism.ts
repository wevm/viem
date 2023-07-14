import { defineTransactionReceipt } from '../../index.js'
import type { Block } from '../../types/block.js'
import type { FeeValuesEIP1559 } from '../../types/fee.js'
import { type Formatters } from '../../types/formatter.js'
import type { Hash, Hex } from '../../types/misc.js'
import type {
  Index,
  Quantity,
  RpcBlock,
  RpcTransaction as RpcTransaction_,
  RpcTransactionReceipt,
} from '../../types/rpc.js'
import type {
  Transaction as Transaction_,
  TransactionBase,
  TransactionReceipt,
} from '../../types/transaction.js'
import type { Assign } from '../../types/utils.js'
import { hexToBigInt } from '../../utils/encoding/fromHex.js'
import { defineBlock } from '../../utils/formatters/block.js'
import {
  defineTransaction,
  formatTransaction,
} from '../../utils/formatters/transaction.js'

type BlockOverrides = {
  transactions: Hash[] | OptimismTransaction[]
  stateRoot: Hash
}
export type OptimismBlock = Assign<Block, BlockOverrides>

type RpcBlockOverrides = {
  transactions: Hash[] | OptimismRpcTransaction[]
  stateRoot: Hash
}
export type OptimismRpcBlock = Assign<RpcBlock, RpcBlockOverrides>

type RpcTransaction = RpcTransaction_ & {
  isSystemTx?: undefined
  mint?: undefined
  sourceHash?: undefined
}
export type OptimismRpcDepositTransaction = TransactionBase<Quantity, Index> &
  FeeValuesEIP1559<Quantity> & {
    isSystemTx?: boolean
    mint?: Hex
    sourceHash: Hex
    type: '0x7e'
  }
export type OptimismRpcTransaction =
  | RpcTransaction
  | OptimismRpcDepositTransaction

type RpcTransactionReceiptOverrides = {
  l1GasPrice: Hex | null
  l1GasUsed: Hex | null
  l1Fee: Hex | null
  l1FeeScalar: Hex | null
}
export type OptimismRpcTransactionReceipt = RpcTransactionReceipt &
  RpcTransactionReceiptOverrides

type Transaction = Transaction_ & {
  isSystemTx?: undefined
  mint?: undefined
  sourceHash?: undefined
}
export type OptimismDepositTransaction = TransactionBase &
  FeeValuesEIP1559 & {
    isSystemTx?: boolean
    mint?: bigint
    sourceHash: Hex
    type: 'deposit'
  }
export type OptimismTransaction = Transaction | OptimismDepositTransaction

type TransactionReceiptOverrides = {
  l1GasPrice: bigint | null
  l1GasUsed: bigint | null
  l1Fee: bigint | null
  l1FeeScalar: number | null
}
export type OptimismTransactionReceipt = TransactionReceipt &
  TransactionReceiptOverrides

export const formattersOptimism = {
  block: /*#__PURE__*/ defineBlock({
    format(args: RpcBlockOverrides): BlockOverrides {
      const transactions = args.transactions?.map((transaction) => {
        if (typeof transaction === 'string') return transaction
        const formatted = formatTransaction(
          transaction as RpcTransaction,
        ) as OptimismTransaction
        if (formatted.typeHex === '0x7e') {
          formatted.isSystemTx = transaction.isSystemTx
          formatted.mint = transaction.mint
            ? hexToBigInt(transaction.mint)
            : undefined
          formatted.sourceHash = transaction.sourceHash
          formatted.type = 'deposit'
        }
        return formatted
      }) as Hash[] | OptimismTransaction[]
      return {
        transactions,
        stateRoot: args.stateRoot,
      }
    },
  }),
  transaction: /*#__PURE__*/ defineTransaction({
    format(args: OptimismRpcTransaction): OptimismTransaction {
      const transaction = {} as OptimismTransaction
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
    format(args: RpcTransactionReceiptOverrides): TransactionReceiptOverrides {
      return {
        l1GasPrice: args.l1GasPrice ? hexToBigInt(args.l1GasPrice) : null,
        l1GasUsed: args.l1GasUsed ? hexToBigInt(args.l1GasUsed) : null,
        l1Fee: args.l1Fee ? hexToBigInt(args.l1Fee) : null,
        l1FeeScalar: args.l1FeeScalar ? Number(args.l1FeeScalar) : null,
      }
    },
  }),
} as const satisfies Formatters
