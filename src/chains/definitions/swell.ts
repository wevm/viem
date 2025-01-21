import { defineChain } from '../../utils/chain/defineChain.js'

export const swell = /*#__PURE__*/ defineChain({
  id: 1923,
  name: 'Swellchain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://swell-mainnet.alt.technology'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Swell Explorer',
      url: 'https://explorer.swellnetwork.io',
      apiUrl: 'https://explorer.swellnetwork.io/api',
    },
  },
  contracts: {
  },
})
