import 'viem/window'
import { useEffect } from 'react'
import WalletConnectProvider from '@walletconnect/ethereum-provider'

import { getProviderAccount } from 'viem/accounts'
import {
  fetchBlockNumber,
  requestAccounts,
  sendTransaction,
} from 'viem/actions'
import { alchemyProvider } from 'viem/providers/network'
import { externalProvider, injectedProvider } from 'viem/providers/wallet'
import { mainnet, polygon } from 'viem/chains'

////////////////////////////////////////////////////////

// const provider = alchemyProvider({ chain: mainnet })

////////////////////////////////////////////////////////

// const walletConnectProvider = new WalletConnectProvider({
//   rpc: {
//     [mainnet.id]: mainnet.rpcUrls.public,
//   },
// })
// const provider = externalProvider(walletConnectProvider)

////////////////////////////////////////////////////////

const provider = injectedProvider()

////////////////////////////////////////////////////////

export default function Index() {
  useEffect(() => {
    ;(async () => {
      const blockNumber = await fetchBlockNumber(provider!)
      console.log(blockNumber)
    })()
  }, [])
  return (
    <button
      onClick={async () => {
        // injected
        const addresses = await requestAccounts(provider!)

        // wallet connect
        // const addresses = await provider.enable()

        const providerAccount = getProviderAccount(provider!, {
          address: addresses[0],
        })
        const txn = await sendTransaction(providerAccount, {
          request: {
            from: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
            to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
            value: '0x0',
          },
        })
        console.log(txn)
      }}
    >
      Connect
    </button>
  )
}
