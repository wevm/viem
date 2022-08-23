import { Chain } from '../../chains'
import { InjectedRequests, PublicRequests } from '../../types/ethereum-provider'
import { WalletProvider, createWalletProvider } from './createWalletProvider'

export type InjectedProviderConfig = {
  /** Chains that the provider should be aware of. */
  chains: Chain[]
  /** A key for the provider. */
  key?: string
  /** A name for the provider. */
  name?: string
}

export type InjectedProviderRequestFn = (PublicRequests &
  InjectedRequests)['request']

export type InjectedProvider = WalletProvider<Chain, InjectedProviderRequestFn>

export type InjectedProviderReturnValue = InjectedProvider | null

/**
 * @description Creates a provider from the injected JavaScript Ethereum instance
 * (i.e. window.ethereum). `window.ethereum` is typically injected via a browser extension
 * like MetaMask, or a wallet browser.
 */
export function injectedProvider({
  chains,
  key = 'injected',
  name = 'Injected',
}: InjectedProviderConfig): InjectedProviderReturnValue {
  if (typeof window === 'undefined') return null
  if (typeof window.ethereum === 'undefined') return null

  return createWalletProvider({
    chains,
    key,
    name,
    on: window.ethereum!.on.bind(window.ethereum!),
    removeListener: window.ethereum!.removeListener.bind(window.ethereum!),
    request: <InjectedProviderRequestFn>(
      window.ethereum!.request.bind(window.ethereum!)
    ),
    uniqueId: key,
  })
}
