import { Address } from 'abitype'
import type { WalletClient } from '../../clients'
import { getAddress } from '../../utils'

export type RequestAccountsResponse = Address[]

export async function requestAccounts(
  client: WalletClient,
): Promise<RequestAccountsResponse> {
  const addresses = await client.request({ method: 'eth_requestAccounts' })
  return addresses.map((address) => getAddress(address))
}
