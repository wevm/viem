import { AccountProvider } from '../../providers'
import { TransactionRequest as TransactionRequestRpc } from '../../types/ethereum-provider'
import { BaseError, numberToHex } from '../../utils'
import { InvalidProviderError } from '../errors'

export type TransactionRequest = TransactionRequestRpc<bigint>

export type SendTransactionArgs = {
  request: TransactionRequest
}

export type SendTransactionResponse = { hash: `0x${string}` }

export async function sendTransaction(
  provider: AccountProvider,
  { request }: SendTransactionArgs,
): Promise<SendTransactionResponse> {
  if (provider.type !== 'accountProvider')
    throw new InvalidProviderError({
      givenProvider: provider.type,
      expectedProvider: 'accountProvider',
    })

  if (
    request.maxFeePerGas !== undefined &&
    request.maxPriorityFeePerGas !== undefined &&
    request.maxFeePerGas < request.maxPriorityFeePerGas
  )
    throw new BaseError({
      humanMessage: 'Gas values provided are invalid.',
      details: 'maxFeePerGas cannot be less than maxPriorityFeePerGas',
    })

  const rpcRequest = serializeTransactionRequest(request)

  const hash = await provider.request({
    method: 'eth_sendTransaction',
    params: [rpcRequest],
  })
  return { hash }
}

///////////////////////////////////////////////////////

// Serializers

function serializeTransactionRequest({
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
  let request: TransactionRequestRpc = {
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
