import { Address } from 'abitype'
import type { WalletClient } from '../../clients'
import { checksumAddress } from '../../utils/address'

export type GetAddressesResponse = Address[]

export async function getAddresses(
  client: WalletClient,
): Promise<GetAddressesResponse> {
  const addresses = await client.request({ method: 'eth_accounts' })
  return addresses.map((address) => checksumAddress(address))
}
