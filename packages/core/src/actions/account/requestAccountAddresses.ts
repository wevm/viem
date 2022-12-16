import type { WalletClient } from '../../clients'
import { checksumAddress } from '../../utils'

export async function requestAccountAddresses(client: WalletClient) {
  const addresses = await client.request({ method: 'eth_requestAccounts' })
  return addresses.map((address) => checksumAddress(address))
}
