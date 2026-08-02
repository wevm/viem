import * as Chain from '../../core/Chain.js'
import * as Contracts from '../../core/internal/contracts.js'

export const polygonZkEvmCardona = /*#__PURE__*/ Chain.from({
  id: 2442,
  name: 'Polygon zkEVM Cardona',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.cardona.zkevm-rpc.com',
  },
  blockExplorers: {
    name: 'PolygonScan',
    url: 'https://cardona-zkevm.polygonscan.com',
    apiUrl: 'https://cardona-zkevm.polygonscan.com/api',
  },
  testnet: true,
  contracts: {
    create2: Contracts.create2,
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 114091,
    },
  },
})
