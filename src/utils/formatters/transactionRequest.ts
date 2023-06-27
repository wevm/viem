import type { Chain } from '../../types/chain.js'
import type { ExtractFormatterParameters } from '../../types/formatter.js'
import type { RpcTransactionRequest } from '../../types/rpc.js'
import type { TransactionRequest } from '../../types/transaction.js'
import { numberToHex } from '../encoding/toHex.js'
import { defineFormatter } from './formatter.js'

export type FormattedTransactionRequest<
  TChain extends Chain | undefined = Chain | undefined,
> = ExtractFormatterParameters<TChain, 'transactionRequest', TransactionRequest>

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

export const defineTransactionRequest = /*#__PURE__*/ defineFormatter(
  'transactionRequest',
  formatTransactionRequest,
)
