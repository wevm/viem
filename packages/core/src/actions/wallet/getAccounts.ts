import type { WalletClient } from '../../clients'
import { checksumAddress } from '../../utils/address'

export async function getAccounts(client: WalletClient) {
  const addresses = await client.request({ method: 'eth_accounts' })
  return addresses.map((address) => checksumAddress(address))
}
