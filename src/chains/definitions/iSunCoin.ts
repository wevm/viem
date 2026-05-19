import * as Chain from '../../core/Chain.js'

export const iSunCoin = /*#__PURE__*/ Chain.define({
  id: 8017n,
  name: 'iSunCoin Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ISC',
    symbol: 'ISC',
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet.isuncoin.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'iSunCoin Explorer',
      url: 'https://baifa.io/app/chains/8017',
    },
  },
})
