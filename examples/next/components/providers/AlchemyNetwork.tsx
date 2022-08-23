import { arbitrum, goerli, mainnet, optimism, polygon } from 'viem/chains'
import { alchemyHttpProvider } from 'viem/providers/network'

import { FetchBalance } from '../actions/FetchBalance'
import { FetchBlock } from '../actions/FetchBlock'
import { FetchBlockNumber } from '../actions/FetchBlockNumber'
import { FetchTransaction } from '../actions/FetchTransaction'
import { WatchBlocks } from '../actions/WatchBlocks'

const providers = {
  mainnet: alchemyHttpProvider({ chain: mainnet }),
  polygon: alchemyHttpProvider({ chain: polygon }),
  optimism: alchemyHttpProvider({ chain: optimism }),
  arbitrum: alchemyHttpProvider({ chain: arbitrum }),
  goerli: alchemyHttpProvider({ chain: goerli }),
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
      <br />
      <hr />
      <h3>fetchTransaction</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 48 }}>
        {Object.entries(providers).map(([chain, provider]) => (
          <div key={chain}>
            <strong>{chain}</strong>
            <FetchTransaction provider={provider} />
          </div>
        ))}
      </div>
      <br />
      <hr />
      <h3>watchBlocks</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 48 }}>
        {Object.entries(providers).map(([chain, provider]) => (
          <div key={chain}>
            <strong>{chain}</strong>
            <WatchBlocks provider={provider} />
          </div>
        ))}
      </div>
    </div>
  )
}
