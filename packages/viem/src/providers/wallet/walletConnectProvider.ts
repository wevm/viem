import WalletConnect from '@walletconnect/ethereum-provider'

import { createProviderAccount } from '../../accounts/createProviderAccount'
import { Chain } from '../../types'
import { WalletProvider, createWalletProvider } from './createWalletProvider'

export type WalletConnectProviderConfig = {
  chains: Chain[]
}

export type WalletConnectProvider = WalletProvider

export function walletConnectProvider({
  chains,
}: WalletConnectProviderConfig): WalletConnectProvider {
  const rpc = chains.reduce(
    (rpc, chain) => ({ ...rpc, [chain.id]: chain.rpcUrls.public }),
    {},
  )

  const provider = new WalletConnect({
    rpc,
  })

  return createWalletProvider({
    chains,
    on: provider.on.bind(provider),
    removeListener: provider.removeListener.bind(provider),
    request: provider.request.bind(provider),

    async connect() {
      const addresses = await provider.enable()
      return createProviderAccount({
        address: addresses[0],
        request: provider.request.bind(provider),
      })
    },
  })
}
