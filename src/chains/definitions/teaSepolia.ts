import { defineChain } from '../../utils/chain/defineChain.js'

export const teaSepolia = /*#__PURE__*/ defineChain({
  id: 10_218,
  name: 'Tea Sepolia',
  nativeCurrency: { name: 'Sepolia Tea', symbol: 'TEA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://tea-sepolia.g.alchemy.com/public'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Tea Sepolia Explorer',
      url: 'https://sepolia.tea.xyz',
    },
  },
  testnet: true,
})
