import { defineChain } from '../../utils/chain/defineChain.js'

export const chiliz = /*#__PURE__*/ defineChain({
  id: 88_888,
  name: 'Chiliz Chain',
  network: 'chiliz-chain',
  nativeCurrency: {
    decimals: 18,
    name: 'CHZ',
    symbol: 'CHZ',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.ankr.com/chiliz', 'https://chiliz.publicnode.com'],
    },
    public: {
      http: ['https://rpc.ankr.com/chiliz', 'https://chiliz.publicnode.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Chiliz Explorer',
      url: 'https://scan.chiliz.com',
    },
  },
})
