import * as Chain from '../../core/Chain.js'

export const icbNetwork = /*#__PURE__*/ Chain.from({
  id: 73115,
  name: 'ICB Network',
  nativeCurrency: {
    decimals: 18,
    name: 'ICB Native Token',
    symbol: 'ICBX',
  },
  rpcUrls: { http: 'https://rpc1-mainnet.icbnetwork.info' },
  blockExplorers: {
    name: 'ICB Explorer',
    url: 'https://icbscan.io',
    apiUrl: 'https://icbscan.io/api',
  },
  testnet: false,
})
