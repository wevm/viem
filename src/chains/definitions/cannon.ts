import * as Chain from '../../core/Chain.js'

export const cannon = /*#__PURE__*/ Chain.define({
  id: 13_370n,
  name: 'Cannon',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
})
