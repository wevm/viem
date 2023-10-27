import { defineChain } from '../../utils/chain/defineChain.js'

export const kromaSepolia = /*#__PURE__*/ defineChain({
  id: 2358,
  network: 'kroma-sepolia',
  name: 'Kroma Sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://api.sepolia.kroma.network'],
    },
    public: {
      http: ['https://api.sepolia.kroma.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Kroma Sepolia Explorer',
      url: 'https://blockscout.sepolia.kroma.network',
    },
  },
  testnet: true,
})
