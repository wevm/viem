import { defineChain } from '../../utils/chain/defineChain.js'

export const dodochainTestnet = defineChain({
  id: 53457,
  name: 'DODOchain Testnet',
  nativeCurrency: { decimals: 18, name: 'DODO', symbol: 'DODO' },
  rpcUrls: {
    default: {
      http: ['https://dodochain-testnet.alt.technology'],
      webSocket: ['wss://dodochain-testnet.alt.technology/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'DODOchain Testnet (Sepolia) Explorer',
      url: 'https://testnet-scan.dodochain.com',
    },
  },
  testnet: true,
})
