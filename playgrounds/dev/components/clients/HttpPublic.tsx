import { arbitrum, goerli, mainnet, optimism, polygon } from 'viem/chains'
import { createPublicClient, http } from 'viem/clients'

import { GetBalance } from '../actions/GetBalance'
import { GetBlock } from '../actions/GetBlock'
import { GetBlockNumber } from '../actions/GetBlockNumber'
import { GetTransaction } from '../actions/GetTransaction'
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
      <h3>getBalance</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 48 }}>
        {Object.entries(clients).map(([chain, client]) => (
          <div key={chain}>
            <strong>{chain}</strong>
            <GetBalance client={client} />
          </div>
        ))}
      </div>
      <br />
      <hr />
      <h3>getBlock</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 48 }}>
        {Object.entries(clients).map(([chain, client]) => (
          <div key={chain}>
            <strong>{chain}</strong>
            <GetBlock client={client} />
          </div>
        ))}
      </div>
      <br />
      <hr />
      <h3>getBlockNumber</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 48 }}>
        {Object.entries(clients).map(([chain, client]) => (
          <div key={chain}>
            <strong>{chain}</strong>
            <GetBlockNumber client={client} />
          </div>
        ))}
      </div>
      <br />
      <hr />
      <h3>getTransaction</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 48 }}>
        {Object.entries(clients).map(([chain, client]) => (
          <div key={chain}>
            <strong>{chain}</strong>
            <GetTransaction client={client} />
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
