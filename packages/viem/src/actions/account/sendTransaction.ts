import { AccountProvider } from '../../providers'
import { TransactionRequest as TransactionRequestRpc } from '../../types/ethereum-provider'
import { InvalidProviderError, numberToHex } from '../../utils'

export type TransactionRequest = {
  /** Contract code or a hashed method call with encoded args */
  data?: TransactionRequestRpc['data']
  /** Transaction sender */
  from: TransactionRequestRpc['from']
  /** Gas provided for transaction execution */
  gas?: bigint
  /** Price of each gas used (in wei) */
  gasPrice?: bigint
  /** Unique number identifying this transaction */
  nonce?: bigint
  /** Transaction recipient */
  to: TransactionRequestRpc['to']
  /** Value sent with this transaction (in wei) */
  value?: bigint
}

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

function parseTransactionRequest(request: TransactionRequest) {
  return {
    ...request,
    gas: request.gas !== undefined ? numberToHex(request.gas) : undefined,
    gasPrice:
      request.gasPrice !== undefined
        ? numberToHex(request.gasPrice)
        : undefined,
    nonce: request.nonce !== undefined ? numberToHex(request.nonce) : undefined,
    value: request.value !== undefined ? numberToHex(request.value) : undefined,
  }
}
