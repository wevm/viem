import { RpcTransactionRequest, TransactionRequest } from '../../types'
import { numberToHex } from '../number'

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
  let request: RpcTransactionRequest = {
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
