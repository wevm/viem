import type { Address } from 'abitype'

import type { WalletClient } from '../../clients/index.js'
import { checksumAddress } from '../../utils/address/index.js'

export type GetAddressesReturnType = Address[]

export async function getAddresses(
  client: WalletClient,
): Promise<GetAddressesReturnType> {
  const addresses = await client.request({ method: 'eth_accounts' })
  return addresses.map((address) => checksumAddress(address))
}
