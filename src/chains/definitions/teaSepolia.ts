import { defineChain } from '../../utils/chain/defineChain.js'

export const teaSepolia = /*#__PURE__*/ defineChain({
  id: 842,
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
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
  },
  testnet: true,
})
