import { defineChain } from '../../utils/chain/defineChain.js'

export const graphiteTestnet = /*#__PURE__*/ defineChain({
  id: 54170,
  name: 'Graphite Network Testnet',
  nativeCurrency: { name: 'Graphite', symbol: '@G', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://anon-entrypoint-test-1.atgraphite.com'],
      webSocket: ['wss://ws-anon-entrypoint-test-1.atgraphite.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Graphite Testnet Spectre',
      url: 'https://test.atgraphite.com',
      apiUrl: 'https://api.test.atgraphite.com/api',
    },
  },
  testnet: true,
})
