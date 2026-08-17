import * as Chain from '../../core/Chain.js'

export const polynomial = /*#__PURE__*/ Chain.from({
  id: 8008,
  name: 'Polynomial',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    http: 'https://rpc.polynomial.fi',
  },
  blockExplorers: {
    name: 'Polynomial Scan',
    url: 'https://polynomialscan.io',
  },
  testnet: false,
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
    },
  },
})
