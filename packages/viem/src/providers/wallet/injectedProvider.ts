import { InjectedRequests, PublicRequests } from '../../types/ethereum-provider'
import { WalletProvider, createWalletProvider } from './createWalletProvider'

export type InjectedProviderRequestFn = (PublicRequests &
  InjectedRequests)['request']

export type InjectedProvider = WalletProvider<InjectedProviderRequestFn>

export type InjectedProviderReturnValue = InjectedProvider | null

export function injectedProvider(): InjectedProviderReturnValue {
  if (typeof window === 'undefined') return null

  return createWalletProvider<InjectedProviderRequestFn>({
    on: window.ethereum!.on.bind(window.ethereum!),
    removeListener: window.ethereum!.removeListener.bind(window.ethereum!),
    request: window.ethereum!.request.bind(window.ethereum!),
  })
}
