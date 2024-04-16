import type { Hash } from '../../types/misc.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ChainEIP712 } from '../types/chain.js'
import type { Account } from '../../types/account.js'
import type { PublicZkSyncRpcSchema } from '../../types/eip1193.js'


export type MessageProof = {
  id: number
  proof: string[]
  root: string
}

export type GetLogProofParameters = {
  txHash: Hash
  index?: number
}

export async function getLogProof<chain extends ChainEIP712 | undefined,account extends Account | undefined>(
  client: Client<Transport, chain, account, PublicZkSyncRpcSchema>,
  parameters: GetLogProofParameters,
): Promise<MessageProof | null> {
  const result = await client.request({
    method: 'zks_getL2ToL1LogProof',
    params: [parameters.txHash, parameters.index],
  })
  return result
}
