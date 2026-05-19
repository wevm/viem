import * as Chain from '../../core/Chain.js'

export const unique = /*#__PURE__*/ Chain.define({
  id: 8880n,
  name: 'Unique Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'UNQ',
    symbol: 'UNQ',
  },
  rpcUrls: {
    default: { http: ['https://rpc.unique.network'] },
  },
  blockExplorers: {
    default: {
      name: 'Unique Subscan',
      url: 'https://unique.subscan.io/',
    },
  },
})
