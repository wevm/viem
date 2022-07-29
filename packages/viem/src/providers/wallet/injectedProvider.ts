import { createProviderAccount } from '../../accounts/createProviderAccount'
import { requestAccounts } from '../../actions'
import { Chain, InjectedRequests, PublicRequests } from '../../types'
import { WalletProvider, createWalletProvider } from './createWalletProvider'

export type InjectedProviderConfig = {
  chains: Chain[]
}

export type InjectedProviderRequestFn = (PublicRequests &
  InjectedRequests)['request']

export type InjectedProvider = WalletProvider<InjectedProviderRequestFn>

export type InjectedProviderReturnValue = InjectedProvider | null

export function injectedProvider({
  chains,
}: InjectedProviderConfig): InjectedProviderReturnValue {
  if (typeof window === 'undefined') return null

  return createWalletProvider<InjectedProviderRequestFn>({
    chains,
    on: window.ethereum!.on,
    removeListener: window.ethereum!.removeListener,
    request: window.ethereum!.request,

    async connect() {
      const addresses = await requestAccounts(this)
      return createProviderAccount({
        address: addresses[0],
        request: window.ethereum!.request,
      })
    },
  })
}
