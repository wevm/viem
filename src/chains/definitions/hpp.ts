import * as Chain from '../../core/Chain.js'

export const hpp = /*#__PURE__*/ Chain.from({
  id: 190415,
  name: 'HPP Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet.hpp.io'],
      webSocket: ['wss://mainnet.hpp.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HPP Mainnet Explorer',
      url: 'https://explorer.hpp.io',
    },
  },
  testnet: false,
})
