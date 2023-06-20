import type { Hex } from '../../types/misc.js'
import { hexToBigInt } from '../encoding/fromHex.js'
import { numberToHex } from '../encoding/toHex.js'
import { defineBlock } from './block.js'
import { defineTransaction } from './transaction.js'
import { defineTransactionReceipt } from './transactionReceipt.js'
import { defineTransactionRequest } from './transactionRequest.js'
import type { Address } from 'abitype'

export const celoFormatters = {
  block: /*#__PURE__*/ defineBlock(
    (args: {
      randomness: {
        committed: Hex
        revealed: Hex
      }
    }) => ({
      difficulty: undefined,
      gasLimit: undefined,
      mixHash: undefined,
      nonce: undefined,
      randomness: args.randomness,
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
