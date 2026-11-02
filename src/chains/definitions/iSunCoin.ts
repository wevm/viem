import * as Chain from '../../core/Chain.js'

export const iSunCoin = /*#__PURE__*/ Chain.from({
  id: 8017,
  name: 'iSunCoin Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ISC',
    symbol: 'ISC',
  },
  rpcUrls: {
    http: 'https://mainnet.isuncoin.com',
  },
  blockExplorers: {
    name: 'iSunCoin Explorer',
    url: 'https://baifa.io/app/chains/8017',
  },
})
