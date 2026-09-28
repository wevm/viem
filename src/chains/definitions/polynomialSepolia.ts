import * as Chain from '../../core/Chain.js'

export const polynomialSepolia = /*#__PURE__*/ Chain.from({
  id: 80008,
  name: 'Polynomia Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    http: 'https://rpc.sepolia.polynomial.fi',
  },
  blockExplorers: {
    name: 'Polynomial Scan',
    url: 'https://sepolia.polynomialscan.io',
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
})
