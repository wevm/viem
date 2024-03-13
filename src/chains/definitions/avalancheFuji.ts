import { defineChain } from '../../utils/chain/defineChain.js'

export const avalancheFuji = /*#__PURE__*/ defineChain({
  id: 43_113,
  name: 'Avalanche Fuji',
  nativeCurrency: {
    decimals: 18,
    name: 'Avalanche Fuji',
    symbol: 'AVAX',
  },
  rpcUrls: {
    default: { http: ['https://api.avax-test.network/ext/bc/C/rpc'] },
  },
  blockExplorers: {
    default: {
      name: 'SnowScan',
      url: 'https://testnet.snowscan.xyz',
      apiUrl: 'https://api-testnet.snowscan.xyz',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 7096959,
    },
  },
  testnet: true,
})
