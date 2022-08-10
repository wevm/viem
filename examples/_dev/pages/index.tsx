import 'viem/window'
import { useEffect } from 'react'
// import WalletConnectProvider from '@walletconnect/ethereum-provider'

import { fetchBalance, fetchBlockNumber } from 'viem/actions/public'

import { sendTransaction } from 'viem/actions/account'
import { accountProvider } from 'viem/providers/account'

// import { alchemyProvider } from 'viem/providers/network'

import {
  injectedProvider,
  // externalProvider
} from 'viem/providers/wallet'
import { requestAccountAddresses } from 'viem/actions/wallet'

import {
  mainnet,
  // polygon
} from 'viem/chains'

////////////////////////////////////////////////////////

// const provider = alchemyProvider({ chain: mainnet })

////////////////////////////////////////////////////////

// const walletConnectProvider = new WalletConnectProvider({
//   rpc: {
//     [mainnet.id]: mainnet.rpcUrls.default,
//   },
// })
// const provider = externalProvider(walletConnectProvider, { chains: [mainnet] })

////////////////////////////////////////////////////////

const provider = injectedProvider({ chains: [mainnet] })

////////////////////////////////////////////////////////

export default function Index() {
  useEffect(() => {
    ;(async () => {
      const blockNumber = await fetchBlockNumber(provider!)
      const balance = await fetchBalance(provider!, {
        address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
      })
      console.log(balance, blockNumber)
    })()
  }, [])
  return (
    <button
      onClick={async () => {
        // injected
        const [address] = await requestAccountAddresses(provider!)

        // wallet connect
        // const [address] = await walletConnectProvider.enable()

        const providerAccount = accountProvider(provider!, {
          address,
        })

        const txn = await sendTransaction(providerAccount, {
          request: {
            from: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
            to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
            value: 0n,
          },
        })
        console.log(txn)
      }}
    >
      Connect
    </button>
  )
}
