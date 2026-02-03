import { defineChain } from '../../utils/chain/defineChain.js'

export const sovaSepolia = /*#__PURE__*/ defineChain({
  id: 120_893,
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
