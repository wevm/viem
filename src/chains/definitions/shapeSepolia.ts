import { defineChain } from '../../utils/chain/defineChain.js'

export const shapeSepolia = /*#__PURE__*/ defineChain({
  id: 11_011,
  name: 'Shape Sepolia Testnet',
  nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://sepolia.shape.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'blockscout',
      url: 'https://shape-sepolia-explorer.alchemy.com',
      apiUrl: 'https://shape-sepolia-explorer.alchemy.com/api/v2',
    },
  },
})
