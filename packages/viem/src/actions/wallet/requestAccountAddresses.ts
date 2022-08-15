import { InjectedProvider } from '../../providers'
import { checksumAddress } from '../../utils'
import { InvalidProviderError } from '../errors'

export async function requestAccountAddresses(provider: InjectedProvider) {
  if (provider.type !== 'walletProvider')
    throw new InvalidProviderError({
      expectedProvider: 'walletProvider',
      givenProvider: provider.type,
    })

  const addresses = await provider.request({ method: 'eth_requestAccounts' })
  return addresses.map((address) => checksumAddress(address))
}
