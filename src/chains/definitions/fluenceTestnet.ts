import { defineChain } from '../../utils/chain/defineChain.js'

export const fluenceTestnet = /*#__PURE__*/ defineChain({
  id: 52_164_803,
  name: 'Fluence Testnet',
  nativeCurrency: { name: 'tFLT', symbol: 'tFLT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.fluence.dev'],
      webSocket: ['wss://ws.testnet.fluence.dev'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://blockscout.testnet.fluence.dev',
      apiUrl: 'https://blockscout.testnet.fluence.dev/api',
    },
  },
  testnet: true,
})
