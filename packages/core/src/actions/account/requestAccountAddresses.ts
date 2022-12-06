import type { WalletClient } from '../../clients'
import { checksumAddress } from '../../utils'

export async function requestAccountAddresses(rpc: WalletClient) {
  const addresses = await rpc.request({ method: 'eth_requestAccounts' })
  return addresses.map((address) => checksumAddress(address))
}
