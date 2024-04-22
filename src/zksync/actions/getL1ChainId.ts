import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import type { PublicZkSyncRpcSchema } from '../types/zksRpcScheme.js'

export async function getL1ChainId<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount, PublicZkSyncRpcSchema>,
): Promise<Hex> {
  const result = await client.request({ method: 'zks_L1ChainId' })
  return result
}
