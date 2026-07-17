import * as Chain from '../../core/Chain.js'

export const krown = /*#__PURE__*/ Chain.from({
  id: 1983,
  name: 'Krown',
  nativeCurrency: {
    decimals: 18,
    name: 'Krown',
    symbol: 'KROWN',
  },
  rpcUrls: {
    http: 'https://mainnet.krown.network',
  },
  blockExplorers: {
    name: 'Krown Explorer',
    url: 'https://explorer.krown.network',
  },
  testnet: false,
})
