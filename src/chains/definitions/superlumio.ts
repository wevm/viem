import { defineChain } from '../../utils/chain/defineChain.js'

export const superlumio = /*#__PURE__*/ defineChain({
  id: 8866,
  name: 'SuperLumio',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.lumio.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Lumio explorer',
      url: 'https://explorer.lumio.io',
    },
  },
  testnet: false,
})
