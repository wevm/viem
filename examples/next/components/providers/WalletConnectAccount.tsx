import { useState } from 'react'
import WalletConnectProvider from '@walletconnect/ethereum-provider'
import { arbitrum, goerli, mainnet, optimism, polygon } from 'viem/chains'
import {
  AccountProvider,
  accountProvider as accountProvider_,
  externalProvider,
} from 'viem/providers'

import { SendTransaction } from '../actions/SendTransaction'

const chains = [arbitrum, goerli, mainnet, optimism, polygon]

const wcProvider = new WalletConnectProvider({
  rpc: chains.reduce(
    (rpcMap, chain) => ({ ...rpcMap, [chain.id]: chain.rpcUrls.alchemy.http }),
    {},
  ),
})
const provider = externalProvider(wcProvider, {
  chains,
  key: 'walletConnect',
  name: 'Wallet Connect',
})

export function WalletConnectAccount() {
  const [accountProvider, setAccountProvider] = useState<AccountProvider>()
  if (!provider) return null
  if (!accountProvider)
    return (
      <button
        onClick={async () => {
          const addresses = await wcProvider.enable()
          if (addresses)
            setAccountProvider(
              accountProvider_(provider, { address: addresses[0] }),
            )
        }}
      >
        connect
      </button>
    )
  return (
    <div>
      <hr />
      <h3>sendTransaction</h3>
      <SendTransaction provider={accountProvider} />
    </div>
  )
}
