import { InjectedProvider } from '../../providers'
import { InvalidProviderError } from '../errors'

export async function requestAccountAddresses(provider: InjectedProvider) {
  if (provider.type !== 'walletProvider')
    throw new InvalidProviderError({
      expectedProvider: 'walletProvider',
      givenProvider: provider.type,
    })

  // TODO: return checksumed addresses
  return await provider.request({ method: 'eth_requestAccounts' })
}
