import { defineChain } from '../../utils/chain/defineChain.js'

export const polygonZkEvm = /*#__PURE__*/ defineChain({
  id: 1101,
  name: 'Polygon zkEVM',
  network: 'polygon-zkevm',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://zkevm-rpc.com'],
    },
    public: {
      http: ['https://zkevm-rpc.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'PolygonScan',
      url: 'https://zkevm.polygonscan.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 57746,
    },
  },
})
