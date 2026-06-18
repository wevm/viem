import * as Chain from '../../core/Chain.js'

export const localhost = /*#__PURE__*/ Chain.from({
  id: 1_337,
  name: 'Localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
})
