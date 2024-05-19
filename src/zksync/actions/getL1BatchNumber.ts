import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import type { PublicZkSyncRpcSchema } from '../types/eip1193.js'

export type GetL1BatchNumberReturnType = Hex

export async function getL1BatchNumber<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount, PublicZkSyncRpcSchema>,
): Promise<GetL1BatchNumberReturnType> {
  const result = await client.request({ method: 'zks_L1BatchNumber' })
  return result
}
