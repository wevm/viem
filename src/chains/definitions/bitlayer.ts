import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const bitlayer = /*#__PURE__*/ Chain.from({
  id: 200901,
  name: 'Bitlayer Mainnet',
  nativeCurrency: {
    name: 'BTC',
    symbol: 'BTC',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://rpc.bitlayer.org',
    ws: 'wss://ws.bitlayer.org',
  },
  blockExplorers: {
    name: 'bitlayer mainnet scan',
    url: 'https://www.btrscan.com',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0x5B256fE9e993902eCe49D138a5b1162cBb529474',
      blockCreated: 2421963,
    },
  },
})
