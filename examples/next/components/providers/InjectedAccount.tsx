import { useState } from 'react'
import { requestAccountAddresses } from 'viem/actions'
import { arbitrum, goerli, mainnet, optimism, polygon } from 'viem/chains'
import {
  AccountProvider,
  accountProvider as accountProvider_,
  injectedProvider,
} from 'viem/providers'

import { SendTransaction } from '../actions/SendTransaction'

const provider = injectedProvider({
  chains: [arbitrum, goerli, mainnet, optimism, polygon],
})

export function InjectedAccount() {
  const [accountProvider, setAccountProvider] = useState<AccountProvider>()
  if (!provider) return null
  if (!accountProvider)
    return (
      <button
        onClick={async () => {
          const addresses = await requestAccountAddresses(provider)
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
