import { ProviderAccount } from '../accounts/createProviderAccount'
import { TransactionRequest } from '../types/ethereum-provider'

export async function sendTransaction(
  provider: ProviderAccount,
  request: TransactionRequest,
) {
  return await provider.request({
    method: 'eth_sendTransaction',
    params: [request],
  })
}
