import { arbitrum, goerli, mainnet, optimism, polygon } from 'viem/chains'
import { httpProvider } from 'viem/providers/network'

import { FetchBalance } from '../actions/FetchBalance'
import { FetchBlock } from '../actions/FetchBlock'
import { FetchBlockNumber } from '../actions/FetchBlockNumber'
import { FetchTransaction } from '../actions/FetchTransaction'
import { WatchBlocks } from '../actions/WatchBlocks'
import { WatchBlockNumber } from '../actions/WatchBlockNumber'

const providers = {
  mainnet: httpProvider({ chain: mainnet }),
  polygon: httpProvider({ chain: polygon }),
  optimism: httpProvider({ chain: optimism }),
  arbitrum: httpProvider({ chain: arbitrum }),
  goerli: httpProvider({ chain: goerli }),
}

export function HttpNetwork() {
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
      <br />
      <hr />
      <h3>watchBlockNumber</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 48 }}>
        {Object.entries(providers).map(([chain, provider]) => (
          <div key={chain}>
            <strong>{chain}</strong>
            <WatchBlockNumber provider={provider} />
          </div>
        ))}
      </div>
    </div>
  )
}
