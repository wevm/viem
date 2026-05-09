import { defineChain } from '../../utils/chain/defineChain.js'

export const morphSepolia = /*#__PURE__*/ defineChain({
  id: 2710,
  name: 'Morph Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.morphl2.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Morph Testnet Explorer',
      url: 'https://explorer-testnet.morphl2.io',
      apiUrl: 'https://explorer-api-testnet.morphl2.io/api',
    },
  },
  testnet: true,
})
