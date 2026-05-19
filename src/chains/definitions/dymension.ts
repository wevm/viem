import * as Chain from '../../core/Chain.js'

export const dymension = /*#__PURE__*/ Chain.define({
  id: 1100n,
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
