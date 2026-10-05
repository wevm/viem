import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

const sourceId = 42_161 // Arbitrum One

export const apeChain = /*#__PURE__*/ Chain.from({
  id: 33139,
  name: 'ApeChain',
  nativeCurrency: {
    name: 'ApeCoin',
    symbol: 'APE',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://rpc.apechain.com/http',
    ws: 'wss://rpc.apechain.com/ws',
  },
  blockExplorers: {
    name: 'Apescan',
    url: 'https://apescan.io',
    apiUrl: 'https://api.apescan.io/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 20889,
    },
  },
  sourceId,
})
