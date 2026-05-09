import { defineChain } from '../../utils/chain/defineChain.js'

export const dailyNetwork = /*#__PURE__*/ defineChain({
  id: 824,
  name: 'Daily Network Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Daily',
    symbol: 'DLY',
  },
  rpcUrls: {
    default: { http: ['https://rpc.mainnet.dailycrypto.net'] },
  },
  blockExplorers: {
    default: {
      name: 'Daily Mainnet Explorer',
      url: 'https://explorer.mainnet.dailycrypto.net',
    },
  },
  testnet: false,
})
