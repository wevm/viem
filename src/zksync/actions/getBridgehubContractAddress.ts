import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { PublicZksyncRpcSchema } from '../types/eip1193.js'

export type GetBridgehubContractAddressReturnType = Address

export async function getBridgehubContractAddress<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account, PublicZksyncRpcSchema>,
): Promise<GetBridgehubContractAddressReturnType> {
  const result = await client.request({ method: 'zks_getBridgehubContract' })
  return result
}
