import { WalletRpc } from '../../rpcs'
import { checksumAddress } from '../../utils'

export async function requestAccountAddresses(rpc: WalletRpc) {
  const addresses = await rpc.request({ method: 'eth_requestAccounts' })
  return addresses.map((address) => checksumAddress(address))
}
