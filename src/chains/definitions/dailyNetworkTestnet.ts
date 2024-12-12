import { defineChain } from '../../utils/chain/defineChain.js'

export const dailyNetworkTestnet = /*#__PURE__*/ defineChain({
  id: 825,
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
