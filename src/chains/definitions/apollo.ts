import * as Chain from '../../core/Chain.js'

export const apollo = /*#__PURE__*/ Chain.define({
  id: 62606n,
  name: 'Apollo',
  nativeCurrency: {
    decimals: 18,
    name: 'Apollo',
    symbol: 'APOLLO',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet-rpc.apolloscan.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Apollo Explorer',
      url: 'https://apolloscan.io',
    },
  },
})
