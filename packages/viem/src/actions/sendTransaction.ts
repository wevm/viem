import { ProviderSigner } from '../signers/createProviderSigner'
import { TransactionRequest } from '../types/ethereum-provider'

export async function sendTransaction(
  signer: ProviderSigner,
  request: TransactionRequest,
) {
  return await signer.request({
    method: 'eth_sendTransaction',
    params: [request],
  })
}
