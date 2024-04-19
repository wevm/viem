import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'
import type { PublicZkSyncRpcSchema } from '../types/zksRpcScheme.js'

export type MessageProof = {
  id: number
  proof: string[]
  root: string
}

export type GetLogProofParameters = {
  txHash: Hash
  index?: number
}

export async function getLogProof<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount, PublicZkSyncRpcSchema>,
  parameters: GetLogProofParameters,
): Promise<MessageProof | null> {
  const result = await client.request({
    method: 'zks_getL2ToL1LogProof',
    params: [parameters.txHash, parameters.index],
  })
  return result
}
