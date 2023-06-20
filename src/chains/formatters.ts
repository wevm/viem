import type { Address } from 'abitype'

import type { Block } from '../types/block.js'
import type { Hex } from '../types/misc.js'
import type { Transaction } from '../types/transaction.js'
import { hexToBigInt } from '../utils/encoding/fromHex.js'
import { numberToHex } from '../utils/encoding/toHex.js'
import { defineBlock } from '../utils/formatters/block.js'
import { defineTransaction } from '../utils/formatters/transaction.js'
import { defineTransactionReceipt } from '../utils/formatters/transactionReceipt.js'
import { defineTransactionRequest } from '../utils/formatters/transactionRequest.js'

export const celoFormatters = {
  block: /*#__PURE__*/ defineBlock(
    (args: {
      randomness: {
        committed: Hex
        revealed: Hex
      }
      transactions: Block<
        bigint,
        Transaction & {
          feeCurrency: Address | null
          gatewayFee: bigint | null
          gatewayFeeRecipient: Address | null
        }
      >['transactions']
    }) => ({
      difficulty: undefined,
      gasLimit: undefined,
      mixHash: undefined,
      nonce: undefined,
      randomness: args.randomness,
      transactions: args.transactions,
      uncles: undefined,
    }),
  ),
  transaction: /*#__PURE__*/ defineTransaction(
    (args: {
      feeCurrency: Address | null
      gatewayFee: `0x${string}` | null
      gatewayFeeRecipient: Address | null
    }) => ({
      feeCurrency: args.feeCurrency,
      gatewayFee: args.gatewayFee ? hexToBigInt(args.gatewayFee) : null,
      gatewayFeeRecipient: args.gatewayFeeRecipient,
    }),
  ),
  transactionReceipt: /*#__PURE__*/ defineTransactionReceipt(
    (args: {
      feeCurrency: Address | null
      gatewayFee: `0x${string}` | null
      gatewayFeeRecipient: Address | null
    }) => ({
      feeCurrency: args.feeCurrency,
      gatewayFee: args.gatewayFee ? hexToBigInt(args.gatewayFee) : null,
      gatewayFeeRecipient: args.gatewayFeeRecipient,
    }),
  ),
  transactionRequest: /*#__PURE__*/ defineTransactionRequest(
    (args: {
      feeCurrency?: Address
      gatewayFee?: bigint
      gatewayFeeRecipient?: Address
    }) => ({
      feeCurrency: args.feeCurrency,
      gatewayFee:
        typeof args.gatewayFee !== 'undefined'
          ? numberToHex(args.gatewayFee)
          : undefined,
      gatewayFeeRecipient: args.gatewayFeeRecipient,
    }),
  ),
} as const
