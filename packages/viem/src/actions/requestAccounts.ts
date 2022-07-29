import { InjectedProvider } from '../providers/wallet/injectedProvider'

export async function requestAccounts(provider: InjectedProvider) {
  // TODO: return checksumed addresses
  return await provider.request({ method: 'eth_requestAccounts' })
}
