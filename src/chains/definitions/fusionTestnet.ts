import { defineChain } from '../../utils/chain/defineChain.js'

export const fusionTestnet = /*#__PURE__*/ defineChain({
  id: 46688,
  name: 'Fusion Testnet',
  nativeCurrency: { name: 'Fusion', symbol: 'FSN', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://testnet.fusionnetwork.io'],
      webSocket: ['wss://testnet.fusionnetwork.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'FSNscan',
      url: 'https://testnet.fsnscan.com',
    },
  },
  testnet: true,
})
