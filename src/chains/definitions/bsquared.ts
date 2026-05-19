import * as Chain from '../../core/Chain.js'

export const bsquared = /*#__PURE__*/ Chain.define({
  id: 223n,
  name: 'B2',
  nativeCurrency: {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.bsquared.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'blockscout',
      url: 'https://explorer.bsquared.network',
    },
  },
})
