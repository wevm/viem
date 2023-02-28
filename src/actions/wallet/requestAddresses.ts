import { Address } from 'abitype'
import type { WalletClient } from '../../clients'
import { getAddress } from '../../utils'

export type RequestAddressesResponse = Address[]

export async function requestAddresses(
  client: WalletClient,
): Promise<RequestAddressesResponse> {
  const addresses = await client.request({ method: 'eth_requestAccounts' })
  return addresses.map((address) => getAddress(address))
}
