import { arbitrum, goerli, mainnet, optimism, polygon } from 'viem/chains'
import { createNetworkRpc, http } from 'viem/rpcs'

import { FetchBalance } from '../actions/FetchBalance'
import { FetchBlock } from '../actions/FetchBlock'
import { FetchBlockNumber } from '../actions/FetchBlockNumber'
import { FetchTransaction } from '../actions/FetchTransaction'
import { WatchBlocks } from '../actions/WatchBlocks'
import { WatchBlockNumber } from '../actions/WatchBlockNumber'

const rpcs = {
  mainnet: createNetworkRpc(http({ chain: mainnet })),
  polygon: createNetworkRpc(http({ chain: polygon })),
  optimism: createNetworkRpc(http({ chain: optimism })),
  arbitrum: createNetworkRpc(http({ chain: arbitrum })),
  goerli: createNetworkRpc(http({ chain: goerli })),
}

export function HttpNetwork() {
  return (
    <div>
      <hr />
      <h3>fetchBalance</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 48 }}>
        {Object.entries(rpcs).map(([chain, rpc]) => (
          <div key={chain}>
            <strong>{chain}</strong>
            <FetchBalance rpc={rpc} />
          </div>
        ))}
      </div>
      <br />
      <hr />
      <h3>fetchBlock</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 48 }}>
        {Object.entries(rpcs).map(([chain, rpc]) => (
          <div key={chain}>
            <strong>{chain}</strong>
            <FetchBlock rpc={rpc} />
          </div>
        ))}
      </div>
      <br />
      <hr />
      <h3>fetchBlockNumber</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 48 }}>
        {Object.entries(rpcs).map(([chain, rpc]) => (
          <div key={chain}>
            <strong>{chain}</strong>
            <FetchBlockNumber rpc={rpc} />
          </div>
        ))}
      </div>
      <br />
      <hr />
      <h3>fetchTransaction</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 48 }}>
        {Object.entries(rpcs).map(([chain, rpc]) => (
          <div key={chain}>
            <strong>{chain}</strong>
            <FetchTransaction rpc={rpc} />
          </div>
        ))}
      </div>
      <br />
      <hr />
      <h3>watchBlocks</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 48 }}>
        {Object.entries(rpcs).map(([chain, rpc]) => (
          <div key={chain}>
            <strong>{chain}</strong>
            <WatchBlocks rpc={rpc} />
          </div>
        ))}
      </div>
      <br />
      <hr />
      <h3>watchBlockNumber</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 48 }}>
        {Object.entries(rpcs).map(([chain, rpc]) => (
          <div key={chain}>
            <strong>{chain}</strong>
            <WatchBlockNumber rpc={rpc} />
          </div>
        ))}
      </div>
    </div>
  )
}
