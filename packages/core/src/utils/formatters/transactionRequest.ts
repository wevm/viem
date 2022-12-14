import type { Chain, Formatter } from '../../chains'
import type { RpcTransactionRequest, TransactionRequest } from '../../types'
import type { ExtractFormatter, FormatOptions, Formatted } from '../format'
import { format } from '../format'
import { numberToHex } from '../number'

export type TransactionRequestFormatter<TChain extends Chain = Chain> =
  ExtractFormatter<TChain, 'transactionRequest'>

type FormatTransactionRequestOptions = {
  formatter?: FormatOptions<
    TransactionRequest,
    RpcTransactionRequest
  >['formatter']
}

export type FormattedTransactionRequest<
  TFormatter extends Formatter | undefined = Formatter,
> = Formatted<TransactionRequest, RpcTransactionRequest, TFormatter>

export function formatTransactionRequest<
  TFormatter extends Formatter | undefined = Formatter,
>(
  transactionRequest_: TransactionRequest,
  { formatter }: FormatTransactionRequestOptions = {},
): FormattedTransactionRequest<TFormatter> {
  return format<TransactionRequest, RpcTransactionRequest, TFormatter>(
    transactionRequest_,
    {
      replacer: {
        gas: (transactionRequest) =>
          typeof transactionRequest.gas !== 'undefined'
            ? numberToHex(transactionRequest.gas)
            : undefined,
        gasPrice: (transactionRequest) =>
          typeof transactionRequest.gasPrice !== 'undefined'
            ? numberToHex(transactionRequest.gasPrice)
            : undefined,
        maxFeePerGas: (transactionRequest) =>
          typeof transactionRequest.maxFeePerGas !== 'undefined'
            ? numberToHex(transactionRequest.maxFeePerGas)
            : undefined,
        maxPriorityFeePerGas: (transactionRequest) =>
          typeof transactionRequest.maxPriorityFeePerGas !== 'undefined'
            ? numberToHex(transactionRequest.maxPriorityFeePerGas)
            : undefined,
        nonce: (transactionRequest) =>
          typeof transactionRequest.nonce !== 'undefined'
            ? numberToHex(transactionRequest.nonce)
            : undefined,
        value: (transactionRequest) =>
          typeof transactionRequest.value !== 'undefined'
            ? numberToHex(transactionRequest.value)
            : undefined,
      },
      formatter,
    },
  )
}
