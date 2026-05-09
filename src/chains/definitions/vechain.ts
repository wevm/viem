import { defineChain } from '../../utils/chain/defineChain.js'

export const vechain = /*#__PURE__*/ defineChain({
  id: 100009,
  name: 'Vechain',
  nativeCurrency: { name: 'VeChain', symbol: 'VET', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.vechain.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Vechain Explorer',
      url: 'https://explore.vechain.org',
    },
    vechainStats: {
      name: 'Vechain Stats',
      url: 'https://vechainstats.com',
    },
  },
})
