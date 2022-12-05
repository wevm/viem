import { arbitrum, goerli, mainnet, optimism, polygon } from 'viem/chains'
import { createNetworkClient, http } from 'viem/clients'

import { FetchBalance } from '../actions/FetchBalance'
import { FetchBlock } from '../actions/FetchBlock'
import { FetchBlockNumber } from '../actions/FetchBlockNumber'
import { FetchTransaction } from '../actions/FetchTransaction'
import { WatchBlocks } from '../actions/WatchBlocks'
import { WatchBlockNumber } from '../actions/WatchBlockNumber'

const clients = {
  mainnet: createNetworkClient(http({ chain: mainnet })),
  polygon: createNetworkClient(http({ chain: polygon })),
  optimism: createNetworkClient(http({ chain: optimism })),
  arbitrum: createNetworkClient(http({ chain: arbitrum })),
  goerli: createNetworkClient(http({ chain: goerli })),
}

export function HttpNetwork() {
  return (
    <div>
      <hr />
      <h3>fetchBalance</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 48 }}>
        {Object.entries(clients).map(([chain, client]) => (
          <div key={chain}>
            <strong>{chain}</strong>
            <FetchBalance client={client} />
          </div>
        ))}
      </div>
      <br />
      <hr />
      <h3>fetchBlock</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 48 }}>
        {Object.entries(clients).map(([chain, client]) => (
          <div key={chain}>
            <strong>{chain}</strong>
            <FetchBlock client={client} />
          </div>
        ))}
      </div>
      <br />
      <hr />
      <h3>fetchBlockNumber</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 48 }}>
        {Object.entries(clients).map(([chain, client]) => (
          <div key={chain}>
            <strong>{chain}</strong>
            <FetchBlockNumber client={client} />
          </div>
        ))}
      </div>
      <br />
      <hr />
      <h3>fetchTransaction</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 48 }}>
        {Object.entries(clients).map(([chain, client]) => (
          <div key={chain}>
            <strong>{chain}</strong>
            <FetchTransaction client={client} />
          </div>
        ))}
      </div>
      <br />
      <hr />
      <h3>watchBlocks</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 48 }}>
        {Object.entries(clients).map(([chain, client]) => (
          <div key={chain}>
            <strong>{chain}</strong>
            <WatchBlocks client={client} />
          </div>
        ))}
      </div>
      <br />
      <hr />
      <h3>watchBlockNumber</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 48 }}>
        {Object.entries(clients).map(([chain, client]) => (
          <div key={chain}>
            <strong>{chain}</strong>
            <WatchBlockNumber client={client} />
          </div>
        ))}
      </div>
    </div>
  )
}
