import * as Chain from '../../core/Chain.js'

export const polygonZkEvmCardona = /*#__PURE__*/ Chain.define({
  id: 2442n,
  name: 'Polygon zkEVM Cardona',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.cardona.zkevm-rpc.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'PolygonScan',
      url: 'https://cardona-zkevm.polygonscan.com',
      apiUrl: 'https://cardona-zkevm.polygonscan.com/api',
    },
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 114091,
    },
  },
})
