import { defineChain } from '../../utils/chain/defineChain.js'

export const xoneMainnet = /*#__PURE__*/ defineChain({
  id: 3721,
  name: 'Xone Chain Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'XOC',
    symbol: 'XOC',
  },
  rpcUrls: {
    default: { http: ['https://rpc.xone.org'] },
  },
  blockExplorers: {
    default: {
      name: 'Xone Mainnet Explorer',
      url: 'https://xonescan.com',
      apiUrl: 'http://api.xonescan.com/api',
    },
  },
  testnet: false,
})
