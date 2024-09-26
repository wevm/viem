import { defineChain } from '../../utils/chain/defineChain.js'

export const fusion = /*#__PURE__*/ defineChain({
  id: 32659,
  name: 'Fusion Mainnet',
  nativeCurrency: { name: 'Fusion', symbol: 'FSN', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.fusionnetwork.io'],
      webSocket: ['wss://mainnet.fusionnetwork.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'FSNscan',
      url: 'https://fsnscan.com',
    },
  },
  testnet: false,
})
