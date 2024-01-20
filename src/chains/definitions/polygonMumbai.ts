import { defineChain } from '../../utils/chain/defineChain.js'

export const polygonMumbai = /*#__PURE__*/ defineChain({
  id: 80_001,
  name: 'Polygon Mumbai',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.ankr.com/polygon_mumbai'],
    },
  },
  blockExplorers: {
    default: {
      name: 'PolygonScan',
      url: 'https://mumbai.polygonscan.com',
      apiUrl: 'https://mumbai.polygonscan.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 25770160,
    },
  },
  testnet: true,
})
