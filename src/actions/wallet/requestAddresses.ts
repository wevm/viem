import type { Address } from 'abitype'

import type { WalletClientArg } from '../../clients'
import { getAddress } from '../../utils'

export type RequestAddressesReturnType = Address[]

export async function requestAddresses(
  client: WalletClientArg,
): Promise<RequestAddressesReturnType> {
  const addresses = await client.request({ method: 'eth_requestAccounts' })
  return addresses.map((address) => getAddress(address))
}
