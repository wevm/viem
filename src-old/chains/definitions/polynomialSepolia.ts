import { defineChain } from '../../utils/chain/defineChain.js'

export const polynomialSepolia = /*#__PURE__*/ defineChain({
  id: 80008,
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
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
})
