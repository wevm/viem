import { defineChain } from '../../utils/chain/defineChain.js'

export const morph = /*#__PURE__*/ defineChain({
  id: 2818,
  name: 'Morph',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.morphl2.io'],
      webSocket: ['wss://rpc.morphl2.io:8443'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Morph Explorer',
      url: 'https://explorer.morphl2.io',
    },
  },
  testnet: false,
})
