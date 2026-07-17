import * as Chain from '../../core/Chain.js'

export const arbitrum = /*#__PURE__*/ Chain.from({
  id: 42_161,
  name: 'Arbitrum One',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  blockTime: 250,
  rpcUrls: {
    http: 'https://arb1.arbitrum.io/rpc',
  },
  blockExplorers: {
    name: 'Arbiscan',
    url: 'https://arbiscan.io',
    apiUrl: 'https://api.arbiscan.io/api',
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 7654707,
    },
  },
})
