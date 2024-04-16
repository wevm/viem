import type { Account } from '../../types/account.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ChainEIP712 } from '../types/chain.js'
import type { PublicZkSyncRpcSchema } from '../../types/eip1193.js'

export async function getL1BatchNumber<chain extends ChainEIP712 | undefined,
account extends Account | undefined,
>(
  client: Client<Transport, chain, account, PublicZkSyncRpcSchema>,
): Promise<number> {
  const result = await client.request({ method: 'zks_L1BatchNumber' })
  return result
}
