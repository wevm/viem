import { defineChain } from '../../utils/chain/defineChain.js'

export const polynomial = /*#__PURE__*/ defineChain({
  id: 8008,
  name: 'Polynomial',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.polynomial.fi'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Polynomial Scan',
      url: 'https://polynomialscan.io',
    },
  },
  testnet: false,
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
})
