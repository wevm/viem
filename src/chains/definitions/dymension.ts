import { defineChain } from '../utils.js'

export const dymension = /*#__PURE__*/ defineChain({
  id: 1100,
  name: 'Dymension',
  nativeCurrency: {
    name: 'DYM',
    symbol: 'DYM',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://dymension-evm-rpc.publicnode.com'],
      webSocket: ['wss://dymension-evm-rpc.publicnode.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Dym FYI',
      url: 'https://dym.fyi',
    },
  },
  testnet: false,
})
