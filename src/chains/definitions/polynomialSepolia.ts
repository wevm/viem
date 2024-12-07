import { defineChain } from '../../utils/chain/defineChain.js'

export const polynomialSepolia = /*#__PURE__*/ defineChain({
  id: 8008,
  name: 'Polynomia Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia.polynomial.fi'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Polynomial Scan',
      url: 'https://sepolia.polynomialscan.io',
    },
  },
  testnet: true,
})
