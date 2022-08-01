import { AccountProvider } from '../providers/wallet/account/accountProvider'
import { TransactionRequest } from '../types/ethereum-provider'

type SendTransactionArgs = { request: TransactionRequest }

export async function sendTransaction(
  provider: AccountProvider,
  // TODO: make `request` friendly
  { request }: SendTransactionArgs,
) {
  if (provider.type !== 'accountProvider') throw new Error('TODO')

  // TODO: make response friendly
  return await provider.request({
    method: 'eth_sendTransaction',
    params: [request],
  })
}
