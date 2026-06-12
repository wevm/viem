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
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 3654913,
    },
  },
  testnet: false,
})
