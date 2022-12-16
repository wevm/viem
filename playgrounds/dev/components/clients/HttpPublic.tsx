import { arbitrum, goerli, mainnet, optimism, polygon } from 'viem/chains'
import { createPublicClient, http } from 'viem/clients'

import { FetchBalance } from '../actions/FetchBalance'
import { FetchBlock } from '../actions/FetchBlock'
import { FetchBlockNumber } from '../actions/FetchBlockNumber'
import { FetchTransaction } from '../actions/FetchTransaction'
import { WatchBlocks } from '../actions/WatchBlocks'
import { WatchBlockNumber } from '../actions/WatchBlockNumber'

const clients = {
  mainnet: createPublicClient({ chain: mainnet, transport: http() }),
  polygon: createPublicClient({ chain: polygon, transport: http() }),
  optimism: createPublicClient({ chain: optimism, transport: http() }),
  arbitrum: createPublicClient({ chain: arbitrum, transport: http() }),
  goerli: createPublicClient({ chain: goerli, transport: http() }),
}

export function HttpPublic() {
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
