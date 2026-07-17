import * as Chain from '../../core/Chain.js'
// src/chains/definitions/example.ts

export const botanix = /*#__PURE__*/ Chain.from({
  id: 3637,
  name: 'Botanix',
  nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 18 },
  rpcUrls: {
    http: 'https://rpc.botanixlabs.com',
    ws: 'wss://rpc.botanixlabs.com/ws',
  },
  blockExplorers: {
    name: 'Botanixscan',
    url: 'https://botanixscan.io',
  },
})
