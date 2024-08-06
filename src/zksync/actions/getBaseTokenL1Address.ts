import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { PublicZksyncRpcSchema } from '../types/eip1193.js'

export type GetBaseTokenL1AddressReturnType = Address

export async function getBaseTokenL1Address<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account, PublicZksyncRpcSchema>,
): Promise<GetBaseTokenL1AddressReturnType> {
  const result = await client.request({ method: 'zks_getBaseTokenL1Address' })
  return result
}
