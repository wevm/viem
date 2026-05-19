import * as Chain from '../../core/Chain.js'

export const vechain = /*#__PURE__*/ Chain.define({
  id: 100009n,
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
