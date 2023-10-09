import { type ChainFormatters } from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'
import type { RpcTransaction } from '../../types/rpc.js'
import { hexToBigInt } from '../../utils/encoding/fromHex.js'
import { defineBlock } from '../../utils/formatters/block.js'
import {
  defineTransaction,
  formatTransaction,
} from '../../utils/formatters/transaction.js'
import { defineTransactionReceipt } from '../../utils/formatters/transactionReceipt.js'
import type {
  ZkSyncBlockOverrides,
  ZkSyncTransaction,
  ZkSyncRpcTransaction,
  ZkSyncTransactionReceiptOverrides,
  ZkSyncRpcTransactionReceiptOverrides
} from './types.js'

export const formattersZkSync = {
  block: /*#__PURE__*/ defineBlock({
    format(
      args: ZkSyncBlockOverrides & {
        transactions: Hash[] | ZkSyncRpcTransaction[]
      },
    ): ZkSyncBlockOverrides & {
      transactions: Hash[] | ZkSyncTransaction[]
    } {
      const transactions = args.transactions?.map((transaction) => {
        if (typeof transaction === 'string') return transaction
        return {
          ...formatTransaction(transaction as RpcTransaction),
          gasPerPubdata: transaction.customData?.gasPerPubdata,
          customSignature: transaction.customData?.customSignature,
          paymasterParams: transaction.customData?.paymasterParams,
          factoryDeps: transaction.customData?.factoryDeps
        }
      }) as Hash[] | ZkSyncTransaction[]
      return {
        l1BatchNumber: args.l1BatchNumber,
        l1BatchTimestamp: args.l1BatchTimestamp,
        transactions,
      }
    },
  }),
  transaction: /*#__PURE__*/ defineTransaction({
    format(args: ZkSyncRpcTransaction): ZkSyncTransaction {
      return {
        gasPerPubdata: args.customData?.gasPerPubdata,
        customSignature: args.customData?.customSignature,
        paymasterParams: args.customData?.paymasterParams,
        factoryDeps: args.customData?.factoryDeps
      } as ZkSyncTransaction
    },
  }),
  // TODO: Add transaction request?
  // https://era.zksync.io/docs/api/js/types.html#transactionreceipt
  transactionReceipt: /*#__PURE__*/ defineTransactionReceipt({
    format(
      args: ZkSyncRpcTransactionReceiptOverrides,
    ): ZkSyncTransactionReceiptOverrides {
      return {
        l1BatchNumber: args.l1BatchNumber
          ? hexToBigInt(args.l1BatchNumber)
          : null,
        l1BatchTxIndex: args.l1BatchTxIndex
          ? hexToBigInt(args.l1BatchTxIndex)
          : null,
        // We should return logs, the the default TransactionReceipt should also have this,
        // not sure it will give an error. https://era.zksync.io/docs/api/js/types.html#transactionreceipt
        //logs: args.logs,
        l1ToL1Logs: args.l1ToL1Logs,
      }
    },
  }),
} as const satisfies ChainFormatters
