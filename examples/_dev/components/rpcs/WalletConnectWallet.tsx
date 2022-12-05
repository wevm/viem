import { useState } from 'react'
import WalletConnectProvider from '@walletconnect/ethereum-provider'
import { arbitrum, goerli, mainnet, optimism, polygon } from 'viem/chains'
import { createWalletRpc, ethereumProvider } from 'viem/rpcs'

import { SendTransaction } from '../actions/SendTransaction'

const chains = [arbitrum, goerli, mainnet, optimism, polygon]
const walletConnectProvider = new WalletConnectProvider({
  rpc: chains.reduce(
    (rpcMap, chain) => ({ ...rpcMap, [chain.id]: chain.rpcUrls.default.http }),
    {},
  ),
})
const rpc = createWalletRpc(
  ethereumProvider({ provider: walletConnectProvider }),
)

export function WalletConnectWallet() {
  const [connected, setConnected] = useState(false)
  if (!rpc) return null
  if (!connected)
    return (
      <button
        onClick={async () => {
          await walletConnectProvider.enable()
          setConnected(true)
        }}
      >
        connect
      </button>
    )
  return (
    <div>
      <hr />
      <h3>sendTransaction</h3>
      <SendTransaction rpc={rpc} />
    </div>
  )
}
