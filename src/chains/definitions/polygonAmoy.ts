import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const polygonAmoy = /*#__PURE__*/ Chain.from({
  id: 80_002,
  name: 'Polygon Amoy',
  nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc-amoy.polygon.technology',
  },
  blockExplorers: {
    name: 'PolygonScan',
    url: 'https://amoy.polygonscan.com',
    apiUrl: 'https://api.etherscan.io/v2/api',
  },
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 3127388,
    },
  },
  testnet: true,
})
