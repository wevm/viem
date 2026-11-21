import { defineChain } from '../../utils/chain/defineChain.js'

export const ynxTestnet = /*#__PURE__*/ defineChain({
  id: 6_423,
  name: 'YNX Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'YNXT',
    symbol: 'YNXT',
  },
  rpcUrls: {
    default: {
      http: ['https://evm.ynxweb4.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'YNX Explorer',
      url: 'https://explorer.ynxweb4.com',
    },
  },
  testnet: true,
})
