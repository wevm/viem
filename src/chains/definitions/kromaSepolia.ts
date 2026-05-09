import { defineChain } from '../../utils/chain/defineChain.js'

export const kromaSepolia = /*#__PURE__*/ defineChain({
  id: 2358,
  name: 'Kroma Sepolia',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://api.sepolia.kroma.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Kroma Sepolia Explorer',
      url: 'https://blockscout.sepolia.kroma.network',
      apiUrl: 'https://blockscout.sepolia.kroma.network/api',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 8900914,
    },
  },
  testnet: true,
})
