import { AccountProvider } from '../../providers'
import { TransactionRequest as TransactionRequestRpc } from '../../types/ethereum-provider'
import { numberToHex } from '../../utils'
import { InvalidProviderError } from '../errors'

export type TransactionRequest = {
  /** Contract code or a hashed method call with encoded args */
  data?: TransactionRequestRpc['data']
  /** Transaction sender */
  from: TransactionRequestRpc['from']
  /** Gas provided for transaction execution */
  gas?: bigint
  /** Unique number identifying this transaction */
  nonce?: bigint
  /** Transaction recipient */
  to: TransactionRequestRpc['to']
  /** Value sent with this transaction (in wei) */
  value?: bigint
} & (
  | {
      /** Base fee per gas. */
      gasPrice?: bigint
      maxFeePerGas?: never
      maxPriorityFeePerGas?: never
    }
  | {
      gasPrice?: never
      /** Total fee per gas in wei (gasPrice/baseFeePerGas + maxPriorityFeePerGas). */
      maxFeePerGas?: bigint
      /** Max priority fee per gas (in wei). */
      maxPriorityFeePerGas?: bigint
    }
)

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

  const rpcRequest = parseTransactionRequest(request)

  const hash = await provider.request({
    method: 'eth_sendTransaction',
    params: [rpcRequest],
  })
  return { hash }
}

function parseTransactionRequest({
  gas,
  gasPrice,
  maxFeePerGas,
  maxPriorityFeePerGas,
  nonce,
  value,
  ...request
}: TransactionRequest) {
  const rpcRequest: TransactionRequestRpc = { ...request }
  if (gas !== undefined) rpcRequest.gas = numberToHex(gas)
  if (nonce !== undefined) rpcRequest.nonce = numberToHex(nonce)
  if (value !== undefined) rpcRequest.value = numberToHex(value)
  if (gasPrice !== undefined) rpcRequest.gasPrice = numberToHex(gasPrice)
  if (maxFeePerGas !== undefined)
    rpcRequest.maxFeePerGas = numberToHex(maxFeePerGas)
  if (maxPriorityFeePerGas !== undefined)
    rpcRequest.maxPriorityFeePerGas = numberToHex(maxPriorityFeePerGas)
  return rpcRequest
}
