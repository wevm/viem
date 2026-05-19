import * as Chain from '../../core/Chain.js'

export const haustTestnet = /*#__PURE__*/ Chain.define({
  id: 1_523_903_251n,
  name: 'Haust Network Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HAUST',
    symbol: 'HAUST',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.haust.app'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Haust Network Testnet Explorer',
      url: 'https://explorer-testnet.haust.app',
    },
  },
  testnet: true,
})
