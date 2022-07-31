import { WalletProvider, createWalletProvider } from './createWalletProvider'

type ExternalProvider = {
  on: WalletProvider['on']
  removeListener: WalletProvider['removeListener']
  request: WalletProvider['request']
}

export function externalProvider(provider: ExternalProvider): ExternalProvider {
  return createWalletProvider({
    on: provider.on.bind(provider),
    removeListener: provider.removeListener.bind(provider),
    request: provider.request.bind(provider),
  })
}
