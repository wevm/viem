import * as Chain from '../../core/Chain.js'

export const hardhat = /*#__PURE__*/ Chain.from({
  id: 31_337,
  name: 'Hardhat',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
})
