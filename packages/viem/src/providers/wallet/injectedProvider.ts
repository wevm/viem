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
    on: window.ethereum!.on.bind(window.ethereum!),
    removeListener: window.ethereum!.removeListener.bind(window.ethereum!),
    request: window.ethereum!.request.bind(window.ethereum!),

    async connect() {
      const addresses = await requestAccounts(this)
      // TODO: checksum addresses
      return {
        address: addresses[0],
      }
    },
  })
}
