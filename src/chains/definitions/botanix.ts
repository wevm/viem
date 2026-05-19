// src/chains/definitions/example.ts
import * as Chain from '../../core/Chain.js'

export const botanix = /*#__PURE__*/ Chain.define({
  id: 3637n,
  name: 'Botanix',
  nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.botanixlabs.com'],
      webSocket: ['wss://rpc.botanixlabs.com/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Botanixscan',
      url: 'https://botanixscan.io',
    },
  },
})
