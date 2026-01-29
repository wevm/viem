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
      http: ['https://rpc.chiliz.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Chiliz Explorer',
      url: 'https://scan.chiliz.com',
      apiUrl: 'https://scan.chiliz.com/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 8080847,
    },
  },
})
