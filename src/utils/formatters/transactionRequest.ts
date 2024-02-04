import type { ErrorType } from '../../errors/utils.js'
import type {
  Chain,
  ExtractChainFormatterParameters,
} from '../../types/chain.js'
import type { ByteArray } from '../../types/misc.js'
import type { RpcTransactionRequest } from '../../types/rpc.js'
import type { TransactionRequest } from '../../types/transaction.js'
import { bytesToHex, numberToHex } from '../encoding/toHex.js'
import { type DefineFormatterErrorType, defineFormatter } from './formatter.js'

export type FormattedTransactionRequest<
  TChain extends Chain | undefined = Chain | undefined,
> = ExtractChainFormatterParameters<
  TChain,
  'transactionRequest',
  TransactionRequest
>

export const rpcTransactionType = {
  legacy: '0x0',
  eip2930: '0x1',
  eip1559: '0x2',
  eip4844: '0x3',
} as const

export type FormatTransactionRequestErrorType = ErrorType

export function formatTransactionRequest(request: Partial<TransactionRequest>) {
  const rpcRequest = { ...request } as RpcTransactionRequest

  if (
    typeof request.blobs !== 'undefined' &&
    typeof request.blobs[0] !== 'string'
  )
    rpcRequest.blobs = (request.blobs as ByteArray[]).map((x) => bytesToHex(x))
  if (typeof request.gas !== 'undefined')
    rpcRequest.gas = numberToHex(request.gas)
  if (typeof request.gasPrice !== 'undefined')
    rpcRequest.gasPrice = numberToHex(request.gasPrice)
  if (typeof request.maxFeePerBlobGas !== 'undefined')
    rpcRequest.maxFeePerBlobGas = numberToHex(request.maxFeePerBlobGas)
  if (typeof request.maxFeePerGas !== 'undefined')
    rpcRequest.maxFeePerGas = numberToHex(request.maxFeePerGas)
  if (typeof request.maxPriorityFeePerGas !== 'undefined')
    rpcRequest.maxPriorityFeePerGas = numberToHex(request.maxPriorityFeePerGas)
  if (typeof request.nonce !== 'undefined')
    rpcRequest.nonce = numberToHex(request.nonce)
  if (typeof request.type !== 'undefined')
    rpcRequest.type = rpcTransactionType[request.type]
  if (typeof request.value !== 'undefined')
    rpcRequest.value = numberToHex(request.value)

  return rpcRequest
}

export type DefineTransactionRequestErrorType =
  | DefineFormatterErrorType
  | ErrorType

export const defineTransactionRequest = /*#__PURE__*/ defineFormatter(
  'transactionRequest',
  formatTransactionRequest,
)
