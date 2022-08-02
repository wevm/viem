import { Chain } from '../../chains'
import { WalletProvider, createWalletProvider } from './createWalletProvider'

export type ExternalProvider = WalletProvider

export type ExternalProviderArg = {
  on: WalletProvider['on']
  removeListener: WalletProvider['removeListener']
  request: WalletProvider['request']
}

export type ExternalProviderConfig = {
  /** Chains that the provider should be aware of. */
  chains: Chain[]
  /** A identifier for the provider. */
  id?: string
  /** A name for the provider. */
  name?: string
}

/**
 * @description Creates a provider from a EIP-1193 compatible JavaScript Ethereum API.
 */
export function externalProvider(
  provider: ExternalProviderArg,
  { chains, id = 'external', name = 'External' }: ExternalProviderConfig,
): ExternalProvider {
  return createWalletProvider({
    chains,
    id,
    name,
    on: provider.on.bind(provider),
    removeListener: provider.removeListener.bind(provider),
    request: provider.request.bind(provider),
  })
}
