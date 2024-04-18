import { defineChain } from '../../utils/chain/defineChain.js'

export const DODOchain = defineChain({
  id: 53457,
  name: 'DODOchain Testnet',
  nativeCurrency: { decimals: 18, name: 'Berd', symbol: 'BERD' },
  rpcUrls: {
    default: {
      http: ['https://dodochain-testnet.alt.technology'],
      webSocket: ['wss://dodochain-testnet.alt.technology/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'DODOchain Testnet (Sepolia) Explorer',
      url: 'https://dodochain-testnet-explorer.alt.technology/',
    },
  },
  testnet: true,
})
