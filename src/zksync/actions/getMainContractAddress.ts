import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { PublicZkSyncRpcSchema } from '../types/zksRpcScheme.js'

export async function getMainContractAddress<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account, PublicZkSyncRpcSchema>,
): Promise<Address> {
  const address = await client.request({ method: 'zks_getMainContract' })
  return address
}
