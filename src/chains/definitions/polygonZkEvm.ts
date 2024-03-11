import { defineChain } from '../../utils/chain/defineChain.js'

export const polygonZkEvm = /*#__PURE__*/ defineChain({
  id: 1101,
  name: 'Polygon zkEVM',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://zkevm-rpc.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'PolygonScan',
      url: 'https://zkevm.polygonscan.com',
      apiUrl: 'https://api-zkevm.polygonscan.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 57746,
    },
  },
})
