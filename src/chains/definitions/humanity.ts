import * as Chain from '../../core/Chain.js'

export const humanity = /*#__PURE__*/ Chain.from({
  id: 6_985_385,
  name: 'Humanity',
  nativeCurrency: {
    name: 'H',
    symbol: 'H',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://humanity-mainnet.g.alchemy.com/public',
  },
  blockExplorers: {
    name: 'Humanity Mainnet Explorer',
    url: 'https://humanity-mainnet.explorer.alchemy.com',
    apiUrl: 'https://humanity-mainnet.explorer.alchemy.com/api',
  },
  testnet: false,
})
