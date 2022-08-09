import { InjectedProvider } from '../../providers'

export async function requestAccountAddresses(provider: InjectedProvider) {
  if (provider.type !== 'walletProvider') throw new Error('TODO')

  // TODO: return checksumed addresses
  return await provider.request({ method: 'eth_requestAccounts' })
}
