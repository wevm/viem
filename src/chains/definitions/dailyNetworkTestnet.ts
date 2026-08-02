import * as Chain from '../../core/Chain.js'

export const dailyNetworkTestnet = /*#__PURE__*/ Chain.from({
  id: 825,
  name: 'Daily Network Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Daily',
    symbol: 'DLY',
  },
  rpcUrls: { http: 'https://rpc.testnet.dailycrypto.net' },
  blockExplorers: {
    name: 'Daily Testnet Explorer',
    url: 'https://explorer.testnet.dailycrypto.net',
  },
  testnet: true,
})
