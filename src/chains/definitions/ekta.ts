import { defineChain } from '../../utils/chain/defineChain.js'

export const ekta = /*#__PURE__*/ defineChain({
  id: 1994,
  name: 'Ekta',
  nativeCurrency: {
    decimals: 18,
    name: 'EKTA',
    symbol: 'EKTA',
  },
  rpcUrls: {
    default: { http: ['https://main.ekta.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Ektascan',
      url: 'https://ektascan.io',
      apiUrl: 'https://ektascan.io/api',
    },
  },
})
