import type { Address } from 'abitype'

import { type Formatters } from '../../types/formatter.js'
import type { Hash, Hex } from '../../types/misc.js'
import type { RpcTransaction } from '../../types/rpc.js'
import type { Transaction } from '../../types/transaction.js'
import { hexToBigInt } from '../../utils/encoding/fromHex.js'
import { numberToHex } from '../../utils/encoding/toHex.js'
import { defineBlock } from '../../utils/formatters/block.js'
import {
  defineTransaction,
  formatTransaction,
} from '../../utils/formatters/transaction.js'
import { defineTransactionReceipt } from '../../utils/formatters/transactionReceipt.js'
import { defineTransactionRequest } from '../../utils/formatters/transactionRequest.js'

export type CeloFormatOverrides = {
  RpcBlock: {
    randomness: {
      committed: Hex
      revealed: Hex
    }
    transactions:
      | Hash[]
      | (RpcTransaction & {
          feeCurrency: Address | null
          gatewayFee: Hex | null
          gatewayFeeRecipient: Address | null
        })[]
  }
  RpcTransaction: {
    feeCurrency: Address | null
    gatewayFee: Hex | null
    gatewayFeeRecipient: Address | null
  }
  RpcTransactionReceipt: {
    feeCurrency: Address | null
    gatewayFee: Hex | null
    gatewayFeeRecipient: Address | null
  }
  TransactionRequest: {
    feeCurrency?: Address
    gatewayFee?: bigint
    gatewayFeeRecipient?: Address
  }
  Transaction: {
    feeCurrency: Address | null
    gatewayFee: bigint | null
    gatewayFeeRecipient: Address | null
  }
}

export const formattersCelo = {
  block: /*#__PURE__*/ defineBlock({
    exclude: ['difficulty', 'gasLimit', 'mixHash', 'nonce', 'uncles'],
    format(args: CeloFormatOverrides['RpcBlock']) {
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
      }) as Hash[] | (Transaction & CeloFormatOverrides['Transaction'])[]
      return {
        randomness: args.randomness,
        transactions,
      }
    },
  }),
  transaction: /*#__PURE__*/ defineTransaction({
    format(args: CeloFormatOverrides['RpcTransaction']) {
      return {
        feeCurrency: args.feeCurrency,
        gatewayFee: args.gatewayFee ? hexToBigInt(args.gatewayFee) : null,
        gatewayFeeRecipient: args.gatewayFeeRecipient,
      }
    },
  }),
  transactionReceipt: /*#__PURE__*/ defineTransactionReceipt({
    format(args: CeloFormatOverrides['RpcTransactionReceipt']) {
      return {
        feeCurrency: args.feeCurrency,
        gatewayFee: args.gatewayFee ? hexToBigInt(args.gatewayFee) : null,
        gatewayFeeRecipient: args.gatewayFeeRecipient,
      }
    },
  }),
  transactionRequest: /*#__PURE__*/ defineTransactionRequest({
    format(args: CeloFormatOverrides['TransactionRequest']) {
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
