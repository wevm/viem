import * as Chain from '../../core/Chain.js'

export const localhost = /*#__PURE__*/ Chain.define({
  id: 1_337n,
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
