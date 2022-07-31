import { ProviderAccount } from '../accounts/provider'
import { TransactionRequest } from '../types/ethereum-provider'

type SendTransactionArgs = { request: TransactionRequest }

export async function sendTransaction(
  providerAccount: ProviderAccount,
  // TODO: make `request` friendly
  { request }: SendTransactionArgs,
) {
  if (providerAccount.type !== 'providerAccount') throw new Error('TODO')

  // TODO: make response friendly
  return await providerAccount.request({
    method: 'eth_sendTransaction',
    params: [request],
  })
}
