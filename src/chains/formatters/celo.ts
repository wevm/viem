import type { Address } from 'abitype'

import type { Block } from '../../types/block.js'
import { type Formatters } from '../../types/formatter.js'
import type { Hash, Hex } from '../../types/misc.js'
import type {
  RpcBlock,
  RpcTransaction,
  RpcTransactionReceipt,
  RpcTransactionRequest,
} from '../../types/rpc.js'
import type {
  Transaction,
  TransactionReceipt,
  TransactionRequest,
} from '../../types/transaction.js'
import { hexToBigInt } from '../../utils/encoding/fromHex.js'
import { numberToHex } from '../../utils/encoding/toHex.js'
import { defineBlock } from '../../utils/formatters/block.js'
import {
  defineTransaction,
  formatTransaction,
} from '../../utils/formatters/transaction.js'
import { defineTransactionReceipt } from '../../utils/formatters/transactionReceipt.js'
import { defineTransactionRequest } from '../../utils/formatters/transactionRequest.js'

type BlockOverrides = {
  randomness: {
    committed: Hex
    revealed: Hex
  }
  transactions: Hash[] | CeloTransaction[]
}
export type CeloBlock = Block & BlockOverrides

type RpcBlockOverrides = {
  randomness: {
    committed: Hex
    revealed: Hex
  }
  transactions: Hash[] | CeloRpcTransaction[]
}
export type CeloRpcBlock = RpcBlock & RpcBlockOverrides

type RpcTransactionOverrides = {
  feeCurrency: Address | null
  gatewayFee: Hex | null
  gatewayFeeRecipient: Address | null
}
export type CeloRpcTransaction = RpcTransaction & RpcTransactionOverrides

type RpcTransactionReceiptOverrides = {
  feeCurrency: Address | null
  gatewayFee: Hex | null
  gatewayFeeRecipient: Address | null
}
export type CeloRpcTransactionReceipt = RpcTransactionReceipt &
  RpcTransactionReceiptOverrides

type RpcTransactionRequestOverrides = {
  feeCurrency?: Address
  gatewayFee?: Hex
  gatewayFeeRecipient?: Address
}
export type CeloRpcTransactionRequest = RpcTransactionRequest &
  RpcTransactionRequestOverrides

type TransactionOverrides = {
  feeCurrency: Address | null
  gatewayFee: bigint | null
  gatewayFeeRecipient: Address | null
}
export type CeloTransaction = Transaction & TransactionOverrides

type TransactionReceiptOverrides = {
  feeCurrency: Address | null
  gatewayFee: bigint | null
  gatewayFeeRecipient: Address | null
}
export type CeloTransactionReceipt = TransactionReceipt &
  TransactionReceiptOverrides

type TransactionRequestOverrides = {
  feeCurrency?: Address
  gatewayFee?: bigint
  gatewayFeeRecipient?: Address
}
export type CeloTransactionRequest = TransactionRequest &
  TransactionRequestOverrides

export const formattersCelo = {
  block: /*#__PURE__*/ defineBlock({
    exclude: ['difficulty', 'gasLimit', 'mixHash', 'nonce', 'uncles'],
    format(args: RpcBlockOverrides): BlockOverrides {
      const transactions = args.transactions?.map((transaction) => {
        if (typeof transaction === 'string') return transaction
        return {
          ...formatTransaction(transaction),
          feeCurrency: transaction.feeCurrency,
          gatewayFee: transaction.gatewayFee
            ? hexToBigInt(transaction.gatewayFee)
            : null,
          gatewayFeeRecipient: transaction.gatewayFeeRecipient,
        }
      }) as Hash[] | CeloTransaction[]
      return {
        randomness: args.randomness,
        transactions,
      }
    },
  }),
  transaction: /*#__PURE__*/ defineTransaction({
    format(args: RpcTransactionOverrides): TransactionOverrides {
      return {
        feeCurrency: args.feeCurrency,
        gatewayFee: args.gatewayFee ? hexToBigInt(args.gatewayFee) : null,
        gatewayFeeRecipient: args.gatewayFeeRecipient,
      }
    },
  }),
  transactionReceipt: /*#__PURE__*/ defineTransactionReceipt({
    format(args: RpcTransactionReceiptOverrides): TransactionReceiptOverrides {
      return {
        feeCurrency: args.feeCurrency,
        gatewayFee: args.gatewayFee ? hexToBigInt(args.gatewayFee) : null,
        gatewayFeeRecipient: args.gatewayFeeRecipient,
      }
    },
  }),
  transactionRequest: /*#__PURE__*/ defineTransactionRequest({
    format(args: TransactionRequestOverrides): RpcTransactionRequestOverrides {
      return {
        feeCurrency: args.feeCurrency,
        gatewayFee:
          typeof args.gatewayFee !== 'undefined'
            ? numberToHex(args.gatewayFee)
            : undefined,
        gatewayFeeRecipient: args.gatewayFeeRecipient,
      }
    },
  }),
} as const satisfies Formatters
