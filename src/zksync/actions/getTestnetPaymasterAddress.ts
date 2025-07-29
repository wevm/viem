import type { Address } from 'abitype'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Account } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { PublicZksyncRpcSchema } from '../types/eip1193.js'

export type GetTestnetPaymasterAddressReturnType = Address | null

/* @deprecated Check the corresponding ZKsync chain technical documentation to find the testnet paymaster address */
export async function getTestnetPaymasterAddress<
  chain extends Chain | undefined,
  account extends Account | undefined,
>(
  client: Client<Transport, chain, account, PublicZksyncRpcSchema>,
): Promise<GetTestnetPaymasterAddressReturnType> {
  const result = await client.request({ method: 'zks_getTestnetPaymaster' })
  return result
}
