import { defineChain } from '../../utils/chain/defineChain.js'

export const metadium = /*#__PURE__*/ defineChain({
  id: 11,
  name: 'Metadium Network',
  nativeCurrency: {
    decimals: 18,
    name: 'META',
    symbol: 'META',
  },
  rpcUrls: {
    default: { http: ['https://api.metadium.com/prod'] },
  },
  blockExplorers: {
    default: {
      name: 'Metadium Explorer',
      url: 'https://explorer.metadium.com',
    },
  },
  testnet: false,
})
