import type { PublicClient, Transport } from '../../clients'
import type { Chain, Filter } from '../../types'

export type CreatePendingTransactionFilterReturnType = Filter<'transaction'>

export async function createPendingTransactionFilter<
  TChain extends Chain | undefined,
  TTransport extends Transport,
>(
  client: PublicClient<TChain, TTransport>,
): Promise<CreatePendingTransactionFilterReturnType> {
  const id = await client.request({
    method: 'eth_newPendingTransactionFilter',
  })
  return { id, type: 'transaction' }
}
