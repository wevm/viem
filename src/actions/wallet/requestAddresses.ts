import type { Address } from 'abitype'

import type { WalletClient } from '../../clients/index.js'
import { getAddress } from '../../utils/index.js'

export type RequestAddressesReturnType = Address[]

export async function requestAddresses(
  client: WalletClient,
): Promise<RequestAddressesReturnType> {
  const addresses = await client.request({ method: 'eth_requestAccounts' })
  return addresses.map((address) => getAddress(address))
}
