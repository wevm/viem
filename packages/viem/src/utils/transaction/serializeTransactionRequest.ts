import { TransactionRequest as ProviderTransactionRequest } from '../../types/ethereum-provider'
import { numberToHex } from '../number'

export type TransactionRequest = ProviderTransactionRequest<bigint>

export function serializeTransactionRequest({
  accessList,
  data,
  from,
  gas,
  gasPrice,
  maxFeePerGas,
  maxPriorityFeePerGas,
  nonce,
  to,
  value,
}: TransactionRequest) {
  let request: ProviderTransactionRequest = {
    accessList,
    data,
    from,
    to,
  }
  if (gas !== undefined) request.gas = numberToHex(gas)
  if (nonce !== undefined) request.nonce = numberToHex(nonce)
  if (value !== undefined) request.value = numberToHex(value)
  if (gasPrice !== undefined) request.gasPrice = numberToHex(gasPrice)
  if (maxFeePerGas !== undefined)
    request.maxFeePerGas = numberToHex(maxFeePerGas)
  if (maxPriorityFeePerGas !== undefined)
    request.maxPriorityFeePerGas = numberToHex(maxPriorityFeePerGas)
  return request
}
