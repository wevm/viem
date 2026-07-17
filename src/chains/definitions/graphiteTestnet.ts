import * as Chain from '../../core/Chain.js'

export const graphiteTestnet = /*#__PURE__*/ Chain.from({
  id: 54170,
  name: 'Graphite Network Testnet',
  nativeCurrency: { name: 'Graphite', symbol: '@G', decimals: 18 },
  rpcUrls: {
    http: 'https://anon-entrypoint-test-1.atgraphite.com',
    ws: 'wss://ws-anon-entrypoint-test-1.atgraphite.com',
  },
  blockExplorers: {
    name: 'Graphite Testnet Spectre',
    url: 'https://test.atgraphite.com',
    apiUrl: 'https://api.test.atgraphite.com/api',
  },
  testnet: true,
})
