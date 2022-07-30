import WalletConnect from '@walletconnect/ethereum-provider'
import { IWCRpcConnectionOptions } from '@walletconnect/types'

import { Chain } from '../../types'
import { WalletProvider, createWalletProvider } from './createWalletProvider'

export type WalletConnectProviderConfig = IWCRpcConnectionOptions & {
  chains: Chain[]
  rpcUrl?: (chain: Chain) => string
}

export type WalletConnectProvider = WalletProvider & {
  disconnect: () => Promise<void>
}

export function walletConnectProvider({
  bridge,
  chainId,
  chains,
  clientMeta,
  connector,
  qrcode,
  qrcodeModalOptions,
  rpcUrl = (chain) => chain.rpcUrls.public,
  signingMethods,
  storageId = 'viem.wc',
}: WalletConnectProviderConfig): WalletConnectProvider {
  const rpc = chains.reduce(
    (rpc, chain) => ({ ...rpc, [chain.id]: rpcUrl(chain) }),
    {},
  )

  const provider = new WalletConnect({
    bridge,
    chainId,
    clientMeta,
    connector,
    qrcode,
    qrcodeModalOptions,
    rpc,
    signingMethods,
    storageId,
  })

  const walletProvider = createWalletProvider({
    chains,
    on: provider.on.bind(provider),
    removeListener: provider.removeListener.bind(provider),
    request: provider.request.bind(provider),

    async connect() {
      const addresses = await provider.enable()
      // TODO: checksum addresses
      return { address: addresses[0] }
    },
  })

  return {
    ...walletProvider,
    disconnect: provider.disconnect.bind(provider),
  }
}
