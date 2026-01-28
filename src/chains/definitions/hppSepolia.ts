import { defineChain } from '../../utils/chain/defineChain.js'

export const hppSepolia = /*#__PURE__*/ defineChain({
  id: 181228,
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
