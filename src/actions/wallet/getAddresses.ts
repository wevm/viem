import type { Address } from 'abitype'

import type { WalletClient } from '../../clients'
import { checksumAddress } from '../../utils/address'

export type GetAddressesReturnType = Address[]

export async function getAddresses(
  client: WalletClient<any, any>,
): Promise<GetAddressesReturnType> {
  const addresses = await client.request({ method: 'eth_accounts' })
  return addresses.map((address) => checksumAddress(address))
}
