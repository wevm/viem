import * as Chain from '../../core/Chain.js'

export const evmos = /*#__PURE__*/ Chain.define({
  id: 9_001n,
  name: 'Evmos',
  nativeCurrency: {
    decimals: 18,
    name: 'Evmos',
    symbol: 'EVMOS',
  },
  rpcUrls: {
    default: { http: ['https://eth.bd.evmos.org:8545'] },
  },
  blockExplorers: {
    default: {
      name: 'Evmos Block Explorer',
      url: 'https://escan.live',
    },
  },
})
