// src/chains/definitions/example.ts
import { defineChain } from '../../utils/chain/defineChain.js'

export const botanix = /*#__PURE__*/ defineChain({
  id: 3637,
  name: 'Botanix',
  nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.botanixlabs.com '],
      webSocket: ['wss://rpc.botanixlabs.com/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Botanixscan',
      url: 'https://botanixscan.io/',
      apiUrl: 'https://botanixscan.io/documentation',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 516999,
    },
  },
})