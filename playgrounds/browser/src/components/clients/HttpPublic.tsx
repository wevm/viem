import { http, createPublicClient } from 'viem'
import { arbitrum, goerli, mainnet, optimism, polygon } from 'viem/chains'

import { GetBalance } from '../actions/GetBalance'
import { GetBlock } from '../actions/GetBlock'
import { GetBlockNumber } from '../actions/GetBlockNumber'
import { GetTransaction } from '../actions/GetTransaction'
import { WatchBlockNumber } from '../actions/WatchBlockNumber'
import { WatchBlocks } from '../actions/WatchBlocks'
import { WatchPendingTransactions } from '../actions/WatchPendingTransactions'

const apiKey = 'PjT72qifrAFZ4WV_drrd30N5onftY5VA'

export const clients = {
  mainnet: createPublicClient({
    chain: mainnet,
    transport: http(`${mainnet.rpcUrls.alchemy.http[0]}/${apiKey}`),
  }),
  polygon: createPublicClient({
    chain: polygon,
    transport: http(`${polygon.rpcUrls.alchemy.http[0]}/${apiKey}`),
  }),
  optimism: createPublicClient({
    chain: optimism,
    transport: http(`${optimism.rpcUrls.alchemy.http[0]}/${apiKey}`),
  }),
  arbitrum: createPublicClient({
    chain: arbitrum,
    transport: http(`${arbitrum.rpcUrls.alchemy.http[0]}/${apiKey}`),
  }),
  goerli: createPublicClient({
    chain: goerli,
    transport: http(`${goerli.rpcUrls.alchemy.http[0]}/${apiKey}`),
  }),
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
      <br />
      <hr />
      <h3>watchPendingTransactions</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 48 }}>
        {Object.entries(clients).map(([chain, client]) => (
          <div key={chain}>
            <strong>{chain}</strong>
            <WatchPendingTransactions client={client} />
          </div>
        ))}
      </div>
    </div>
  )
}
