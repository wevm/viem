import { useState } from 'react'
import { arbitrum, goerli, mainnet, optimism, polygon } from 'viem/chains'
import { injectedProvider } from 'viem/providers/wallet'

import { FetchBalance } from '../actions/FetchBalance'
import { FetchBlock } from '../actions/FetchBlock'
import { FetchBlockNumber } from '../actions/FetchBlockNumber'
import { RequestAccountAddresses } from '../actions/RequestAccountAddresses'

const provider = injectedProvider({
  chains: [arbitrum, goerli, mainnet, optimism, polygon],
})

export function InjectedWallet() {
  const [addresses, setAddresses] = useState<`0x${string}`[]>([])
  if (!provider) return null
  return (
    <div>
      <hr />
      <h3>requestAccountAddresses</h3>
      <RequestAccountAddresses
        onAddresses={(addresses) => setAddresses(addresses)}
        provider={provider}
      />
      <br />
      <hr />
      <h3>fetchBalance</h3>
      {addresses.length > 0 && (
        <FetchBalance address={addresses[0]} provider={provider} />
      )}
      <br />
      <hr />
      <h3>fetchBlock</h3>
      <FetchBlock provider={provider} />
      <br />
      <hr />
      <h3>fetchBlockNumber</h3>
      <FetchBlockNumber provider={provider} />
    </div>
  )
}
