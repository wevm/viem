import * as Chain from '../../core/Chain.js'

export const dailyNetworkTestnet = /*#__PURE__*/ Chain.define({
  id: 825n,
  name: 'Daily Network Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Daily',
    symbol: 'DLY',
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.dailycrypto.net'] },
  },
  blockExplorers: {
    default: {
      name: 'Daily Testnet Explorer',
      url: 'https://explorer.testnet.dailycrypto.net',
    },
  },
  testnet: true,
})
