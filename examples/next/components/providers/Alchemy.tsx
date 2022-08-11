import { mainnet } from 'viem/chains'
import { alchemyProvider } from 'viem/providers/network'

import { FetchBalance } from '../actions/FetchBalance'

const mainnetProvider = alchemyProvider({ chain: mainnet })

export function Alchemy() {
  return (
    <div>
      <FetchBalance provider={mainnetProvider} />
    </div>
  )
}
