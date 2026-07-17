import * as Chain from '../../core/Chain.js'

export const bsquared = /*#__PURE__*/ Chain.from({
  id: 223,
  name: 'B2',
  nativeCurrency: {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 18,
  },
  rpcUrls: {
    http: 'https://rpc.bsquared.network',
  },
  blockExplorers: {
    name: 'blockscout',
    url: 'https://explorer.bsquared.network',
  },
})
