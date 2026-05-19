import * as Chain from '../../core/Chain.js'

export const hppSepolia = /*#__PURE__*/ Chain.define({
  id: 181228n,
  name: 'HPP Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://testnet.hpp.io'],
      webSocket: ['wss://testnet.hpp.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HPP Sepolia Explorer',
      url: 'https://sepolia-explorer.hpp.io',
    },
  },
  testnet: true,
})
