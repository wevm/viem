import type { Chain } from '../../types/chain.js'
import type { Formatter, Formatters } from '../../types/formatter.js'
import type { RpcTransactionRequest } from '../../types/rpc.js'
import type { TransactionRequest } from '../../types/transaction.js'
import { numberToHex } from '../encoding/toHex.js'

import {
  type ExtractFormatter,
  type Formatted,
  defineFormatter,
} from './format.js'

export type TransactionRequestFormatter<
  TChain extends Chain | undefined = Chain,
> = TChain extends Chain
  ? ExtractFormatter<
      TChain,
      'transactionRequest',
      NonNullable<Formatters['transactionRequest']>
    >
  : Formatters['transactionRequest']

export type FormattedTransactionRequest<
  TFormatter extends Formatter | undefined = Formatter,
> = Formatted<TFormatter, RpcTransactionRequest>

export function formatTransactionRequest(
  transactionRequest: Partial<TransactionRequest>,
) {
  return {
    ...transactionRequest,
    gas:
      typeof transactionRequest.gas !== 'undefined'
        ? numberToHex(transactionRequest.gas)
        : undefined,
    gasPrice:
      typeof transactionRequest.gasPrice !== 'undefined'
        ? numberToHex(transactionRequest.gasPrice)
        : undefined,
    maxFeePerGas:
      typeof transactionRequest.maxFeePerGas !== 'undefined'
        ? numberToHex(transactionRequest.maxFeePerGas)
        : undefined,
    maxPriorityFeePerGas:
      typeof transactionRequest.maxPriorityFeePerGas !== 'undefined'
        ? numberToHex(transactionRequest.maxPriorityFeePerGas)
        : undefined,
    nonce:
      typeof transactionRequest.nonce !== 'undefined'
        ? numberToHex(transactionRequest.nonce)
        : undefined,
    value:
      typeof transactionRequest.value !== 'undefined'
        ? numberToHex(transactionRequest.value)
        : undefined,
  } as RpcTransactionRequest
}

export const defineTransactionRequest = defineFormatter({
  format: formatTransactionRequest,
})
