import { defineChain } from '../../utils/chain/defineChain.js'

export const omni = defineChain({
  id: 166,
  name: 'Omni',
  nativeCurrency: { name: 'Omni', symbol: 'OMNI', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.omni.network'],
      webSocket: ['wss://mainnet.omni.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'OmniScan',
      url: 'https://omniscan.network',
    },
  },
  testnet: false,
})
