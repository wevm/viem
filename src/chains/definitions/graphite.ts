import * as Chain from '../../core/Chain.js'

export const graphite = /*#__PURE__*/ Chain.from({
  id: 440017,
  name: 'Graphite Network',
  nativeCurrency: { name: 'Graphite', symbol: '@G', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://anon-entrypoint-1.atgraphite.com'],
      webSocket: ['wss://ws-anon-entrypoint-1.atgraphite.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Graphite Spectre',
      url: 'https://main.atgraphite.com',
      apiUrl: 'https://api.main.atgraphite.com/api',
    },
  },
  testnet: false,
})
