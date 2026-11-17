import * as Chain from '../../core/Chain.js'

export const dailyNetwork = /*#__PURE__*/ Chain.from({
  id: 824,
  name: 'Daily Network Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Daily',
    symbol: 'DLY',
  },
  rpcUrls: { http: 'https://rpc.mainnet.dailycrypto.net' },
  blockExplorers: {
    name: 'Daily Mainnet Explorer',
    url: 'https://explorer.mainnet.dailycrypto.net',
  },
  testnet: false,
})
