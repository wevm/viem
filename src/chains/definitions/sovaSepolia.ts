import * as Chain from '../../core/Chain.js'

export const sovaSepolia = /*#__PURE__*/ Chain.define({
  id: 120_893n,
  name: 'Sova Network Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Sepolia Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.sova.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Sova Sepolia Explorer',
      url: 'https://explorer.testnet.sova.io',
    },
  },
  testnet: true,
})
