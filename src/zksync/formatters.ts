import type { ChainFormatters } from '../types/chain.js'
import type { RpcBlock, RpcTransaction } from '../types/rpc.js'
import { hexToBigInt, hexToNumber } from '../utils/encoding/fromHex.js'
import { hexToBytes } from '../utils/encoding/toBytes.js'
import { toHex } from '../utils/encoding/toHex.js'
import { formatBlock } from '../utils/formatters/block.js'
import { formatLog } from '../utils/formatters/log.js'
import {
  defineTransaction,
  formatTransaction,
} from '../utils/formatters/transaction.js'
import { defineTransactionReceipt } from '../utils/formatters/transactionReceipt.js'
import { defineTransactionRequest } from '../utils/formatters/transactionRequest.js'
import { gasPerPubdataDefault } from './constants/number.js'
import type { ZksyncBlock, ZksyncRpcBlock } from './types/block.js'
import type { ZksyncL2ToL1Log, ZksyncLog } from './types/log.js'
import type {
  ZksyncRpcTransaction,
  ZksyncRpcTransactionReceipt,
  ZksyncRpcTransactionRequest,
  ZksyncTransaction,
  ZksyncTransactionReceipt,
  ZksyncTransactionRequest,
} from './types/transaction.js'

const block = {
  exclude: undefined as [] | undefined,
  format: (args: ZksyncRpcBlock, action?: string | undefined) => {
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
      const formatted = {
        ...transaction,
        ...formatZksyncTransaction(
          args.transactions![i] as ZksyncRpcTransaction,
        ),
      } as ZksyncTransaction
      if (formatted.typeHex === '0x71') formatted.type = 'eip712'
      else if (formatted.typeHex === '0xff') formatted.type = 'priority'
      return formatted
    })
    return {
      ...base,
      l1BatchNumber: args.l1BatchNumber
        ? hexToBigInt(args.l1BatchNumber)
        : null,
      l1BatchTimestamp: args.l1BatchTimestamp
        ? hexToBigInt(args.l1BatchTimestamp)
        : null,
      transactions,
    } as ZksyncBlock
  },
  type: 'block' as const,
}

export const formatters = {
  block,
  transaction: /*#__PURE__*/ defineTransaction({
    format: formatZksyncTransaction,
  }),
  transactionReceipt: /*#__PURE__*/ defineTransactionReceipt({
    format(args: ZksyncRpcTransactionReceipt): ZksyncTransactionReceipt {
      return {
        l1BatchNumber: args.l1BatchNumber
          ? hexToBigInt(args.l1BatchNumber)
          : null,
        l1BatchTxIndex: args.l1BatchTxIndex
          ? hexToBigInt(args.l1BatchTxIndex)
          : null,
        logs: args.logs.map((log) => {
          return {
            ...formatLog(log),
            l1BatchNumber: log.l1BatchNumber
              ? hexToBigInt(log.l1BatchNumber)
              : null,
            transactionLogIndex: hexToNumber(log.transactionLogIndex),
            logType: log.logType,
          }
        }) as ZksyncLog[],
        l2ToL1Logs: args.l2ToL1Logs.map((l2ToL1Log) => {
          return {
            blockNumber: hexToBigInt(l2ToL1Log.blockHash),
            blockHash: l2ToL1Log.blockHash,
            l1BatchNumber: l2ToL1Log.l1BatchNumber
              ? hexToBigInt(l2ToL1Log.l1BatchNumber)
              : null,
            transactionIndex: hexToBigInt(l2ToL1Log.transactionIndex),
            shardId: hexToBigInt(l2ToL1Log.shardId),
            isService: l2ToL1Log.isService,
            sender: l2ToL1Log.sender,
            key: l2ToL1Log.key,
            value: l2ToL1Log.value,
            transactionHash: l2ToL1Log.transactionHash,
            logIndex: hexToBigInt(l2ToL1Log.logIndex),
          }
        }) as ZksyncL2ToL1Log[],
      } as ZksyncTransactionReceipt
    },
  }),
  transactionRequest: /*#__PURE__*/ defineTransactionRequest({
    exclude: [
      'customSignature',
      'factoryDeps',
      'gasPerPubdata',
      'paymaster',
      'paymasterInput',
    ],
    format(args: ZksyncTransactionRequest): ZksyncRpcTransactionRequest {
      if (
        args.gasPerPubdata ||
        (args.paymaster && args.paymasterInput) ||
        args.factoryDeps ||
        args.customSignature
      )
        return {
          eip712Meta: {
            ...(args.gasPerPubdata
              ? { gasPerPubdata: toHex(args.gasPerPubdata) }
              : { gasPerPubdata: toHex(gasPerPubdataDefault) }),
            ...(args.paymaster && args.paymasterInput
              ? {
                  paymasterParams: {
                    paymaster: args.paymaster,
                    paymasterInput: Array.from(hexToBytes(args.paymasterInput)),
                  },
                }
              : {}),
            ...(args.factoryDeps
              ? {
                  factoryDeps: args.factoryDeps.map((dep) =>
                    Array.from(hexToBytes(dep)),
                  ),
                }
              : {}),
            ...(args.customSignature
              ? {
                  customSignature: Array.from(hexToBytes(args.customSignature)),
                }
              : {}),
          },
          type: '0x71',
        } as unknown as ZksyncRpcTransactionRequest
      return {} as ZksyncRpcTransactionRequest
    },
  }),
} as const satisfies ChainFormatters

function formatZksyncTransaction(
  args: ZksyncRpcTransaction,
): ZksyncTransaction {
  const transaction = {} as ZksyncTransaction
  if (args.type === '0x71') transaction.type = 'eip712'
  else if (args.type === '0xff') transaction.type = 'priority'
  return {
    ...transaction,
    l1BatchNumber: args.l1BatchNumber ? hexToBigInt(args.l1BatchNumber) : null,
    l1BatchTxIndex: args.l1BatchTxIndex
      ? hexToBigInt(args.l1BatchTxIndex)
      : null,
  } as ZksyncTransaction
}
