import * as Chain from '../../core/Chain.js'

export const haustTestnet = /*#__PURE__*/ Chain.from({
  id: 1_523_903_251,
  name: 'Haust Network Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HAUST',
    symbol: 'HAUST',
  },
  rpcUrls: {
    http: 'https://rpc-testnet.haust.app',
  },
  blockExplorers: {
    name: 'Haust Network Testnet Explorer',
    url: 'https://explorer-testnet.haust.app',
  },
  testnet: true,
})
