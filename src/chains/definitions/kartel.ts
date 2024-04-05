import { defineChain } from '../../utils/chain/defineChain.js'

export const mantle = /*#__PURE__*/ defineChain({
  id: 9639,
  name: 'Kartel',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: [''] },
  },
  blockExplorers: {
    default: {
      name: '',
      url: '',
      apiUrl: '',
    },
  }
})
