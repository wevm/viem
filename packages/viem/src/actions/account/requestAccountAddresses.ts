import { InjectedProvider } from '../../providers'
import { checksumAddress } from '../../utils'

export async function requestAccountAddresses(provider: InjectedProvider) {
  const addresses = await provider.request({ method: 'eth_requestAccounts' })
  return addresses.map((address) => checksumAddress(address))
}
