import * as Chain from '../../core/Chain.js'

export const polygon = /*#__PURE__*/ Chain.from({
  id: 137,
  name: 'Polygon',
  blockTime: 2000,
  nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
  rpcUrls: {
    http: 'https://polygon.drpc.org',
  },
  blockExplorers: {
    name: 'PolygonScan',
    url: 'https://polygonscan.com',
    apiUrl: 'https://api.etherscan.io/v2/api',
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 25770160,
    },
  },
})
