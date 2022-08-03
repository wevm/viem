import { AccountProvider } from '../../providers/account/accountProvider'
import { TransactionRequest } from '../../types/ethereum-provider'
import { InvalidProviderError } from '../../utils/errors'

export type SendTransactionArgs = { request: TransactionRequest }

export type SendTransactionResponse = { hash: `0x${string}` }

export async function sendTransaction(
  provider: AccountProvider,
  // TODO: make `request` friendly
  { request }: SendTransactionArgs,
): Promise<SendTransactionResponse> {
  if (provider.type !== 'accountProvider')
    throw new InvalidProviderError({
      givenProvider: provider.type,
      expectedProvider: 'accountProvider',
    })

  const hash = await provider.request({
    method: 'eth_sendTransaction',
    params: [request],
  })
  return { hash }
}
