import { arbitrum, goerli, mainnet, optimism, polygon } from 'viem/chains'
import { alchemyProvider } from 'viem/providers/network'

import { FetchBalance } from '../actions/FetchBalance'
import { FetchBlock } from '../actions/FetchBlock'
import { FetchBlockNumber } from '../actions/FetchBlockNumber'

const providers = {
  mainnet: alchemyProvider({ chain: mainnet }),
  polygon: alchemyProvider({ chain: polygon }),
  optimism: alchemyProvider({ chain: optimism }),
  arbitrum: alchemyProvider({ chain: arbitrum }),
  goerli: alchemyProvider({ chain: goerli }),
}

export function AlchemyNetwork() {
  return (
    <div>
      <hr />
      <h3>fetchBalance</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 48 }}>
        {Object.entries(providers).map(([chain, provider]) => (
          <div key={chain}>
            <strong>{chain}</strong>
            <FetchBalance provider={provider} />
          </div>
        ))}
      </div>
      <br />
      <hr />
      <h3>fetchBlock</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 48 }}>
        {Object.entries(providers).map(([chain, provider]) => (
          <div key={chain}>
            <strong>{chain}</strong>
            <FetchBlock provider={provider} />
          </div>
        ))}
      </div>
      <br />
      <hr />
      <h3>fetchBlockNumber</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 48 }}>
        {Object.entries(providers).map(([chain, provider]) => (
          <div key={chain}>
            <strong>{chain}</strong>
            <FetchBlockNumber provider={provider} />
          </div>
        ))}
      </div>
    </div>
  )
}
