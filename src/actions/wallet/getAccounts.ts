import { Address } from 'abitype'
import type { WalletClient } from '../../clients'
import { checksumAddress } from '../../utils/address'

export type GetAccountsResponse = Address[]

export async function getAccounts(
  client: WalletClient,
): Promise<GetAccountsResponse> {
  const addresses = await client.request({ method: 'eth_accounts' })
  return addresses.map((address) => checksumAddress(address))
}
